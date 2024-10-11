import { encodeBase32UpperCaseNoPadding } from '@oslojs/encoding';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRandomOTP() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const code = encodeBase32UpperCaseNoPadding(bytes).substring(0, 6);
  return code;
}
