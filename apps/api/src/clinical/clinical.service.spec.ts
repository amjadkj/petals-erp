import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { PrismaService } from '../common/prisma';
import { VersionService } from '../clinical-history/version.service';
import { RoleKey } from '@petals/types';

describe('ClinicalService', () => {
  let service: ClinicalService;
  let prisma: any;
  let versionService: any;

  const mockPrisma: any = {
    unscopedClient: {
      client: {
        findUnique: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
      },
      assessment: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      treatmentPlan: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      goal: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      subgoal: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      progressEntry: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      appointment: {
        findFirst: jest.fn(),
      },
      department: {
        findUnique: jest.fn(),
      },
    },
    $transaction: jest.fn((callback: any) => callback(mockPrisma.unscopedClient)),
  };

  const mockVersionService = {
    recordEdit: jest.fn().mockResolvedValue({ id: 'ver-edit' }),
    recordDelete: jest.fn().mockResolvedValue({ id: 'ver-del' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: VersionService, useValue: mockVersionService },
      ],
    }).compile();

    service = module.get<ClinicalService>(ClinicalService);
    prisma = module.get(PrismaService);
    versionService = module.get(VersionService);
  });

  describe('checkClientReadAccess & Shared Client Visibility', () => {
    it('allows Director access across any client', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b1',
        deletedAt: null,
        guardians: [],
      });

      const client = await service.checkClientReadAccess('c1', 'u-dir', RoleKey.DIRECTOR, []);
      expect(client.id).toBe('c1');
    });

    it('rejects Parent if client is not linked', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b1',
        deletedAt: null,
        guardians: [{ guardian: { userId: 'u-other' }, canViewAssessment: true }],
      });

      await expect(
        service.checkClientReadAccess('c1', 'u-parent', RoleKey.PARENT, ['b1']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects Parent if assessment tab is checked and canViewAssessment is false', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b1',
        deletedAt: null,
        guardians: [{ guardian: { userId: 'u-parent' }, canViewAssessment: false }],
      });

      await expect(
        service.checkClientReadAccess('c1', 'u-parent', RoleKey.PARENT, ['b1'], true),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Therapist access via shared-client branch match', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b1',
        deletedAt: null,
        guardians: [],
      });

      const client = await service.checkClientReadAccess('c1', 'u-therapist', RoleKey.THERAPIST, ['b1']);
      expect(client.id).toBe('c1');
    });

    it('allows Therapist access via assigned treatment plan on different branch', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b2',
        deletedAt: null,
        guardians: [],
      });
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-1', userId: 'u-therapist' });
      prisma.unscopedClient.treatmentPlan.findFirst.mockResolvedValue({ id: 'tp-1' });

      const client = await service.checkClientReadAccess('c1', 'u-therapist', RoleKey.THERAPIST, ['b1']);
      expect(client.id).toBe('c1');
    });
  });

  describe('Author-only editing and Director override on Assessments', () => {
    it('allows author therapist to edit their own assessment', async () => {
      prisma.unscopedClient.assessment.findUnique.mockResolvedValue({
        id: 'a1',
        assessorId: 'emp-1',
        deletedAt: null,
      });
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
      prisma.unscopedClient.assessment.update.mockResolvedValue({ id: 'a1', observation: 'Updated' });

      const result = await service.updateAssessment(
        'a1',
        { observation: 'Updated' },
        'u-therapist-1',
        RoleKey.THERAPIST,
      );

      expect(result.observation).toBe('Updated');
      expect(versionService.recordEdit).toHaveBeenCalled();
    });

    it('blocks a therapist from editing another therapist assessment', async () => {
      prisma.unscopedClient.assessment.findUnique.mockResolvedValue({
        id: 'a1',
        assessorId: 'emp-1', // created by emp-1
        deletedAt: null,
      });
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-2' }); // current user is emp-2

      await expect(
        service.updateAssessment('a1', { observation: 'Hacked' }, 'u-therapist-2', RoleKey.THERAPIST),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Director to override and edit another therapist assessment', async () => {
      prisma.unscopedClient.assessment.findUnique.mockResolvedValue({
        id: 'a1',
        assessorId: 'emp-1',
        deletedAt: null,
      });
      prisma.unscopedClient.assessment.update.mockResolvedValue({ id: 'a1', observation: 'Director update' });

      const result = await service.updateAssessment(
        'a1',
        { observation: 'Director update' },
        'u-dir',
        RoleKey.DIRECTOR,
      );

      expect(result.observation).toBe('Director update');
      expect(versionService.recordEdit).toHaveBeenCalled();
    });
  });

  describe('Author-only editing and Director override on Progress Entries', () => {
    it('blocks therapist from editing another therapist progress entry', async () => {
      prisma.unscopedClient.progressEntry.findUnique.mockResolvedValue({
        id: 'pe-1',
        authorId: 'emp-1',
        deletedAt: null,
      });
      prisma.unscopedClient.employee.findUnique.mockResolvedValue({ id: 'emp-2' });

      await expect(
        service.updateProgressEntry('pe-1', { remarks: 'Changed' }, 'u-therapist-2', RoleKey.THERAPIST),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows Director to override and delete another therapist progress entry', async () => {
      prisma.unscopedClient.progressEntry.findUnique.mockResolvedValue({
        id: 'pe-1',
        authorId: 'emp-1',
        deletedAt: null,
      });
      prisma.unscopedClient.progressEntry.update.mockResolvedValue({ id: 'pe-1', deletedAt: new Date() });

      const res = await service.deleteProgressEntry('pe-1', 'u-dir', RoleKey.DIRECTOR);
      expect(res.deletedAt).toBeDefined();
      expect(versionService.recordDelete).toHaveBeenCalled();
    });
  });

  describe('Goals & Subgoals Fixed Query Count', () => {
    it('fetches goals with nested subgoals in fixed queries', async () => {
      prisma.unscopedClient.client.findUnique.mockResolvedValue({
        id: 'c1',
        branchId: 'b1',
        deletedAt: null,
        guardians: [],
      });
      prisma.unscopedClient.goal.findMany.mockResolvedValue([
        {
          id: 'g1',
          title: 'Goal 1',
          subgoals: [{ id: 'sg1', description: 'Subgoal 1' }],
        },
      ]);

      const goals = await service.findGoals('c1', 'u-dir', RoleKey.DIRECTOR, []);
      expect(goals).toHaveLength(1);
      expect(goals[0].subgoals).toHaveLength(1);
    });
  });
});
