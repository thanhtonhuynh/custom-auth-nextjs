'use server';

import { redirect } from 'next/navigation';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/session';
import { rateLimitByKey } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';
import { getUserByEmail, getUserPasswordHash } from '@/data/users';
import { verifyPassword } from '@/lib/password';
import { isRedirectError } from 'next/dist/client/components/redirect';
import {
  getUserEmailVerificationRequestByUserId,
  setEmailVerificationRequestCookie,
} from '@/lib/email-verification';
import { LoginSchema, LoginSchemaTypes } from '@/lib/validation';

export async function loginAction(data: LoginSchemaTypes) {
  try {
    const { email, password } = LoginSchema.parse(data);

    await rateLimitByKey({ key: email, limit: 3, window: 10000 });

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return { error: 'Invalid email or password' };
    }

    const passwordHash = await getUserPasswordHash(existingUser.id);
    if (!passwordHash) {
      return { error: 'Invalid email or password' };
    }

    const validPassword = await verifyPassword(passwordHash, password);
    if (!validPassword) {
      return { error: 'Invalid email or password' };
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);

    if (!existingUser.emailVerified) {
      const emailVerificationRequest =
        await getUserEmailVerificationRequestByUserId(existingUser.id);

      if (emailVerificationRequest) {
        setEmailVerificationRequestCookie(emailVerificationRequest);
      }

      redirect(`/verify-email`);
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    // console.error(error);
    return { error: 'Login failed. Please try again.' };
  }

  redirect('/');
}
