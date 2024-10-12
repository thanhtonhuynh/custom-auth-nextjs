import { getCurrentSession } from '@/lib/session';
import { TwoFactorSetupForm } from './TwoFactorSetupForm';
import { redirect } from 'next/navigation';
import { encodeBase64 } from '@oslojs/encoding';
import { createTOTPKeyURI } from '@oslojs/otp';
import { renderSVG } from 'uqr';

export default async function Page() {
  const { session, user } = await getCurrentSession();
  if (!session) redirect('/login');
  if (!user.emailVerified) redirect('/verify-email');
  if (user.twoFactorEnabled && !session.twoFactorVerified) redirect('/2fa');

  const totpKey = new Uint8Array(20);
  crypto.getRandomValues(totpKey);
  const encodedTOTPKey = encodeBase64(totpKey);
  const keyURI = createTOTPKeyURI('Custom Auth', user.email, totpKey, 30, 6);
  const qrcode = renderSVG(keyURI);

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[50rem] rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Set up Two-Factor Authentication</h1>

        <div className="flex gap-4 text-sm">
          <div className="border rounded p-2 flex flex-col space-y-4">
            <div>
              <span className="font-bold">Step 1: </span>
              Install an authenticator app and open it to add a new account.
            </div>

            <div>
              <span className="font-bold">Step 2: </span>
              Scan the QR code below using your authenticator app.
            </div>

            <div
              className="w-40 h-40 self-center"
              dangerouslySetInnerHTML={{ __html: qrcode }}
            ></div>
          </div>

          <TwoFactorSetupForm encodedTOTPKey={encodedTOTPKey} />
        </div>
      </div>
    </main>
  );
}
