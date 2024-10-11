import { EmailVerificationRequest } from '@prisma/client';
import prisma from './prisma';
import { generateRandomOTP } from './utils';
import { cookies } from 'next/headers';
import { getCurrentSession } from './session';

const EMAIL_VERIFICATION_TTL = 1000 * 60 * 10; // 10 minutes
// const EMAIL_VERIFICATION_TTL = 3000; // 3 seconds

export async function upsertEmailVerificationRequest(
  userId: string,
  email: string
) {
  const code = generateRandomOTP();

  const request = await prisma.emailVerificationRequest.upsert({
    where: { userId },
    create: {
      userId,
      email,
      code,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL),
    },
    update: {
      code,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL),
    },
  });

  return request;
}

export async function deleteEmailVerificationRequest(userId: string) {
  await prisma.emailVerificationRequest.delete({ where: { userId } });
}

export function sendVerificationEmail(email: string, code: string) {
  console.log(`Sending verification email to ${email} with code ${code}`);
}

export function setEmailVerificationRequestCookie(
  request: EmailVerificationRequest
) {
  cookies().set('email_verification', request.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: request.expiresAt,
    path: '/',
  });
}

export function deleteEmailVerificationRequestCookie() {
  cookies().set('email_verification', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function getUserEmailVerificationRequest(
  userId: string,
  id: string
) {
  const request = await prisma.emailVerificationRequest.findUnique({
    where: { id, userId },
  });

  return request;
}

export async function getUserEmailVerificationRequestByUserId(userId: string) {
  const request = await prisma.emailVerificationRequest.findUnique({
    where: { userId },
  });

  return request;
}

export async function getUserEmailVerificationRequestFromCookie() {
  const { user } = await getCurrentSession();
  if (!user) return null;

  const id = cookies().get('email_verification')?.value ?? null;
  if (!id) return null;

  const request = await getUserEmailVerificationRequest(user.id, id);

  return request;
}

export async function verifyEmailVerificationCode(
  request: EmailVerificationRequest,
  code: string
) {
  if (request.code !== code) {
    return false;
  }

  await deleteEmailVerificationRequest(request.userId);

  if (request.expiresAt < new Date()) {
    return false;
  }

  return true;
}
