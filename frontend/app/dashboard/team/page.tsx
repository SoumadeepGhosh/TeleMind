'use client';
import { useAuth } from '@/lib/auth-context';
import { Mail, Users } from 'lucide-react';
export default function TeamPage() {
  const { user } = useAuth();
  return <div><header className="page-heading"><div><h1>Team & Members</h1><p>Review your signed-in account’s workspace membership.</p></div></header>
    <div className="mb-5 grid gap-4 sm:grid-cols-2"><div className="surface-card metric-card"><p className="muted-copy">Your workspace role</p><strong className="mt-2 block text-xl text-[#35405e]">{user?.role || '—'}</strong></div><div className="surface-card metric-card"><p className="muted-copy">Membership management</p><strong className="mt-2 block text-xl text-[#35405e]">Unavailable</strong></div></div>
    <section className="surface-card overflow-hidden"><div className="flex items-center gap-2 border-b border-[#ebedf3] p-5"><Users className="h-4 w-4 text-[#7774d9]"/><h2 className="font-semibold text-[#35405e]">Your membership</h2></div><div className="overflow-x-auto"><table className="page-table"><thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Workspace</th></tr></thead><tbody>{user && <tr><td className="font-semibold">{user.fullName}</td><td>{user.email}</td><td><span className="status-pill bg-[#e7f5ef] text-[#4d896f]">{user.role}</span></td><td>{user.organizationName}</td></tr>}</tbody></table></div><p className="border-t border-[#ebedf3] px-5 py-3 text-xs text-[#8993a9]">Only your signed-in membership is shown. The API does not expose a member list, invitations, or role editing yet.</p></section>
    <section className="surface-card mt-5 p-5"><h2 className="flex items-center gap-2 font-semibold text-[#35405e]"><Mail className="h-4 w-4 text-[#7774d9]"/>Invitations</h2><p className="muted-copy mt-2">Team invitations are not available yet.</p></section></div>;
}
