import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/tokens';
import AdminControls from '@/features/admin/components/AdminControls';
import SystemLogs from '@/features/admin/components/SystemLogs';
import StudentView from '@/features/student/components/StudentView';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('portal_session')?.value;
  const identity = await verifySessionToken(token!);

  const isAdmin = identity?.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {identity?.email}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Authorization Scope: <span className="font-mono text-blue-500 font-semibold uppercase">{identity?.role}</span>
        </p>
      </div>

      {isAdmin ? (
        <div className="space-y-8">
          <AdminControls />
          <SystemLogs />
        </div>
      ) : (
        <StudentView />
      )}
    </div>
  );
}