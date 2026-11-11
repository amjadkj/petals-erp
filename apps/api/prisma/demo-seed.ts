import {
  PrismaClient,
  RoleKey,
  ClientStatus,
  AppointmentStatus,
  PlanStatus,
  GoalTerm,
  GoalStatus,
  SubgoalFrequency,
  InvoiceStatus,
  RevenueCategory,
  PaymentMethod,
  LeadStage,
} from '@prisma/client';
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

async function runDemoSeed() {
  console.log('🌱 Checking environment before running demo seed...');

  // 1. STRICT PRODUCTION SAFEGUARD
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '❌ CRITICAL ERROR: Demo seed is strictly forbidden from executing in production (NODE_ENV=production)!',
    );
    process.exit(1);
  }

  console.log('🚀 Running Petals ERP Demo Data Seed (Staging / Development Only)...');

  // 2. Fetch or verify Branch
  const branch = await prisma.branch.findFirst({
    where: { isActive: true },
  });

  if (!branch) {
    throw new Error('No active branch found. Please run "pnpm db:seed" first to create roles and branches.');
  }

  // 3. Clean up any previous demo data to ensure idempotency
  const existingDemoClients = await prisma.client.findMany({
    where: { clientCode: { startsWith: 'DEMO-' } },
    select: { id: true },
  });
  const demoClientIds = existingDemoClients.map((c) => c.id);

  if (demoClientIds.length > 0) {
    const plans = await prisma.treatmentPlan.findMany({
      where: { clientId: { in: demoClientIds } },
      select: { id: true },
    });
    const planIds = plans.map((p) => p.id);

    const goals = await prisma.goal.findMany({
      where: { planId: { in: planIds } },
      select: { id: true },
    });
    const goalIds = goals.map((g) => g.id);

    await prisma.progressEntry.deleteMany({ where: { subgoal: { goalId: { in: goalIds } } } });
    await prisma.subgoal.deleteMany({ where: { goalId: { in: goalIds } } });
    await prisma.goal.deleteMany({ where: { id: { in: goalIds } } });
    await prisma.appointment.deleteMany({ where: { clientId: { in: demoClientIds } } });
    await prisma.payment.deleteMany({ where: { invoice: { clientId: { in: demoClientIds } } } });
    await prisma.invoice.deleteMany({ where: { clientId: { in: demoClientIds } } });
    await prisma.treatmentPlan.deleteMany({ where: { id: { in: planIds } } });
    await prisma.clientGuardian.deleteMany({ where: { clientId: { in: demoClientIds } } });
    await prisma.client.deleteMany({ where: { id: { in: demoClientIds } } });
  }

  await prisma.lead.deleteMany({
    where: { contact: { in: ['+919876543211', '+919876543212'] } },
  });

  // 4. Resolve Roles
  const therapistRole = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.THERAPIST } });
  const parentRole = await prisma.role.findUniqueOrThrow({ where: { key: RoleKey.PARENT } });

  const defaultPassword = await hashPassword('DemoPass123!');

  // 4. Create Demo Therapist
  const therapistUser = await prisma.user.upsert({
    where: { email: 'demo.therapist@petals.com' },
    update: {},
    create: {
      email: 'demo.therapist@petals.com',
      name: 'Ms. Sarah Thomas (SLP)',
      phone: '+919876543201',
      passwordHash: defaultPassword,
      roleId: therapistRole.id,
      isActive: true,
    },
  });

  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: therapistUser.id, branchId: branch.id } },
    update: {},
    create: { userId: therapistUser.id, branchId: branch.id, isPrimary: true },
  });

  let department = await prisma.department.findFirst({ where: { code: 'ST' } });
  if (!department) {
    department = await prisma.department.findFirst();
  }
  if (!department) {
    department = await prisma.department.create({
      data: { name: 'Speech Therapy', code: 'ST' },
    });
  }

  const employee = await prisma.employee.upsert({
    where: { userId: therapistUser.id },
    update: {},
    create: {
      userId: therapistUser.id,
      employeeCode: 'EMP-DEMO-01',
      designation: 'Speech-Language Pathologist',
      departmentId: department.id,
      joinedOn: new Date('2024-01-15'),
      salary: 45000,
    },
  });

  // 5. Create Demo Parent
  const parentUser = await prisma.user.upsert({
    where: { email: 'demo.parent@petals.com' },
    update: {},
    create: {
      email: 'demo.parent@petals.com',
      name: 'Priya Nair (Parent)',
      phone: '+919876543202',
      passwordHash: defaultPassword,
      roleId: parentRole.id,
      isActive: true,
    },
  });

  await prisma.userBranch.upsert({
    where: { userId_branchId: { userId: parentUser.id, branchId: branch.id } },
    update: {},
    create: { userId: parentUser.id, branchId: branch.id, isPrimary: true },
  });

  // 6. Create Demo Clients
  const demoClients = [
    {
      code: 'DEMO-2026-0001',
      name: 'Aarav Nair',
      dob: new Date('2021-04-12'),
      status: ClientStatus.ACTIVE,
      caseHistory: 'Speech delay noted at 24 months. Difficulty with expressive language and phonology.',
    },
    {
      code: 'DEMO-2026-0002',
      name: 'Diya Menon',
      dob: new Date('2020-08-20'),
      status: ClientStatus.ACTIVE,
      caseHistory: 'Sensory processing differences and fine motor coordination challenges.',
    },
    {
      code: 'DEMO-2026-0003',
      name: 'Rohan Varma',
      dob: new Date('2019-11-05'),
      status: ClientStatus.ON_HOLD,
      caseHistory: 'Attended 24 occupational therapy sessions. Paused for school evaluation.',
    },
  ];

  for (let i = 0; i < demoClients.length; i++) {
    const cData = demoClients[i];
    const client = await prisma.client.upsert({
      where: { branchId_clientCode: { branchId: branch.id, clientCode: cData.code } },
      update: {},
      create: {
        branchId: branch.id,
        clientCode: cData.code,
        name: cData.name,
        dob: cData.dob,
        status: cData.status,
        caseHistory: cData.caseHistory,
      },
    });

    // Link Guardian
    const guardian = await prisma.guardian.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: {
        userId: parentUser.id,
        name: parentUser.name,
        whatsappNo: parentUser.phone,
        whatsappConsent: true,
        emailConsent: true,
      },
    });

    await prisma.clientGuardian.upsert({
      where: { clientId_guardianId: { clientId: client.id, guardianId: guardian.id } },
      update: {},
      create: {
        clientId: client.id,
        guardianId: guardian.id,
        relation: 'Mother',
        isPrimary: true,
        canViewOverview: true,
        canViewAssessment: true,
        canViewPaymentPlan: true,
        canViewReports: true,
      },
    });

    // Create Treatment Plan
    const plan = await prisma.treatmentPlan.create({
      data: {
        clientId: client.id,
        departmentId: department.id,
        therapistId: employee.id,
        sessionsPerWeek: 2,
        sessionMinutes: 45,
        feePerSession: 800,
        startDate: new Date('2026-01-01'),
        status: PlanStatus.ACTIVE,
      },
    });

    // Goals & Subgoals
    const goal = await prisma.goal.create({
      data: {
        planId: plan.id,
        term: GoalTerm.SHORT,
        title: 'Expressive vocabulary expansion',
        description: 'Improve expressive vocabulary to 50+ two-word phrases.',
        status: GoalStatus.IN_PROGRESS,
        targetDate: new Date('2026-12-31'),
      },
    });

    await prisma.subgoal.create({
      data: {
        goalId: goal.id,
        description: 'Use action words (eat, play, go) during interactive play.',
        frequency: SubgoalFrequency.WEEKLY,
        status: GoalStatus.IN_PROGRESS,
      },
    });

    // Appointments (Non-overlapping staggered time slots)
    const slotStart = new Date();
    slotStart.setHours(9 + i * 2, 0, 0, 0); // 9:00, 11:00, 13:00
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(9 + i * 2, 45, 0, 0);

    await prisma.appointment.create({
      data: {
        branchId: branch.id,
        clientId: client.id,
        therapistId: employee.id,
        startsAt: slotStart,
        endsAt: slotEnd,
        status: AppointmentStatus.ATTENDED,
      },
    });

    // Invoices & Payments
    const invoice = await prisma.invoice.create({
      data: {
        branchId: branch.id,
        clientId: client.id,
        invoiceNo: `INV-DEMO-${cData.code}`,
        amount: 3200,
        status: InvoiceStatus.PAID,
        revenueCategory: RevenueCategory.CLINICAL_THERAPY,
        issuedOn: new Date(),
        dueOn: new Date(),
      },
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        receiptNo: `RCP-DEMO-${cData.code}`,
        amount: 3200,
        method: PaymentMethod.UPI,
      },
    });
  }

  // 7. Create Demo Leads
  const demoLeads = [
    {
      name: 'Anil Kumar',
      contact: '+919876543211',
      stage: LeadStage.NEW,
      concern: 'Query regarding behavioral therapy for 4-year-old',
    },
    {
      name: 'Meera Joseph',
      contact: '+919876543212',
      stage: LeadStage.ASSESSMENT_SCHEDULED,
      concern: 'Speech assessment appointment requested',
    },
  ];

  for (const l of demoLeads) {
    await prisma.lead.create({
      data: {
        branchId: branch.id,
        name: l.name,
        contact: l.contact,
        stage: l.stage,
        concern: l.concern,
      },
    });
  }

  console.log('✅ Demo seed completed successfully!');
  console.log(`   - Demo Therapist: demo.therapist@petals.com (Password: DemoPass123!)`);
  console.log(`   - Demo Parent: demo.parent@petals.com (Password: DemoPass123!)`);
  console.log(`   - Created 3 clients, treatment plans, goals, appointments, invoices & payments.`);
  console.log(`   - Created 2 pipeline leads.`);
}

runDemoSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Demo seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
