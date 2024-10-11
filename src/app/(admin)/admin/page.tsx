import { getCurrentSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await getCurrentSession();

  if (!user) redirect('/login');
  if (!user.emailVerified) redirect('/verify-email');
  if (user.role !== 'admin') redirect('/');

  return (
    <main className="mx-auto my-10 space-y-3">
      <h1 className="text-center text-xl font-bold">Admin Page</h1>
      <p className="text-center">Welcome, {user.name}!</p>
    </main>
  );
}
