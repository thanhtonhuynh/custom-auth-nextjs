// import prisma from '@/lib/prisma';
// import { User } from '@prisma/client';
// import { cache } from 'react';
// import { hash, verify } from '@node-rs/argon2';
// import { generateIdFromEntropySize } from 'lucia';
// import { encodeHex } from 'oslo/encoding';
// import { sha256 } from 'oslo/crypto';
// import { createDate, TimeSpan } from 'oslo';

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

// // Create Password Reset Token
// export async function createPasswordResetToken(userId: string) {
//   // create new token
//   const token = generateIdFromEntropySize(25); // 40 characters
//   const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));

//   // invalidate any existing tokens
//   await prisma.passwordResetToken.deleteMany({
//     where: { userId },
//   });

//   // save token to database
//   await prisma.passwordResetToken.create({
//     data: {
//       userId,
//       tokenHash,
//       expiresAt: createDate(new TimeSpan(2, 'h')),
//     },
//   });

//   return token;
// }

// // Validate Password Reset Token
// export async function validatePasswordResetToken(token: string) {
//   const tokenHash = encodeHex(await sha256(new TextEncoder().encode(token)));
//   const dbToken = await prisma.passwordResetToken.findFirst({
//     where: {
//       tokenHash,
//       expiresAt: {
//         gte: new Date(),
//       },
//     },
//   });

//   return dbToken;
// }
