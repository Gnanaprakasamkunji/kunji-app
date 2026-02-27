/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validators';
import { generateToken, sendPasswordResetEmail } from '@/lib/email';
import logging from '@/lib/logging';

const logger = logging('auth:forgot-password');

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email with a time-limited token.
 *
 * @param request - The incoming request with email in the body.
 * @returns JSON response with a generic success message (no email enumeration).
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const parsed = forgotPasswordSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        const { email } = parsed.data;

        // Always return a generic message to prevent email enumeration
        const genericMessage = 'If an account with that email exists, a password reset link has been sent.';

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            // Silently succeed — don't reveal if user exists
            return NextResponse.json({ message: genericMessage }, { status: 200 });
        }

        // Delete any existing reset tokens for this user
        await db.passwordResetToken.deleteMany({
            where: { email },
        });

        // Generate a new token with 30-minute expiry
        const token = generateToken();
        const expires = new Date(Date.now() + 30 * 60 * 1000);

        await db.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // Send the reset email
        await sendPasswordResetEmail(email, token);

        logger.info(`Password reset email sent to: ${email}`);

        return NextResponse.json({ message: genericMessage }, { status: 200 });
    } catch (error: unknown) {
        logger.error(`Forgot password error: ${String(error)}`);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
