import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma';
import { CacheService } from '../redis';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RequestContext, IRequestContext } from '../context/request-context';
import { RoleKey } from '@petals/types';

interface CachedUserData {
  id: string;
  roleId: string;
  isActive: boolean;
  roleKey: RoleKey;
  branchIds: string[];
  primaryBranchId: string | null;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check if route is marked @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    // 2. Verify JWT signature & expiration
    let payload: { sub: string; sessionId: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException('Malformed authentication token');
    }

    // 3. Verify session is not revoked or expired (check DB directly for real-time revocation)
    const session = await this.prisma.unscopedClient.session.findUnique({
      where: { id: payload.sessionId },
      select: { id: true, revokedAt: true, expiresAt: true, userId: true },
    });

    if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session has been revoked or expired');
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException('Session user mismatch');
    }

    // 4. Load user & role from Redis (DB fallback, invalidated on any change)
    const user = await this.loadUserData(payload.sub);

    // 5. Block deactivated users immediately on next request
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    // 6. Check active branch (from 'x-branch-id' header or primary branch)
    const requestedBranch = request.headers['x-branch-id'] as string | undefined;
    let activeBranchId: string | null = null;
    if (requestedBranch && user.branchIds.includes(requestedBranch)) {
      activeBranchId = requestedBranch;
    } else {
      activeBranchId = user.primaryBranchId || user.branchIds[0] || null;
    }

    // For Director: if user has no explicit branches assigned, or Director wants access,
    // Director can access all branches
    let branchIds = user.branchIds;
    if (user.roleKey === RoleKey.DIRECTOR && branchIds.length === 0) {
      // Director has cross-branch access
      const allBranches = await this.prisma.unscopedClient.branch.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      branchIds = allBranches.map((b) => b.id);
      if (!activeBranchId && branchIds.length > 0) {
        activeBranchId = branchIds[0];
      }
    }

    // 7. Populate RequestContext via AsyncLocalStorage
    const reqCtx: IRequestContext = {
      userId: user.id,
      roleId: user.roleId,
      roleKey: user.roleKey,
      isActive: user.isActive,
      branchIds,
      activeBranchId,
      sessionId: session.id,
      ipAddress: request.ip,
    };

    // Attach to request object for standard handlers
    (request as any).user = reqCtx;
    if ((request as any).__requestContext) {
      Object.assign((request as any).__requestContext, reqCtx);
    } else {
      (request as any).__requestContext = reqCtx;
    }

    // Run remaining guards and handler within RequestContext scope
    const storage = RequestContext.getStorage();
    storage.enterWith(reqCtx);

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async loadUserData(userId: string): Promise<CachedUserData | null> {
    const cacheKey = `user:${userId}`;
    const cached = await this.cache.get<CachedUserData>(cacheKey);
    if (cached) {
      return cached;
    }

    // DB fallback
    const dbUser = await this.prisma.unscopedClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        roleId: true,
        isActive: true,
        role: { select: { key: true } },
        branches: {
          select: {
            branchId: true,
            isPrimary: true,
          },
        },
      },
    });

    if (!dbUser) {
      return null;
    }

    const primaryBranch = dbUser.branches.find((b) => b.isPrimary);
    const branchIds = dbUser.branches.map((b) => b.branchId);

    const userData: CachedUserData = {
      id: dbUser.id,
      roleId: dbUser.roleId,
      isActive: dbUser.isActive,
      roleKey: dbUser.role.key as unknown as RoleKey,
      branchIds,
      primaryBranchId: primaryBranch ? primaryBranch.branchId : (branchIds[0] || null),
    };

    // Cache for 5 minutes (invalidated whenever user is updated)
    await this.cache.set(cacheKey, userData, 300);
    return userData;
  }
}
