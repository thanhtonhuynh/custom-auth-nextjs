import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { LoginForm } from "./LoginForm";

export default async function Page() {
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full max-h-[35rem] w-full max-w-[40rem] flex-col items-center justify-center space-y-4 rounded-xl border p-4 py-8 shadow-xl">
        <h1 className="text-3xl font-bold">Login</h1>

        <div className="flex w-1/2 flex-col space-y-4">
          <GoogleSignInButton />

          <div className="flex items-center justify-center space-x-4">
            <hr className="w-1/3" />
            <span>or</span>
            <hr className="w-1/3" />
          </div>

          <LoginForm />

          <Link href={`/signup`} className="text-center hover:underline">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
