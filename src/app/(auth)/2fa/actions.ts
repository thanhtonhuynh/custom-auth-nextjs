'use server';

import { getUserTOTPKey } from '@/data/users';
import {
  getCurrentSession,
  setSessionAsTwoFactorVerified,
} from '@/lib/session';
import {
  TwoFactorVerificationSchema,
  TwoFactorVerificationSchemaTypes,
} from '@/lib/validation';
import { verifyTOTP } from '@oslojs/otp';
import { redirect } from 'next/navigation';

export async function verify2FAAction(data: TwoFactorVerificationSchemaTypes) {
  try {
    const { session, user } = await getCurrentSession();
    if (!session) return { error: 'Unauthenticated.' };
    if (
      !user.emailVerified ||
      !user.twoFactorEnabled ||
      session.twoFactorVerified
    )
      return { error: 'Forbidden.' };

    const { code } = TwoFactorVerificationSchema.parse(data);

    const totpKey = await getUserTOTPKey(user.id);
    if (!totpKey) return { error: 'Forbidden.' };

    if (!verifyTOTP(totpKey, 30, 6, code))
      return { error: 'Invalid code. Please try again.' };

    await setSessionAsTwoFactorVerified(session.id);
  } catch (error) {
    console.error(error);
    return { error: 'Something went wrong.' };
  }

  redirect('/');
}
