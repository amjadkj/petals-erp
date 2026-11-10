import { PrismaClient, RoleKey } from '@prisma/client';
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
    await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name, description: r.description, isSystem: r.isSystem },
      create: r,
    });
  }
  console.log('Roles seeded.');

  // 2. Primary Branch
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
