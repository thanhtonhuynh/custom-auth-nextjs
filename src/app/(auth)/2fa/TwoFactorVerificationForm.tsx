'use client';

import {
  TwoFactorVerificationSchema,
  TwoFactorVerificationSchemaTypes,
} from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/LoadingButton';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { verify2FAAction } from './actions';
import { ErrorMessage } from '@/components/Message';

export function TwoFactorVerificationForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<TwoFactorVerificationSchemaTypes>({
    resolver: zodResolver(TwoFactorVerificationSchema),
    defaultValues: {
      code: '',
    },
  });

  async function onSubmit(data: TwoFactorVerificationSchemaTypes) {
    startTransition(async () => {
      const { error } = await verify2FAAction(data);
      if (error) setError(error);
    });

    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    containerClassName="justify-center"
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

                <FormMessage className="text-center" />
              </FormItem>
            );
          }}
        />

        <LoadingButton
          type="submit"
          className="w-1/2 mx-auto"
          loading={isPending}
        >
          Verify
        </LoadingButton>
      </form>
    </Form>
  );
}
