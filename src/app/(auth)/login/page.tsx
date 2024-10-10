import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { GoogleSignInButton } from './GoogleSignInButton';
import { LoginForm } from './LoginForm';

export default async function Page() {
  const { session } = await getCurrentSession();
  if (session) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Login</h1>

        <div className="flex flex-col space-y-4 w-1/2">
          <GoogleSignInButton />

          <div className="flex items-center justify-center space-x-4">
            <hr className="w-1/3" />
            <span>or</span>
            <hr className="w-1/3" />
          </div>

          <LoginForm />

          <Link href={`/signup`} className="hover:underline text-center">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
