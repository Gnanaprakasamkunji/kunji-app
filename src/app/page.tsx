/**
 * Copyright (c) 2026 Kunji Finance.
 * All rights reserved.
 * This code is proprietary and confidential.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Button,
  InlineLoading,
} from '@carbon/react';
import { Login } from '@carbon/icons-react';

import { signIn } from 'next-auth/react';

/**
 * LoginPage provides the authentication entry point for the app.
 * Handles email/password login, Google OAuth, and unverified email states.
 *
 * @returns JSX element for the login page.
 */
export default function LoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isUnverified, setIsUnverified] = useState<boolean>(false);

  const handleLogin = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setError('');
      setIsUnverified(false);

      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!password.trim()) {
        setError('Please enter your password.');
        return;
      }

      setIsLoading(true);
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setIsLoading(false);

      if (res?.error) {
        // Check if the error is about unverified email
        if (res.error.includes('EMAIL_NOT_VERIFIED')) {
          setIsUnverified(true);
          setError('Please verify your email address to continue.');
          return;
        }
        setError('Invalid email or password. Please try again.');
        return;
      }

      router.push('/dashboard');
    },
    [email, password, router]
  );

  const handleGoogleLogin = useCallback((): void => {
    setIsLoading(true);
    signIn('google', { callbackUrl: '/dashboard' });
  }, []);

  return (
    <div className="kunji-login">
      <div className="kunji-login__card">
        <div className="kunji-login__logo">
          <h1>Kunji</h1>
          <p>Your personal finance companion</p>
        </div>

        <form className="kunji-login__form" onSubmit={handleLogin} noValidate>
          <TextInput
            id="email"
            labelText="Email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            invalid={!!error && !email.trim()}
            invalidText="Email is required"
            autoComplete="email"
          />

          <div>
            <PasswordInput
              id="password"
              labelText="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              invalid={!!error && !password.trim()}
              invalidText="Password is required"
              autoComplete="current-password"
            />
            <div style={{ textAlign: 'right', marginTop: '0.375rem' }}>
              <a
                href="/forgot-password"
                style={{
                  color: 'var(--cds-link-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <div role="alert">
              <p
                style={{
                  color: 'var(--cds-support-error)',
                  fontSize: '0.75rem',
                  marginBottom: isUnverified ? '0.5rem' : 0,
                }}
              >
                {error}
              </p>
              {isUnverified && (
                <a
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  style={{
                    color: 'var(--cds-link-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  Resend verification email
                </a>
              )}
            </div>
          )}

          {isLoading ? (
            <InlineLoading description="Signing in..." />
          ) : (
            <Button type="submit" kind="primary" style={{ width: '100%' }}>
              Sign in
            </Button>
          )}
        </form>

        <div className="kunji-login__divider">or continue with</div>

        <Button
          kind="tertiary"
          renderIcon={Login}
          onClick={handleGoogleLogin}
          style={{ width: '100%' }}
          disabled={isLoading}
        >
          Sign in with Google
        </Button>

        <div className="kunji-login__footer">
          <p>
            New to Kunji?{' '}
            <a href="/signup">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
