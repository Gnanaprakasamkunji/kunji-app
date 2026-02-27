/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import logging from '@/lib/logging';

const logger = logging('auth:verify-email');

/**
 * POST /api/auth/verify-email
 * Verifies a user's email address using a token.
 *
 * @param request - The incoming request with token in the body.
 * @returns JSON response with success or error message.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { token } = body as { token: string };

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token is required.' },
                { status: 400 }
            );
        }

        // Find the verification token
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json(
                { error: 'Invalid or already-used verification link.' },
                { status: 400 }
            );
        }

        // Check expiration
        if (new Date() > verificationToken.expires) {
            // Clean up expired token
            await db.verificationToken.delete({
                where: { token },
            });
            return NextResponse.json(
                { error: 'This verification link has expired. Please request a new one.' },
                { status: 410 }
            );
        }

        // Mark user as verified
        await db.user.update({
            where: { email: verificationToken.identifier },
            data: { emailVerified: new Date() },
        });

        // Delete used token (single-use)
        await db.verificationToken.delete({
            where: { token },
        });

        logger.info(`Email verified: ${verificationToken.identifier}`);

        return NextResponse.json(
            { message: 'Email verified successfully! You can now sign in.' },
            { status: 200 }
        );
    } catch (error: unknown) {
        logger.error(`Verify email error: ${String(error)}`);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/auth/verify-email/resend
 * Resends the verification email for unverified users.
 *
 * @param request - The incoming request with email in the body.
 * @returns JSON response with success message.
 */
export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { email } = body as { email: string };

        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required.' },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({ where: { email } });

        // Don't reveal if user exists
        if (!user || user.emailVerified) {
            return NextResponse.json(
                { message: 'If an unverified account exists, a verification email has been sent.' },
                { status: 200 }
            );
        }

        // Delete any existing tokens for this user
        await db.verificationToken.deleteMany({
            where: { identifier: email },
        });

        // Generate new token
        const { generateToken, sendVerificationEmail } = await import('@/lib/email');
        const token = generateToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });

        await sendVerificationEmail(email, token);

        logger.info(`Verification email resent to: ${email}`);

        return NextResponse.json(
            { message: 'If an unverified account exists, a verification email has been sent.' },
            { status: 200 }
        );
    } catch (error: unknown) {
        logger.error(`Resend verification error: ${String(error)}`);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
