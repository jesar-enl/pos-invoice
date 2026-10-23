import { LoginForm } from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  const errorMessages: Record<string, string> = {
    suspended: 'Your account has been suspended. Contact your administrator.',
    no_access: 'Your account does not have access to this workspace.',
    invite_expired: 'Your invitation has expired. Ask your admin to resend it.',
  };


  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sign in to continue to your POS.
        </p>
      </div>
      {error && errorMessages[error] && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {errorMessages[error]}
        </div>
      )}
      <LoginForm next={next} />
    </div>
  );
}