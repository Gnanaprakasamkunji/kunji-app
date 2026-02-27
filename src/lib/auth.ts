/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validators';

/**
 * NextAuth configuration with Credentials provider and Prisma session storage.
 * Supports email/password login with bcrypt verification.
 */
export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/',
        error: '/',
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            /**
             * Authenticate a user by email and password.
             *
             * @param credentials - The submitted email and password.
             * @returns The user object if valid, null otherwise.
             */
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await db.user.findUnique({ where: { email } });
                if (!user || !user.hashedPassword) return null;

                const passwordValid = await bcrypt.compare(password, user.hashedPassword);
                if (!passwordValid) return null;

                // Block unverified users
                if (!user.emailVerified) {
                    throw new Error('EMAIL_NOT_VERIFIED');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        /**
         * Adds the user's database ID to the JWT token.
         *
         * @param token - The current JWT token.
         * @param user - The user object from authorize().
         * @returns The updated token.
         */
        async jwt({ token, user }: { token: JWT; user?: { id?: string } }) {
            if (user?.id) {
                token.userId = user.id;
            }
            return token;
        },
        /**
         * Exposes the userId from the JWT token in the session.
         *
         * @param session - The current session object.
         * @param token - The decoded JWT token.
         * @returns The updated session.
         */
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token.userId && session.user) {
                (session.user as { id?: string }).id = token.userId as string;
            }
            return session;
        },
    },
};
