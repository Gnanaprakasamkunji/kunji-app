/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { resetPasswordSchema } from '@/lib/validators';
import logging from '@/lib/logging';

const logger = logging('auth:reset-password');

/**
 * POST /api/auth/reset-password
 * Resets a user's password using a valid token.
 *
 * @param request - The incoming request with token, newPassword, confirmPassword.
 * @returns JSON response with success or error message.
 */
export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const parsed = resetPasswordSchema.safeParse(body);

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || 'Invalid input.';
            return NextResponse.json(
                { error: firstError },
                { status: 400 }
            );
        }

        const { token, newPassword } = parsed.data;

        // Find the reset token
        const resetToken = await db.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json(
                { error: 'Invalid or already-used reset link.' },
                { status: 400 }
            );
        }

        // Check expiration
        if (new Date() > resetToken.expires) {
            await db.passwordResetToken.delete({ where: { token } });
            return NextResponse.json(
                { error: 'This reset link has expired. Please request a new one.' },
                { status: 410 }
            );
        }

        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db.user.update({
            where: { email: resetToken.email },
            data: { hashedPassword },
        });

        // Delete used token (single-use)
        await db.passwordResetToken.delete({ where: { token } });

        logger.info(`Password reset completed for: ${resetToken.email}`);

        return NextResponse.json(
            { message: 'Password reset successfully. You can now sign in with your new password.' },
            { status: 200 }
        );
    } catch (error: unknown) {
        logger.error(`Reset password error: ${String(error)}`);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
