/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signupSchema } from '@/lib/validators';
import { generateToken, sendVerificationEmail } from '@/lib/email';
import logging from '@/lib/logging';

const logger = logging('auth:signup');

/**
 * POST /api/auth/signup
 * Registers a new user with email verification.
 *
 * @param request - The incoming request with name, email, password, confirmPassword.
 * @returns JSON response with success or error message.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const parsed = signupSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || 'Invalid input.';
            return NextResponse.json(
                { error: firstError },
                { status: 400 }
            );
        }

        const { name, email, password } = parsed.data;

        // Check for existing user
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with emailVerified = null
        const user = await db.user.create({
            data: {
                name,
                email,
                hashedPassword,
                emailVerified: null,
            },
        });

        // Generate verification token (24 hour expiry)
        const token = generateToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.verificationToken.create({
            data: {
                identifier: user.email,
                token,
                expires,
            },
        });

        // Send verification email
        await sendVerificationEmail(email, token);

        logger.info(`New user registered: ${email}`);

        return NextResponse.json(
            { message: 'Account created successfully. Please check your email to verify your account.' },
            { status: 201 }
        );
    } catch (error: unknown) {
        logger.error(`Signup error: ${String(error)}`);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
