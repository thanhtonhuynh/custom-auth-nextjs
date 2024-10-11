'use server';

import { cookies } from 'next/headers';
import { invalidateUserSessions } from '@/lib/session';
import { rateLimitByIp } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';
import { updateUser, updateUserPassword } from '@/data/users';
import {
  ResetPasswordSchema,
  ResetPasswordSchemaTypes,
} from '@/lib/validation';
import {
  deletePasswordResetTokenCookie,
  invalidatePasswordResetToken,
  validatePasswordResetRequest,
} from '@/lib/password-reset';
import { redirect } from 'next/navigation';

export async function resetPasswordAction(data: ResetPasswordSchemaTypes) {
  try {
    await rateLimitByIp({ key: 'change-password', limit: 2, window: 30000 });

    const token = cookies().get('pw-reset')?.value || '';

    const pwResetToken = await validatePasswordResetRequest(token);

    if (pwResetToken) await invalidatePasswordResetToken(pwResetToken.userId);

    if (!pwResetToken) {
      return { error: 'Invalid or expired token' };
    }

    const { password } = ResetPasswordSchema.parse(data);

    await invalidateUserSessions(pwResetToken.userId);

    await updateUserPassword(pwResetToken.userId, password);

    await updateUser(pwResetToken.userId, { emailVerified: true });

    deletePasswordResetTokenCookie();

    return { success: true };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: 'Too many attempts, please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong' };
  }
}
