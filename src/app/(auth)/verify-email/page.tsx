import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getUserEmailVerificationRequestFromCookie } from "@/lib/email-verification";
import { EmailVerificationForm } from "./EmailVerificationForm";

export default async function Page() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/login");

  const verificationRequest = await getUserEmailVerificationRequestFromCookie();
  if (!verificationRequest && user.emailVerified) redirect("/");

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full max-h-[30rem] w-full max-w-[40rem] flex-col items-center justify-center space-y-4 rounded-xl border p-4 py-8 shadow-xl">
        <h1 className="text-3xl font-bold">Verify Email Address</h1>

        <div className="font-semibold">{user.email}</div>

        <EmailVerificationForm />
      </div>
    </main>
  );
}
