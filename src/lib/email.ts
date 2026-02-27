/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import logging from '@/lib/logging';

const logger = logging('email');

/**
 * Creates a Nodemailer transporter using SMTP credentials from environment variables.
 * Falls back to a console-only transport in development if SMTP is not configured.
 *
 * @returns Nodemailer transporter instance.
 */
function createTransporter(): nodemailer.Transporter {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        logger.warn('SMTP not configured — emails will be logged to console only.');
        return nodemailer.createTransport({
            jsonTransport: true,
        });
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

const transporter = createTransporter();

const APP_NAME = 'Kunji';
const FROM_ADDRESS = process.env.SMTP_FROM || 'noreply@kunji.app';

/**
 * Generates a cryptographically random verification token.
 *
 * @returns A unique token string.
 */
export function generateToken(): string {
    return randomUUID();
}

/**
 * Sends an email verification link to a newly registered user.
 *
 * @param email - The recipient's email address.
 * @param token - The verification token.
 * @returns void
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

    const mailOptions = {
        from: `${APP_NAME} <${FROM_ADDRESS}>`,
        to: email,
        subject: `Verify your ${APP_NAME} account`,
        html: `
            <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                <h1 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 1rem;">Welcome to ${APP_NAME}!</h1>
                <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
                    Thank you for creating an account. Please verify your email address to start managing your finances.
                </p>
                <a href="${verifyUrl}" 
                   style="display: inline-block; background: #2a75ff; color: #fff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9375rem;">
                    Verify Email Address
                </a>
                <p style="color: #94a3b8; font-size: 0.8125rem; margin-top: 2rem; line-height: 1.5;">
                    This link expires in 24 hours. If you did not create this account, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.SMTP_HOST) {
            logger.info(`Verification email sent to ${email}`);
        } else {
            logger.info(`[DEV] Verification email for ${email}:`);
            logger.info(`[DEV] Verify URL: ${verifyUrl}`);
            logger.info(`[DEV] Email payload: ${info.message}`);
        }
    } catch (error: unknown) {
        logger.error(`Failed to send verification email to ${email}: ${String(error)}`);
        throw new Error('Failed to send verification email. Please try again.');
    }
}

/**
 * Sends a password reset link to the user's email.
 *
 * @param email - The recipient's email address.
 * @param token - The password reset token.
 * @returns void
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/forgot-password?token=${token}`;

    const mailOptions = {
        from: `${APP_NAME} <${FROM_ADDRESS}>`,
        to: email,
        subject: `Reset your ${APP_NAME} password`,
        html: `
            <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
                <h1 style="font-size: 1.5rem; color: #1e293b; margin-bottom: 1rem;">Reset your password</h1>
                <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">
                    We received a request to reset your password. Click the button below to set a new password.
                </p>
                <a href="${resetUrl}" 
                   style="display: inline-block; background: #2a75ff; color: #fff; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9375rem;">
                    Reset Password
                </a>
                <p style="color: #94a3b8; font-size: 0.8125rem; margin-top: 2rem; line-height: 1.5;">
                    This link expires in 30 minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.SMTP_HOST) {
            logger.info(`Password reset email sent to ${email}`);
        } else {
            logger.info(`[DEV] Password reset email for ${email}:`);
            logger.info(`[DEV] Reset URL: ${resetUrl}`);
            logger.info(`[DEV] Email payload: ${info.message}`);
        }
    } catch (error: unknown) {
        logger.error(`Failed to send password reset email to ${email}: ${String(error)}`);
        throw new Error('Failed to send password reset email. Please try again.');
    }
}
