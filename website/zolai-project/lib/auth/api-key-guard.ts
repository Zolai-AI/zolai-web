import { createHash } from 'crypto';
import prisma from '@/lib/prisma';
import type { Context, Next } from 'hono';

/**
 * Validate API key from Authorization header
 * Format: Authorization: Bearer <api-key>
 */
export async function validateApiKey(apiKey: string): Promise<{ userId: string } | null> {
  try {
    const hashedKey = createHash('sha256').update(apiKey).digest('hex');
    
    const key = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
      select: { userId: true, isActive: true, expiresAt: true },
    });

    if (!key || !key.isActive) {
      return null;
    }

    // Check expiry
    if (key.expiresAt && new Date() > key.expiresAt) {
      return null;
    }

    // Update last used
    await prisma.apiKey.update({
      where: { key: hashedKey },
      data: { lastUsedAt: new Date() },
    }).catch(() => {
      // Ignore errors
    });

    return { userId: key.userId };
  } catch (error) {
    console.error('[API Key] Validation error:', error);
    return null;
  }
}

/**
 * Hono middleware for API key authentication
 * Usage: app.use(apiKeyMiddleware)
 */
export const apiKeyMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7); // Remove "Bearer "
    const result = await validateApiKey(apiKey);
    
    if (result) {
      c.set('userId', result.userId);
      c.set('isApiKey', true);
      return next();
    }
  }

  return next();
};
