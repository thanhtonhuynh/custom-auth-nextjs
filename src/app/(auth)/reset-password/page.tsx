import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ResetPasswordForm } from './ResetPasswordForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Page() {
  const token = cookies().get('pw-reset')?.value;
  if (!token) redirect('/login/forgot-password');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Enter new password</h1>

        <div className="flex flex-col space-y-4 w-1/2">
          <ResetPasswordForm />

          <Button className="w-full gap-1" variant={'outline'} asChild>
            <Link href={'/login'}>
              <ArrowLeft size={15} />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
