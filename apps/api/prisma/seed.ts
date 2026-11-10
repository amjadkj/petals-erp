import { PrismaClient, RoleKey, AppModule, PermissionAction } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

// All actions
const ALL_ACTIONS: PermissionAction[] = [
  PermissionAction.CREATE,
  PermissionAction.UPDATE,
  PermissionAction.VIEW,
  PermissionAction.VIEW_ALL,
  PermissionAction.DELETE,
];

// All modules
const ALL_MODULES = Object.values(AppModule);

interface RoleSeedConfig {
  modules: Partial<Record<AppModule, { enabled: boolean; actions?: PermissionAction[] }>>;
  defaultAll?: boolean;
}

const ROLE_PERMISSIONS_CONFIG: Record<RoleKey, RoleSeedConfig> = {
  [RoleKey.DIRECTOR]: {
    defaultAll: true,
    modules: {},
  },
  [RoleKey.MANAGER]: {
    modules: {
      [AppModule.DASHBOARD]: { enabled: true, actions: [PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.APPOINTMENTS]: { enabled: true, actions: ALL_ACTIONS },
      [AppModule.CLIENTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.PROFILE_OVERVIEW]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.PROFILE_DOCUMENTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.PROFILE_PAYMENT_PLAN]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.COMMUNICATION]: { enabled: true, actions: ALL_ACTIONS },
      [AppModule.FINANCIAL]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.SCHEDULE_PLANNING]: { enabled: true, actions: ALL_ACTIONS },
      [AppModule.HRMS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.EMPLOYEES]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      [AppModule.LEADS]: { enabled: true, actions: ALL_ACTIONS },
      [AppModule.REPORTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW, PermissionAction.VIEW_ALL] },
      // Disabled clinical and financial P&L
      [AppModule.FINANCIAL_PNL]: { enabled: false },
      [AppModule.EMPLOYEE_SALARY]: { enabled: false },
      [AppModule.PROFILE_ASSESSMENT]: { enabled: false },
      [AppModule.PROFILE_PROGRESS]: { enabled: false },
      [AppModule.PROFILE_REPORTS]: { enabled: false },
      [AppModule.PROFILE_SESSIONS]: { enabled: false },
      [AppModule.ROLE_ACCESS]: { enabled: false },
    },
  },
  [RoleKey.THERAPIST]: {
    modules: {
      [AppModule.DASHBOARD]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.APPOINTMENTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW] },
      [AppModule.CLIENTS]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_OVERVIEW]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_PAYMENT_PLAN]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW] },
      [AppModule.PROFILE_ASSESSMENT]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.VIEW] },
      [AppModule.PROFILE_PROGRESS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.VIEW] },
      [AppModule.PROFILE_REPORTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW] },
      [AppModule.PROFILE_SESSIONS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW] },
      [AppModule.PROFILE_DOCUMENTS]: { enabled: true, actions: [PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.VIEW] },
      [AppModule.HRMS]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.REPORTS]: { enabled: true, actions: [PermissionAction.VIEW] },
    },
  },
  [RoleKey.PARENT]: {
    modules: {
      [AppModule.DASHBOARD]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.APPOINTMENTS]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.CLIENTS]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_OVERVIEW]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_PAYMENT_PLAN]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_ASSESSMENT]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_REPORTS]: { enabled: true, actions: [PermissionAction.VIEW] },
      [AppModule.PROFILE_SESSIONS]: { enabled: true, actions: [PermissionAction.VIEW] },
    },
  },
};

async function main() {
  console.log('Seeding Petals ERP database...');

  // 1. System Roles
  const roles = [
    { key: RoleKey.DIRECTOR, name: 'Director', description: 'Complete system access and configuration control', isSystem: true },
    { key: RoleKey.MANAGER, name: 'Manager', description: 'Branch management and administrative operations', isSystem: true },
    { key: RoleKey.THERAPIST, name: 'Therapist', description: 'Clinical assessments, treatment plans, and appointments', isSystem: true },
    { key: RoleKey.PARENT, name: 'Parent', description: 'Guardian portal access for appointments and reports', isSystem: true },
  ];

  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, isSystem: r.isSystem },
      create: r,
    });

    const config = ROLE_PERMISSIONS_CONFIG[r.key];

    // Seed RoleModules and RolePermissions
    for (const mod of ALL_MODULES) {
      const isDirector = config.defaultAll;
      const modConfig = config.modules[mod];
      const enabled = isDirector ? true : (modConfig?.enabled ?? false);

      await prisma.roleModule.upsert({
        where: {
          roleId_module: {
            roleId: roleRecord.id,
            module: mod,
          },
        },
        update: { enabled },
        create: {
          roleId: roleRecord.id,
          module: mod,
          enabled,
        },
      });

      for (const act of ALL_ACTIONS) {
        let allowed = false;
        if (isDirector) {
          allowed = true;
        } else if (enabled && modConfig?.actions) {
          allowed = modConfig.actions.includes(act);
        }

        await prisma.rolePermission.upsert({
          where: {
            roleId_module_action: {
              roleId: roleRecord.id,
              module: mod,
              action: act,
            },
          },
          update: { allowed },
          create: {
            roleId: roleRecord.id,
            module: mod,
            action: act,
            allowed,
          },
        });
      }
    }
  }
  console.log('Roles, modules, and default permissions seeded successfully.');

  // 2. Departments
  const departments = [
    { name: 'Speech Therapy', code: 'ST' },
    { name: 'Occupational Therapy', code: 'OT' },
    { name: 'Physiotherapy', code: 'PT' },
    { name: 'ABA / Behavioral Therapy', code: 'ABA' },
    { name: 'Child Psychotherapy', code: 'CP' },
  ];
  for (const d of departments) {
    await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: d,
    });
  }
  console.log('Seeded departments:', departments.map((d) => d.code).join(', '));

  // 3. Primary Branch
  const mainBranch = await prisma.branch.upsert({
    where: { code: 'KOC-01' },
    update: {},
    create: {
      name: 'Kochi Main Branch',
      code: 'KOC-01',
      city: 'Kochi',
      address: 'Petals Child Development Centre, Ernakulam, Kerala',
      phone: '+914841234567',
      timezone: 'Asia/Kolkata',
      isActive: true,
    },
  });
  console.log('Primary branch seeded:', mainBranch.name);

  // 3. First Director User
  const directorRole = await prisma.role.findUniqueOrThrow({
    where: { key: RoleKey.DIRECTOR },
  });

  const defaultPasswordHash = await hashPassword('ChangeMe123!');

  const director = await prisma.user.upsert({
    where: { email: 'director@petals.com' },
    update: {},
    create: {
      email: 'director@petals.com',
      name: 'Dr. Director',
      phone: '+919876543210',
      passwordHash: defaultPasswordHash,
      roleId: directorRole.id,
      isActive: true,
      twoFactorEnabled: false,
    },
  });

  // Assign Director to Main Branch
  await prisma.userBranch.upsert({
    where: {
      userId_branchId: {
        userId: director.id,
        branchId: mainBranch.id,
      },
    },
    update: { isPrimary: true },
    create: {
      userId: director.id,
      branchId: mainBranch.id,
      isPrimary: true,
    },
  });
  console.log('Director user seeded with default password (ChangeMe123!).');

  console.log('Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
