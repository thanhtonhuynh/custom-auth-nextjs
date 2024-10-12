"use server";

import { updateUser, updateUserTOTPKey } from "@/data/users";
import {
  getCurrentSession,
  setSessionAsTwoFactorVerified,
} from "@/lib/session";
import {
  TwoFactorSetupSchema,
  TwoFactorSetupSchemaTypes,
} from "@/lib/validation";
import { decodeBase64 } from "@oslojs/encoding";
import { verifyTOTP } from "@oslojs/otp";

export async function setup2FAAction(data: TwoFactorSetupSchemaTypes) {
  try {
    const { session, user } = await getCurrentSession();
    if (!session) return { error: "Unauthenticated." };
    if (!user.emailVerified)
      return { error: "You must verify email before setting up 2FA." };
    if (user.twoFactorEnabled && !session.twoFactorVerified)
      return { error: "Forbidden." };

    const { code, encodedTOTPKey } = TwoFactorSetupSchema.parse(data);

    let totpKey: Uint8Array;
    try {
      totpKey = decodeBase64(encodedTOTPKey);
    } catch {
      return { error: "Invalid TOTP key." };
    }

    if (totpKey.byteLength !== 20) return { error: "Invalid TOTP key." };

    if (!verifyTOTP(totpKey, 30, 6, code))
      return { error: "Invalid code. Please try again." };

    await updateUserTOTPKey(user.id, totpKey);
    await updateUser(user.id, { twoFactorEnabled: true });
    await setSessionAsTwoFactorVerified(session.id);

    return {};
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
