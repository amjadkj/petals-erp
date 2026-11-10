import { Test, TestingModule } from '@nestjs/testing';
import { LeadService } from './lead.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { LeadStage, RoleKey } from '@petals/types';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

describe('LeadService', () => {
  let service: LeadService;
  let prisma: any;

  const mockBranch = {
    id: 'branch-1',
    name: 'Kochi Central',
    code: 'KC',
  };

  const mockLead = {
    id: 'lead-1',
    branchId: 'branch-1',
    name: 'Rahul Sharma',
    contact: '+919876543210',
    childAge: 5,
    concern: 'Speech delay and poor attention',
    source: 'Google Search',
    ownerId: 'employee-1',
    stage: LeadStage.NEW,
    nextFollowUp: new Date('2026-11-15'),
    notes: 'Parent prefers evening sessions',
    createdAt: new Date('2026-11-01'),
    updatedAt: new Date('2026-11-01'),
    branch: mockBranch,
    owner: { id: 'employee-1', employeeCode: 'EMP-01', user: { name: 'Dr. Neha' } },
    client: null,
  };

  beforeEach(async () => {
    prisma = {
      lead: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      branch: {
        findUnique: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      client: {
        create: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      role: {
        findUniqueOrThrow: jest.fn(),
      },
      guardian: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      clientGuardian: {
        create: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
      notification: {
        create: jest.fn(),
      },
      userBranch: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };
    prisma.unscopedClient = prisma;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<LeadService>(LeadService);
  });

  describe('create', () => {
    it('creates a new lead with default stage NEW', async () => {
      prisma.branch.findUnique.mockResolvedValue(mockBranch);
      prisma.lead.create.mockResolvedValue(mockLead);

      const result = await service.create(
        {
          branchId: 'branch-1',
          name: 'Rahul Sharma',
          contact: '+919876543210',
          childAge: 5,
        },
        'user-1',
        RoleKey.DIRECTOR,
        ['branch-1'],
      );

      expect(result).toEqual(mockLead);
      expect(prisma.lead.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            branchId: 'branch-1',
            name: 'Rahul Sharma',
            stage: LeadStage.NEW,
          }),
        }),
      );
    });

    it('rejects creation in unassigned branch for Manager', async () => {
      await expect(
        service.create(
          {
            branchId: 'branch-2',
            name: 'Rahul Sharma',
            contact: '+919876543210',
          },
          'user-1',
          RoleKey.MANAGER,
          ['branch-1'],
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects direct creation with stage CONVERTED', async () => {
      await expect(
        service.create(
          {
            branchId: 'branch-1',
            name: 'Rahul Sharma',
            contact: '+919876543210',
            stage: LeadStage.CONVERTED,
          },
          'user-1',
          RoleKey.DIRECTOR,
          ['branch-1'],
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('rejects plain stage update to CONVERTED', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLead);

      await expect(
        service.update(
          'lead-1',
          { stage: LeadStage.CONVERTED },
          'user-1',
          RoleKey.DIRECTOR,
          ['branch-1'],
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('updates lead notes and stage to CONTACTED', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLead);
      prisma.lead.update.mockResolvedValue({
        ...mockLead,
        stage: LeadStage.CONTACTED,
        notes: 'Contacted via phone',
      });

      const result = await service.update(
        'lead-1',
        { stage: LeadStage.CONTACTED, notes: 'Contacted via phone' },
        'user-1',
        RoleKey.DIRECTOR,
        ['branch-1'],
      );

      expect(result.stage).toBe(LeadStage.CONTACTED);
      expect(result.notes).toBe('Contacted via phone');
    });
  });

  describe('getConvertPreview', () => {
    it('returns prefilled draft from lead details', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLead);

      const preview = await service.getConvertPreview(
        'lead-1',
        RoleKey.DIRECTOR,
        ['branch-1'],
      );

      expect(preview.leadId).toBe('lead-1');
      expect(preview.branchId).toBe('branch-1');
      expect(preview.name).toBe('Rahul Sharma');
      expect(preview.guardianPhone).toBe('+919876543210');
      expect(preview.guardianWhatsApp).toBe('+919876543210');
      expect(preview.caseHistory).toContain('Source: Google Search');
      expect(preview.caseHistory).toContain('Concern: Speech delay');
      // 5 years old -> estimated dob should have birthYear
      const currentYear = new Date().getFullYear();
      expect(preview.dob).toBe(`${currentYear - 5}-01-01`);
    });

    it('rejects preview if lead is already converted', async () => {
      prisma.lead.findUnique.mockResolvedValue({
        ...mockLead,
        stage: LeadStage.CONVERTED,
      });

      await expect(
        service.getConvertPreview('lead-1', RoleKey.DIRECTOR, ['branch-1']),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('convert', () => {
    it('executes atomic conversion creating client, guardian, link, audit log, and welcome notification', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLead);
      prisma.client.count.mockResolvedValue(12);
      prisma.client.create.mockResolvedValue({
        id: 'client-1',
        clientCode: 'KC-2026-0013',
        name: 'Rahul Sharma',
        branchId: 'branch-1',
      });
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.role.findUniqueOrThrow.mockResolvedValue({ id: 'role-parent' });
      prisma.user.create.mockResolvedValue({ id: 'user-parent' });
      prisma.guardian.findUnique.mockResolvedValue(null);
      prisma.guardian.create.mockResolvedValue({ id: 'guardian-1' });
      prisma.clientGuardian.create.mockResolvedValue({
        clientId: 'client-1',
        guardianId: 'guardian-1',
      });
      prisma.lead.update.mockResolvedValue({
        ...mockLead,
        stage: LeadStage.CONVERTED,
      });
      prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });
      prisma.notification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.convert(
        'lead-1',
        {
          name: 'Rahul Sharma',
          dob: '2021-01-01',
          gender: 'MALE',
          caseHistory: 'Speech delay',
          guardianName: 'Ajay Sharma',
          guardianPhone: '+919876543210',
          guardianConsent: true,
        },
        'user-director',
        RoleKey.DIRECTOR,
        ['branch-1'],
      );

      expect(result.client.id).toBe('client-1');
      expect(result.client.clientCode).toBe('KC-2026-0013');
      expect(prisma.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            leadId: 'lead-1',
            clientCode: 'KC-2026-0013',
            name: 'Rahul Sharma',
          }),
        }),
      );
      expect(prisma.clientGuardian.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isPrimary: true,
            clientId: 'client-1',
            guardianId: 'guardian-1',
          }),
        }),
      );
      expect(prisma.lead.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'lead-1' },
          data: { stage: LeadStage.CONVERTED },
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'CONVERT_LEAD',
            entity: 'Lead',
            entityId: 'lead-1',
          }),
        }),
      );
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'WELCOME_CONSENT',
            userId: 'user-parent',
          }),
        }),
      );
    });

    it('rejects double conversion with 409 Conflict', async () => {
      prisma.lead.findUnique.mockResolvedValue({
        ...mockLead,
        stage: LeadStage.CONVERTED,
      });

      await expect(
        service.convert(
          'lead-1',
          {
            name: 'Rahul Sharma',
            dob: '2021-01-01',
            guardianName: 'Ajay Sharma',
            guardianPhone: '+919876543210',
          },
          'user-director',
          RoleKey.DIRECTOR,
          ['branch-1'],
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('rejects conversion in unassigned branch for Manager', async () => {
      prisma.lead.findUnique.mockResolvedValue(mockLead);

      await expect(
        service.convert(
          'lead-1',
          {
            name: 'Rahul Sharma',
            dob: '2021-01-01',
            guardianName: 'Ajay Sharma',
            guardianPhone: '+919876543210',
          },
          'user-manager',
          RoleKey.MANAGER,
          ['branch-2'], // not branch-1
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getBoard', () => {
    it('returns 5 columns with counts from single groupBy', async () => {
      prisma.lead.groupBy.mockResolvedValue([
        { stage: LeadStage.NEW, _count: { _all: 10 } },
        { stage: LeadStage.CONTACTED, _count: { _all: 5 } },
      ]);
      prisma.lead.findMany.mockResolvedValue([mockLead]);

      const result = await service.getBoard(
        {},
        RoleKey.DIRECTOR,
        ['branch-1'],
      );

      expect(prisma.lead.groupBy).toHaveBeenCalledTimes(1);
      expect(result.columns).toHaveLength(5);
      const newCol = result.columns.find((c) => c.stage === LeadStage.NEW);
      expect(newCol?.totalCount).toBe(10);
      expect(newCol?.items).toEqual([mockLead]);
    });
  });

  describe('checkFollowUpsAndNotify', () => {
    it('creates notifications for due leads', async () => {
      prisma.lead.findMany.mockResolvedValue([
        {
          id: 'lead-1',
          name: 'Rahul Sharma',
          contact: '+919876543210',
          stage: LeadStage.NEW,
          branchId: 'branch-1',
          owner: { id: 'emp-1', userId: 'user-emp-1' },
          branch: { id: 'branch-1', name: 'Kochi Central' },
        },
      ]);
      prisma.notification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.checkFollowUpsAndNotify();

      expect(result.checked).toBe(1);
      expect(result.notified).toBe(1);
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-emp-1',
            type: 'LEAD_FOLLOW_UP',
          }),
        }),
      );
    });
  });
});
