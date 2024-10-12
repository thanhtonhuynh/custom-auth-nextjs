import { getCurrentSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { session, user } = await getCurrentSession();

  if (!session) redirect('/login');
  if (user.role !== 'admin') redirect('/');
  if (!user.emailVerified) redirect('/verify-email');
  if (user.twoFactorEnabled && !session.twoFactorVerified) redirect('/2fa');

  return (
    <main className="mx-auto my-10 space-y-3">
      <h1 className="text-center text-xl font-bold">Admin Page</h1>
      <p className="text-center">Welcome, {user.name}!</p>
    </main>
  );
}
