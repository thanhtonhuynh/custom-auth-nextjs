'use server';

import { loginSchema, LoginValues } from '@/lib/validation';
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

export async function loginAction(credentials: LoginValues) {
  try {
    const { email, password } = loginSchema.parse(credentials);

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

    if (!existingUser.emailVerified) {
      redirect(`/verify-email?email=${email}`);
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: 'Too many login attempts. Please try again later.' };
    }
    console.error(error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}
