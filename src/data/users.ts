import { hashPassword } from '@/lib/password';
import prisma from '@/lib/prisma';
import { User } from '@/lib/session';
import { cache } from 'react';

// Create User
export async function createUser(email: string, password: string) {
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name: email.split('@')[0], email, passwordHash },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  });

  return user;
}

// Get User By Email
export const getUserByEmail = cache(async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  });

  return user;
});

// Get User Password Hash
export const getUserPasswordHash = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) throw new Error('Invalid user ID');
  return user.passwordHash;
});

// Update User
export async function updateUser(userId: string, data: Partial<User>) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
    },
  });

  return user;
}

// Update User Password
export async function updateUserPassword(userId: string, password: string) {
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
