import { getCurrentSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TwoFactorVerificationForm } from './TwoFactorVerificationForm';

export default async function Page() {
  const { session, user } = await getCurrentSession();
  if (!session) redirect('/login');
  if (!user.emailVerified) redirect('/verify-email');
  if (!user.twoFactorEnabled) redirect('/2fa/setup');
  if (session.twoFactorVerified) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex px-16 py-8 h-full max-h-[25rem] w-full max-w-[35rem] rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Two-Factor Authentication</h1>

        <p className="text-sm text-gray-700">
          Your account has two-factor authentication enabled. <br />
          Please enter the 6-digit code from your authenticator app to continue.
        </p>

        <TwoFactorVerificationForm />
      </div>
    </main>
  );
}
