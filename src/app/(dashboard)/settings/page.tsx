import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentTenant } from '@/lib/tenant';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { requirePermission } from '@/features/auth/guards';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requirePermission('settings.view');
  const tenant = await getCurrentTenant();
  if (!tenant) redirect('/dashboard');

  return (
    <div className="-m-6 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">
          Business info, tax, and receipt configuration.
        </p>
      </div>

      <Suspense fallback={<div className="h-12" />}>
        <SettingsTabs />
      </Suspense>

      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <Suspense fallback={<div className="h-64" />}>
            <SettingsForm tenant={tenant} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}