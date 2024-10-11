'use client';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  VerificationCodeSchema,
  VerificationCodeSchemaTypes,
} from '@/lib/validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/LoadingButton';
import { ErrorMessage } from '@/components/Message';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useCountdown } from 'usehooks-ts';
import { toast } from 'sonner';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import {
  resendEmailVerificationCodeAction,
  verifyEmailAction,
} from './actions';

export function EmailVerificationForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<VerificationCodeSchemaTypes>({
    resolver: zodResolver(VerificationCodeSchema),
    defaultValues: {
      code: '',
    },
  });
  const countStart = 61;
  const [count, { startCountdown, resetCountdown }] = useCountdown({
    countStart: countStart,
    intervalMs: 1000,
  });

  useEffect(() => {
    if (count === 0) resetCountdown();
  }, [count]);

  async function onSubmit(data: VerificationCodeSchemaTypes) {
    setError(undefined);

    startTransition(async () => {
      const { error } = await verifyEmailAction(data);

      if (error) setError(error);
    });

    form.reset();
  }

  async function resendEmailVerificationCode() {
    toast.promise(resendEmailVerificationCodeAction(), {
      loading: 'Sending verification code...',
      success: 'Verification code resent! Please check your inbox.',
      error: (err) => `${err.message}`,
    });
    startCountdown();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-2/3 space-y-2">
        {error && <ErrorMessage message={error} />}

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Verification Code</FormLabel>

              <FormDescription>
                Please enter the 6-character code sent to your email address.
                The code is valid for 10 minutes.
              </FormDescription>

              <FormControl>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  {...field}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          variant="link"
          className="text-blue-500 p-0"
          onClick={resendEmailVerificationCode}
          disabled={count > 0 && count < countStart}
        >
          Resend code {count > 0 && count < countStart ? `(${count})` : ''}
        </Button>

        <LoadingButton type="submit" loading={isPending}>
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
