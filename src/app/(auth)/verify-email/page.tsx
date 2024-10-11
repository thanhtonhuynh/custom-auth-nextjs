import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { getUserEmailVerificationRequestFromCookie } from '@/lib/email-verification';
import { EmailVerificationForm } from './EmailVerificationForm';

export default async function Page() {
  const { user } = await getCurrentSession();
  if (!user) redirect('/login');

  const verificationRequest = await getUserEmailVerificationRequestFromCookie();
  if (!verificationRequest && user.emailVerified) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full p-4 py-8 max-h-[30rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Verify Email Address</h1>

        <div className="font-semibold">{user.email}</div>

        <EmailVerificationForm />
      </div>
    </main>
  );
}
