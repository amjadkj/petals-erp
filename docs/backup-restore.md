# Database Backup & Disaster Recovery Guide

This document defines the production backup, disaster recovery (DR), and tested restoration procedure for the Petals Child Development Centre ERP.

---

## 1. Objectives & SLA Targets

- **Recovery Point Objective (RPO)**: $\le 15\text{ minutes}$ (continuous PostgreSQL WAL archiving / hourly differential snapshots, Redis AOF `everysec`).
- **Recovery Time Objective (RTO)**: $\le 30\text{ minutes}$ (full automated restore from encrypted cold storage).
- **Retention Policy**:
  - Daily backups: Retained for 30 days.
  - Weekly backups: Retained for 12 weeks.
  - Monthly archives: Retained for 7 years (compliance with clinical/pediatric record regulations).

---

## 2. Automated PostgreSQL Backup Procedure

### Script: `scripts/backup-db.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/petals"
BACKUP_FILE="${BACKUP_DIR}/petals_erp_${TIMESTAMP}.dump"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL backup for petals_erp..."

# 1. Execute custom-format compressed backup (-Fc) as migrator/superuser
PGPASSWORD="${POSTGRES_MIGRATOR_PASSWORD}" pg_dump \
  -h "${DB_HOST:-localhost}" \
  -p "${DB_PORT:-5432}" \
  -U "${POSTGRES_MIGRATOR_USER:-petals_migrator}" \
  -d "${POSTGRES_DB:-petals_erp}" \
  -F c \
  -b \
  -v \
  -f "${BACKUP_FILE}"

echo "[$(date)] Backup completed: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# 2. Encrypt backup with AES-256-CBC
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in "${BACKUP_FILE}" \
  -out "${ENCRYPTED_FILE}" \
  -pass "env:BACKUP_ENCRYPTION_KEY"

rm -f "${BACKUP_FILE}"

# 3. Upload to cloud storage (S3 / GCS)
aws s3 cp "${ENCRYPTED_FILE}" "s3://${BACKUP_S3_BUCKET}/db/${TIMESTAMP}.dump.enc" --sse aws:kms

echo "[$(date)] Backup uploaded and encrypted: s3://${BACKUP_S3_BUCKET}/db/${TIMESTAMP}.dump.enc"
```

---

## 3. Redis Persistence & Backup

Redis operates in hybrid persistence mode:
1. **AOF (`appendonly yes`, `appendfsync everysec`)**: Guarantees at most 1 second of cached token bucket & session state loss.
2. **RDB Snapshots (`save 60 1`)**: Point-in-time snapshot dumped to `/data/dump.rdb`.
3. **Eviction Policy**: `volatile-lru` with `maxmemory 512mb` ensures cache keys (schedule, dashboard, permissions) expire gracefully while active sessions and lockouts persist.

### Redis Backup Command:
```bash
# Trigger point-in-time BGSAVE
redis-cli -a "${REDIS_PASSWORD}" BGSAVE
# Copy snapshot to backup volume
cp /var/lib/redis/dump.rdb "/var/backups/petals/redis_${TIMESTAMP}.rdb"
```

---

## 4. Step-by-Step Restoration Checklist

### Phase A: Pre-Restoration Sanity Checks
- [ ] Notify stakeholders and enable maintenance mode (API returns 503 Service Unavailable).
- [ ] Stop API containers to prevent active database connections:
  ```bash
  docker compose -f docker-compose.prod.yml stop api
  ```
- [ ] Download and decrypt target backup artifact:
  ```bash
  aws s3 cp "s3://${BACKUP_S3_BUCKET}/db/${TARGET_TIMESTAMP}.dump.enc" ./restore.dump.enc
  openssl enc -d -aes-256-cbc -pbkdf2 \
    -in ./restore.dump.enc \
    -out ./restore.dump \
    -pass "env:BACKUP_ENCRYPTION_KEY"
  ```
- [ ] Verify dump file header:
  ```bash
  pg_restore -l ./restore.dump | head -n 20
  ```

---

### Phase B: Database Restore Execution
- [ ] Terminate any remaining open connections to `petals_erp`:
  ```sql
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'petals_erp' AND pid <> pg_backend_pid();
  ```
- [ ] Restore schema, data, and constraints using `pg_restore`:
  ```bash
  PGPASSWORD="${POSTGRES_MIGRATOR_PASSWORD}" pg_restore \
    -h "${DB_HOST:-localhost}" \
    -p "${DB_PORT:-5432}" \
    -U "${POSTGRES_MIGRATOR_USER:-petals_migrator}" \
    -d "${POSTGRES_DB:-petals_erp}" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -v ./restore.dump
  ```
- [ ] Ensure `app_user` permissions and RLS policies are intact:
  ```bash
  pnpm --filter @petals/api db:migrate:deploy
  ```

---

### Phase C: Post-Restoration Verification Queries

Run the following verification queries to guarantee data consistency and security:

1. **Table Counts Verification**:
   ```sql
   SELECT
     (SELECT count(*) FROM branches) AS branch_count,
     (SELECT count(*) FROM users) AS user_count,
     (SELECT count(*) FROM clients) AS client_count,
     (SELECT count(*) FROM appointments) AS appointment_count,
     (SELECT count(*) FROM invoices) AS invoice_count;
   ```
2. **Row-Level Security (RLS) Verification**:
   ```sql
   -- Verify RLS is enabled and forced on all sensitive tables
   SELECT tablename, rowsecurity, forcerowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('clients', 'leads', 'appointments', 'invoices', 'expenses', 'attendance_records');
   -- Must return rowsecurity = true and forcerowsecurity = true for all rows.
   ```
3. **Branch Isolation Verification via `app_user`**:
   ```sql
   SET ROLE app_user;
   SELECT set_config('app.branch_ids', '', true), set_config('app.all_branches', 'false', true);
   -- Must return 0 rows (fails closed)
   SELECT count(*) FROM clients;
   RESET ROLE;
   ```
4. **Sequence & Constraint Health Check**:
   ```sql
   -- Verify btree_gist extension and overlap exclusion
   SELECT conname, contype FROM pg_constraint WHERE conname = 'no_therapist_overlap';
   ```

---

### Phase D: Service Resumption
- [ ] Start API services:
  ```bash
  docker compose -f docker-compose.prod.yml up -d api
  ```
- [ ] Perform live health check:
  ```bash
  curl -fsS http://localhost:3000/health
  # Response must be: {"status":"ok","database":"ok","redis":"ok",...}
  ```
- [ ] Remove maintenance window and notify clinic directors.

