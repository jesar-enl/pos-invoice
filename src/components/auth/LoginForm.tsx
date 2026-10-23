'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login, type LoginState } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
    const [state, formAction, isPending] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={formAction} className="space-y-5">
            {next && <input type="hidden" name="next" value={next} />}

            {/* Top-level error */}
            {state.error && (
                <div className="rounded-lg border border-brand-red-200 bg-brand-red-50 px-3 py-2 text-sm text-brand-red-700">
                    {state.error}
                </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    defaultValue={state.values?.email}
                    disabled={isPending}
                    aria-invalid={!!state.fieldErrors?.email}
                    required
                />
                {state.fieldErrors?.email && (
                    <p className="text-xs text-brand-red-600">{state.fieldErrors.email}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                        href="/forgot-password"
                        className="text-xs text-slate-500 hover:text-slate-800"
                    >
                        Forgot password?
                    </Link>
                </div>
                <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isPending}
                        aria-invalid={!!state.fieldErrors?.password}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {state.fieldErrors?.password && (
                    <p className="text-xs text-brand-red-600">{state.fieldErrors.password}</p>
                )}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in…
                    </>
                ) : (
                    'Sign in'
                )}
            </Button>

            <p className="text-xs text-slate-500 text-center">
                Accounts are created by your administrator.
            </p>
        </form>
    );
}