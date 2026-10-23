import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800">Reset password</h2>
      <p className="text-sm text-slate-500 mt-2">
        Password resets are handled by your administrator.
        Contact them to reset your password.
      </p>
      <Link
        href="/login"
        className="inline-block mt-6 text-sm text-slate-700 hover:text-slate-900 underline"
      >
        ← Back to sign in
      </Link>
    </div>
  );
}