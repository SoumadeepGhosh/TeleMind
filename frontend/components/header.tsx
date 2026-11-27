'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const pathname = usePathname();
  const { user, aiModel, setAiModel } = useAuth();
  const titles: Record<string, string> = {
    '/dashboard/knowledge': 'Knowledge Base',
    '/dashboard/playground': 'AI Testing Playground',
    '/dashboard/channels': 'Channels',
    '/dashboard/team': 'Team & Members',
    '/dashboard/settings': 'Workspace Settings',
  };

  return (
    <header className="h-16 border-b border-[#1F2937] px-8 flex items-center justify-between bg-[#0B0F19]/80 backdrop-blur sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white">{titles[pathname] || 'TeleMind Dashboard'}</span>
        <span className="text-xs text-slate-500">·</span>
        <span className="text-xs font-semibold text-indigo-400">{user?.organizationName || 'Workspace'}</span>
      </div>
      <button
        type="button"
        onClick={() => setAiModel(aiModel === 'groq' ? 'gemini' : 'groq')}
        title="Change the model preference used for dashboard knowledge queries"
        className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition"
      >
        {aiModel === 'groq' ? 'Groq selected for queries · switch' : 'Gemini selected for queries · switch'}
      </button>
    </header>
  );
}
