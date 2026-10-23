import { SessionProvider } from '@/features/auth/context';
import { requireSession } from '@/features/auth/guards';
import { Sidebar } from './dashboard/Sidebar';
import { Header } from './dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <SessionProvider
      value={{
        userId: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: session.role,
      }}
    >
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}