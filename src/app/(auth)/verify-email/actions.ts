'use server';

import { updateUser } from '@/data/users';
import {
  deleteEmailVerificationRequestCookie,
  getUserEmailVerificationRequestFromCookie,
  sendVerificationEmail,
  setEmailVerificationRequestCookie,
  upsertEmailVerificationRequest,
  verifyEmailVerificationCode,
} from '@/lib/email-verification';
import {
  AuthenticationError,
  GenericError,
  RateLimitError,
  TokenExpiredError,
} from '@/lib/errors';
import { rateLimitByKey } from '@/lib/limiter';
import { getCurrentSession } from '@/lib/session';
import {
  VerificationCodeSchemaTypes,
  VerificationCodeSchema,
} from '@/lib/validation';
import { redirect } from 'next/navigation';

export async function verifyEmailAction(data: VerificationCodeSchemaTypes) {
  try {
    const { user } = await getCurrentSession();
    if (!user) return { error: 'Unauthorized' };

    await rateLimitByKey({ key: user.id, limit: 3, window: 10000 });

    const verificationRequest =
      await getUserEmailVerificationRequestFromCookie();
    if (!verificationRequest) throw new TokenExpiredError();

    const { code } = VerificationCodeSchema.parse(data);

    const validCode = await verifyEmailVerificationCode(
      verificationRequest,
      code
    );
    if (!validCode) throw new TokenExpiredError();

    // TODO: Invalidate user password reset sessions

    await updateUser(user.id, { emailVerified: true });

    deleteEmailVerificationRequestCookie();
  } catch (error) {
    if (error instanceof RateLimitError || error instanceof TokenExpiredError) {
      return { error: error.message };
    }
    // console.error(error);
    return { error: 'Something went wrong.' };
  }

  redirect('/');
}

export async function resendEmailVerificationCodeAction() {
  try {
    const { user } = await getCurrentSession();
    if (!user) throw new AuthenticationError();

    await rateLimitByKey({ key: user.email, limit: 1, window: 60000 });

    let verificationRequest = await getUserEmailVerificationRequestFromCookie();
    if (!verificationRequest && user.emailVerified) {
      throw new GenericError('Email already verified');
    }

    verificationRequest = await upsertEmailVerificationRequest(
      user.id,
      user.email
    );

    sendVerificationEmail(user.email, verificationRequest.code);

    setEmailVerificationRequestCookie(verificationRequest);
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw Error('You can only request a verification code once per minute.');
    } else if (
      error instanceof GenericError ||
      error instanceof AuthenticationError
    ) {
      throw error;
    }
    // console.log(error);
    throw Error('Something went wrong.');
  }
}
