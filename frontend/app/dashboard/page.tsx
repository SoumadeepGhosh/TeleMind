'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, DocumentItem, errorMessage } from '@/lib/api';
import { Activity, ArrowRight, BookOpen, CircleDashed, FileText, Loader2, Plus, RefreshCw, Send, Sparkles, X } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, aiModel } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [asking, setAsking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoadingDocs(true); setDocsError(null);
    try { setDocs(await api.listDocuments()); }
    catch (cause: unknown) { setDocsError(errorMessage(cause, 'Could not load workspace notes.')); }
    finally { setLoadingDocs(false); }
  }, []);

  useEffect(() => { void Promise.resolve().then(fetchDocs); }, [fetchDocs, user?.organizationId]);

  const ask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true); setAnswer(null); setSources([]);
    try {
      const result = await api.ask(question.trim(), aiModel);
      setAnswer(result.answer); setSources(result.sources);
    } catch (cause: unknown) { setAnswer(errorMessage(cause, 'Could not run the knowledge query.')); }
    finally { setAsking(false); }
  };

  const addNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setDocsError(null);
    try {
      await api.createNote(title.trim(), content.trim());
      setTitle(''); setContent(''); setModalOpen(false); await fetchDocs();
    } catch (cause: unknown) { setDocsError(errorMessage(cause, 'Could not add this note.')); }
    finally { setSaving(false); }
  };

  const indexedCount = docs.filter((doc) => doc.status === 'INDEXED').length;
  const chunkCount = docs.reduce((sum, doc) => sum + (doc.totalChunks || 0), 0);

  return (
    <div>
      <div className="page-heading">
        <div><h1>TeleMind Intelligence Dashboard</h1><p>Knowledge notes and AI-assisted answers for {user?.organizationName}.</p></div>
        <div className="flex flex-wrap gap-2">
          <span className="status-pill bg-[#eef0ff] text-[#625fba]"><Activity className="h-3.5 w-3.5" />{aiModel === 'groq' ? 'Groq selected' : 'Gemini selected'}</span>
          <span className="status-pill bg-[#fff5e7] text-[#a26f29]"><CircleDashed className="h-3.5 w-3.5" />Channels not connected</span>
        </div>
      </div>

      {docsError && <div role="alert" className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">{docsError}</div>}

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card metric-card"><p className="text-xs text-[#7d879f]">Indexed notes shown</p><p className="mt-3 text-3xl font-semibold tracking-tight text-[#2e3957]">{loadingDocs ? '—' : indexedCount}</p><p className="mt-1 text-[11px] text-[#7c78cb]">Workspace notes · latest 20</p></div>
        <div className="surface-card metric-card"><p className="text-xs text-[#7d879f]">Indexed text chunks</p><p className="mt-3 text-3xl font-semibold tracking-tight text-[#2e3957]">{loadingDocs ? '—' : chunkCount.toLocaleString()}</p><p className="mt-1 text-[11px] text-[#658a7b]">From notes in this list</p></div>
        <div className="surface-card metric-card"><p className="text-xs text-[#7d879f]">Query model preference</p><p className="mt-3 text-2xl font-semibold tracking-tight text-[#2e3957]">{aiModel === 'groq' ? 'Groq' : 'Gemini'}</p><p className="mt-1 text-[11px] text-[#7d879f]">Stored in this browser</p></div>
        <div className="surface-card metric-card"><p className="text-xs text-[#7d879f]">Answer evaluation</p><p className="mt-3 text-2xl font-semibold tracking-tight text-[#2e3957]">Not measured</p><p className="mt-1 text-[11px] text-[#a17b45]">No evaluation set configured</p></div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <div className="surface-card flex min-h-[560px] flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><h2 className="text-base font-semibold text-[#35405e]">Knowledge notes</h2><button type="button" onClick={fetchDocs} aria-label="Refresh notes" className="rounded-lg p-2 text-[#8791a8] hover:bg-white hover:text-[#6966c3]"><RefreshCw className={`h-3.5 w-3.5 ${loadingDocs ? 'animate-spin' : ''}`} /></button></div>
            <button type="button" onClick={() => setModalOpen(true)} className="primary-button"><Plus className="h-4 w-4" />Add note</button>
          </div>
          {loadingDocs ? <div className="flex flex-1 items-center justify-center text-sm text-[#8791a8]"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading workspace notes…</div> : docs.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center"><BookOpen className="mb-3 h-8 w-8 text-[#b2b6cb]" /><p className="text-sm font-semibold text-[#4c5874]">No notes in this workspace</p><p className="mt-1 max-w-xs text-xs text-[#8791a8]">Add a text note to give the assistant workspace-specific information.</p></div> : <div className="space-y-2">
            {docs.slice(0, 6).map((doc) => <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3.5 py-3">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0efff] text-[#7774d9]"><FileText className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#46516d]">{doc.title}</p><p className="mt-1 text-[10px] text-[#8b95a9]">{doc.totalChunks} chunks · {new Date(doc.createdAt).toLocaleDateString()}</p></div></div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold ${doc.status === 'INDEXED' ? 'bg-[#e7f5ef] text-[#4d896f]' : 'bg-[#fff3df] text-[#9a7135]'}`}>{doc.status}</span>
            </div>)}
          </div>}
          <div className="mt-auto flex items-center justify-between border-t border-[#ebedf3] pt-4 text-[11px] text-[#8993a9]"><span>Workspace: {user?.organizationName}</span><Link href="/dashboard/knowledge" className="inline-flex items-center gap-1 font-semibold text-[#706dc9] hover:text-[#514db1]">Manage notes <ArrowRight className="h-3.5 w-3.5" /></Link></div>
        </div>

        <div className="surface-card flex min-h-[560px] flex-col p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between"><div><h2 className="flex items-center gap-2 text-base font-semibold text-[#35405e]"><Sparkles className="h-4 w-4 text-[#7774d9]" />Knowledge assistant</h2><p className="mt-1 text-[11px] text-[#8791a8]">Try a question against this workspace’s notes.</p></div><span className="rounded-full bg-[#eff0ff] px-2.5 py-1 text-[9px] font-bold text-[#6562bf]">{aiModel.toUpperCase()}</span></div>
          <div className="flex-1 space-y-4">
            <div className="ml-auto max-w-[94%] rounded-2xl rounded-tr-sm bg-[#eeedff] p-4"><p className="mb-1 text-[10px] font-semibold text-[#716ec5]">You · test query</p><p className="text-xs leading-5 text-[#46516c]">{question || 'Your question will appear here.'}</p></div>
            <div className="max-w-[96%] rounded-2xl rounded-tl-sm bg-white/90 p-4">
              <p className="mb-2 text-[10px] font-semibold text-[#716ec5]">TeleMind assistant</p>
              {asking ? <p className="flex items-center gap-2 text-xs text-[#7d879f]"><Loader2 className="h-4 w-4 animate-spin" />Searching workspace notes…</p> : <p className="whitespace-pre-wrap text-xs leading-5 text-[#46516c]">{answer || 'Ask a question to see the assistant response and any matching note sources.'}</p>}
              {sources.length > 0 && <div className="mt-4 space-y-1 rounded-xl bg-[#f4f5fb] p-3">{sources.map((source) => <p key={source} className="text-[10px] text-[#6f7890]">Source · {source}</p>)}</div>}
            </div>
          </div>
          <form onSubmit={ask} className="mt-5 flex gap-2 rounded-xl border border-[#e6e8f1] bg-white p-1.5">
            <input className="min-w-0 flex-1 border-0 bg-transparent px-3 text-xs text-[#46516c] outline-none placeholder:text-[#9aa3b6]" aria-label="Ask the knowledge assistant" placeholder="Ask about your workspace notes…" value={question} onChange={(event) => setQuestion(event.target.value)} disabled={asking} />
            <button type="submit" disabled={asking || !question.trim()} aria-label="Send question" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7774d9] text-white hover:bg-[#6865ca] disabled:opacity-50">{asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button>
          </form>
        </div>
      </section>

      {modalOpen && <div className="modal-backdrop" role="presentation"><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="note-modal-title"><div className="mb-4 flex items-center justify-between"><h2 id="note-modal-title" className="text-lg font-bold text-[#303b59]">Add a knowledge note</h2><button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="rounded-lg p-2 text-[#8791a8] hover:bg-[#f0f1f7]"><X className="h-4 w-4" /></button></div><form onSubmit={addNote} className="space-y-4"><label className="block text-xs font-semibold text-[#5b6680]">Title<input className="soft-input mt-2" required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="block text-xs font-semibold text-[#5b6680]">Note text<textarea className="soft-input mt-2 min-h-36 resize-y" required minLength={5} maxLength={100000} value={content} onChange={(event) => setContent(event.target.value)} /></label><div className="flex justify-end gap-2"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save and index</button></div></form></section></div>}
    </div>
  );
}
