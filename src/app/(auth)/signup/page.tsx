import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { SignUpForm } from "./SignUpForm";

export default async function Page() {
  const { session } = await getCurrentSession();
  if (session) redirect("/");

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full max-h-[35rem] w-full max-w-[40rem] flex-col items-center justify-center space-y-4 rounded-xl border p-4 py-8 shadow-xl">
        <h1 className="text-3xl font-bold">Sign Up</h1>

        <SignUpForm />

        <Link href={`/login`} className="text-center hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    </main>
  );
}
