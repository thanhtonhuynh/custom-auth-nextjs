'use client';

import {
  TwoFactorSetupSchema,
  TwoFactorSetupSchemaTypes,
} from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { setup2FAAction } from './actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/LoadingButton';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

type TwoFactorSetupFormProps = {
  encodedTOTPKey: string;
};

export function TwoFactorSetupForm({
  encodedTOTPKey,
}: TwoFactorSetupFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TwoFactorSetupSchemaTypes>({
    resolver: zodResolver(TwoFactorSetupSchema),
    defaultValues: {
      code: '',
      encodedTOTPKey: encodedTOTPKey,
    },
  });

  async function onSubmit(data: TwoFactorSetupSchemaTypes) {
    startTransition(async () => {
      const { error } = await setup2FAAction(data);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success('Two-factor authentication has been set up.');
    });

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 border rounded p-2 self-center"
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <span className="font-bold">Step 3: </span>
                  Enter the code shown in your authenticator app.
                </FormLabel>
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
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
