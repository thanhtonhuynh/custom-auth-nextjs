import { decrypt, encrypt } from '@/lib/encryption';
import { hashPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import { User } from '@/lib/session';

// Create User
export async function createUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name: email.split('@')[0], email, passwordHash },
  });
  return user as User;
}

// Get User By Email
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  return user as User | null;
}

// Get User Password Hash
export async function getUserPasswordHash(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) throw new Error('Invalid user ID');
  return user.passwordHash;
}

// Get User TOTP Key
export async function getUserTOTPKey(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpKey: true },
  });
  if (!user) throw new Error('Invalid user ID');
  if (!user.totpKey) return null;
  return decrypt(user.totpKey);
}

// Update User
export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });
  return user as User;
}

// Update User Password
export async function updateUserPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

// Update User TOTP Key
export async function updateUserTOTPKey(userId: string, totpKey: Uint8Array) {
  const encrypted = encrypt(totpKey);
  const buffer = Buffer.from(encrypted);
  await prisma.user.update({
    where: { id: userId },
    data: { totpKey: buffer },
  });
}
