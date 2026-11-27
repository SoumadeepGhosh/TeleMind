'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { errorMessage } from '@/lib/api';
import {
  BookOpen, Bot, ChevronDown, Check, Building2, LayoutDashboard, LogOut,
  MessageSquare, Plus, SlidersHorizontal, Users, X, Loader2, PencilLine, KeyRound,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
  { name: 'AI Playground', href: '/dashboard/playground', icon: Bot },
  { name: 'Telegram & WhatsApp', href: '/dashboard/channels', icon: MessageSquare },
  { name: 'Team & Members', href: '/dashboard/team', icon: Users },
  { name: 'API & Integrations', href: '/dashboard/integrations', icon: KeyRound },
  { name: 'Workspace Settings', href: '/dashboard/settings', icon: SlidersHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, organizations, switchOrg, createOrg, updateOrgName, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState<'create' | 'rename' | null>(null);
  const [newName, setNewName] = useState('');
  const [renameValue, setRenameValue] = useState(user?.organizationName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const initials = user?.fullName.split(/\s+/).map((part) => part[0]).join('').toUpperCase().slice(0, 2) || 'TM';

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError(null);
    try { await createOrg(newName.trim()); setNewName(''); setModal(null); }
    catch (cause: unknown) { setError(errorMessage(cause, 'Could not create workspace.')); }
    finally { setLoading(false); }
  };

  const submitRename = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError(null);
    try { await updateOrgName(renameValue.trim()); setModal(null); }
    catch (cause: unknown) { setError(errorMessage(cause, 'Could not rename workspace.')); }
    finally { setLoading(false); }
  };

  return (
    <>
      <aside className="dashboard-rail select-none">
        <Link href="/dashboard" className="mb-5 flex items-center gap-3 px-2 py-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7774d9] text-sm font-extrabold text-white shadow-sm">TM</span>
          <span><strong className="block text-[15px] font-bold text-[#303b59]">TeleMind AI</strong><small className="text-[10px] text-[#8791a8]">Knowledge workspace</small></span>
        </Link>

        <div className="relative mb-5 rounded-2xl border border-white bg-white/65 p-3.5">
          <div className="mb-1 flex items-center justify-between text-[9px] font-semibold tracking-[.12em] text-[#8a94aa]">
            <span>CURRENT WORKSPACE</span><span className="rounded-md bg-[#f0efff] px-1.5 py-1 text-[8px] tracking-normal text-[#6b68c4]">{user?.role}</span>
          </div>
          <button type="button" aria-expanded={dropdownOpen} onClick={() => { setDropdownOpen((open) => !open); setError(null); }} className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-[#34405d]">
            <span className="truncate">{user?.organizationName}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#8b94a9] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-white bg-white p-2 shadow-xl">
            {error && <p role="alert" className="px-2 py-1 text-[11px] text-rose-600">{error}</p>}
            <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#929bb0]">Your workspaces</p>
            <div className="max-h-40 overflow-y-auto">
              {organizations.map((org) => <button key={org.id} type="button" disabled={loading} onClick={async () => {
                setError(null); setLoading(true);
                try { await switchOrg(org.id); setDropdownOpen(false); }
                catch (cause: unknown) { setError(errorMessage(cause, 'Could not switch workspace.')); }
                finally { setLoading(false); }
              }} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[11px] text-[#4b5671] hover:bg-[#f5f5ff] disabled:opacity-50">
                <span className="flex min-w-0 items-center gap-2"><Building2 className="h-3.5 w-3.5 shrink-0 text-[#8b93aa]" /><span className="truncate">{org.name}</span></span>
                {org.id === user?.organizationId && <Check className="h-3.5 w-3.5 text-[#7774d9]" />}
              </button>)}
            </div>
            <div className="mt-1 border-t border-[#edf0f6] pt-1">
              {canManage && <button type="button" onClick={() => { setRenameValue(user?.organizationName || ''); setModal('rename'); setDropdownOpen(false); setError(null); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] text-[#68738b] hover:bg-[#f5f5ff]"><PencilLine className="h-3.5 w-3.5" />Rename workspace</button>}
              <button type="button" onClick={() => { setModal('create'); setDropdownOpen(false); setError(null); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[11px] font-semibold text-[#6865c5] hover:bg-[#f5f5ff]"><Plus className="h-3.5 w-3.5" />Create workspace</button>
            </div>
          </div>}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Workspace navigation">
          {NAV_ITEMS.map(({ name, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} /><span>{name}</span>
            </Link>;
          })}
        </nav>

        <div className="rail-profile mt-4 flex items-center gap-2.5 border-t border-[#e9ecf3] px-1 pt-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f3ef] text-[11px] font-bold text-[#548170]">{initials}</span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-[#3b4763]">{user?.fullName}</strong><small className="text-[9px] capitalize text-[#8a94aa]">Workspace {user?.role?.toLowerCase()}</small></span>
          <button type="button" onClick={logout} title="Sign out" className="rounded-lg p-2 text-[#8a94aa] hover:bg-rose-50 hover:text-rose-500"><LogOut className="h-4 w-4" /></button>
        </div>
      </aside>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) setModal(null); }}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="workspace-modal-title">
          <div className="mb-5 flex items-center justify-between"><h2 id="workspace-modal-title" className="text-lg font-bold text-[#303b59]">{modal === 'create' ? 'Create workspace' : 'Rename workspace'}</h2><button type="button" onClick={() => setModal(null)} disabled={loading} aria-label="Close" className="rounded-lg p-2 text-[#8791a8] hover:bg-[#f0f1f7]"><X className="h-4 w-4" /></button></div>
          {error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
          <form onSubmit={modal === 'create' ? submitCreate : submitRename} className="space-y-4">
            <label className="block text-xs font-semibold text-[#5b6680]">Workspace name<input className="soft-input mt-2" required minLength={2} maxLength={120} value={modal === 'create' ? newName : renameValue} onChange={(event) => modal === 'create' ? setNewName(event.target.value) : setRenameValue(event.target.value)} /></label>
            <div className="flex justify-end gap-2"><button type="button" className="secondary-button" disabled={loading} onClick={() => setModal(null)}>Cancel</button><button type="submit" disabled={loading} className="primary-button">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{modal === 'create' ? 'Create workspace' : 'Save name'}</button></div>
          </form>
        </section>
      </div>}
    </>
  );
}
