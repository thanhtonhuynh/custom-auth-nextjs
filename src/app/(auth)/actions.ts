'use server';

import { deleteEmailVerificationRequestCookie } from '@/lib/email-verification';
import { AuthenticationError } from '@/lib/errors';
import {
  deleteSessionTokenCookie,
  getCurrentSession,
  invalidateSession,
} from '@/lib/session';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const { session } = await getCurrentSession();
  if (!session) throw new AuthenticationError();

  invalidateSession(session.id);
  deleteSessionTokenCookie();

  // Delete email verification request cookie
  deleteEmailVerificationRequestCookie();

  redirect('/login');
}
