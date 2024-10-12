'use server';

import { createUser, getUserByEmail } from '@/data/users';
import { redirect } from 'next/navigation';
import { rateLimitByIp } from '@/lib/limiter';
import { RateLimitError } from '@/lib/errors';
import {
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
  upsertEmailVerificationRequest,
} from '@/lib/email-verification';
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/lib/session';
import { SignupSchema, SignupSchemaTypes } from '@/lib/validation';

export async function signUpAction(data: SignupSchemaTypes) {
  try {
    await rateLimitByIp({ key: 'signup', limit: 1, window: 10000 });

    const { email, password } = SignupSchema.parse(data);

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return { error: 'Email already in use' };
    }

    // TODO: Verify password strength

    const user = await createUser(email, password);

    const emailVerificationRequest = await upsertEmailVerificationRequest(
      user.id,
      user.email
    );

    sendVerificationEmail(user.email, emailVerificationRequest.code);

    setEmailVerificationRequestCookie(emailVerificationRequest);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id, {
      twoFactorVerified: false,
    });
    setSessionTokenCookie(sessionToken, session.expiresAt);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    // console.error(error);
    return { error: 'Signup failed. Please try again.' };
  }

  redirect(`/verify-email`);
}
