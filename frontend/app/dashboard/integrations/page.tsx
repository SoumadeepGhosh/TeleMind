'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, errorMessage, IntegrationStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Bot, CircleDashed, Code2, Copy, KeyRound, Loader2, Send, Smartphone, Sparkles } from 'lucide-react';

export default function IntegrationsPage() {
  const { aiModel } = useAuth();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const refresh = useCallback(async () => { try { setStatus(await api.getIntegrationStatus()); } catch (e) { setError(errorMessage(e, 'Could not load integrations.')); } }, []);
  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);
  const testQuery = async (event: React.FormEvent) => { event.preventDefault(); if (!question.trim() || busy) return; setBusy(true); setError(''); setAnswer(''); setSources([]); try { const result = await api.ask(question.trim(), aiModel); setAnswer(result.answer); setSources(result.sources); } catch (e) { setError(errorMessage(e, 'Knowledge API request failed.')); } finally { setBusy(false); } };
  const copyEndpoints = async () => { const text = ['GET /api/v1/knowledge/documents', 'POST /api/v1/knowledge/notes', 'POST /api/v1/knowledge/documents/upload', 'POST /api/v1/knowledge/ask', 'DELETE /api/v1/knowledge/documents/:id'].join('\n'); await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 2000); };
  return <div>
    <header className="page-heading"><div><h1>API & Integrations</h1><p>Check live connections and try the workspace knowledge API.</p></div><Link className="secondary-button" href="/dashboard/channels">Manage channels<ArrowRight className="h-3.5 w-3.5"/></Link></header>
    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="mb-5 grid gap-4 sm:grid-cols-2">
      <article className="surface-card flex items-center justify-between p-5"><div className="flex items-center gap-3"><Send className="h-5 w-5 text-[#7774d9]"/><div><h2 className="text-sm font-semibold text-[#35405e]">Telegram</h2><p className="text-xs text-[#8993a9]">{status?.telegram.botUsername ? `@${status.telegram.botUsername}` : 'No bot configured'}</p></div></div><span className={`status-pill ${status?.telegram.connected ? 'bg-[#e7f5ef] text-[#4d896f]' : 'bg-[#fff5e7] text-[#a26f29]'}`}>{status?.telegram.connected ? 'Connected' : status?.telegram.status || 'Loading'}</span></article>
      <article className="surface-card flex items-center justify-between p-5"><div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-[#4d896f]"/><div><h2 className="text-sm font-semibold text-[#35405e]">WhatsApp demo</h2><p className="text-xs text-[#8993a9]">One shared phone session</p></div></div><span className={`status-pill ${status?.whatsappDemo.status === 'CONNECTED' ? 'bg-[#e7f5ef] text-[#4d896f]' : 'bg-[#fff5e7] text-[#a26f29]'}`}>{status?.whatsappDemo.status || 'Loading'}</span></article>
    </section>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <section className="surface-card p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#7774d9]"/><h2 className="font-semibold text-[#35405e]">Try the Knowledge API</h2></div><p className="muted-copy mt-1">This sends a real query using your signed-in session and selected model ({aiModel}).</p>
        <form onSubmit={testQuery} className="mt-4 flex gap-2"><input className="soft-input" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your workspace…" aria-label="Test the knowledge API"/><button className="primary-button" disabled={busy || !question.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4"/>}Ask</button></form>
        {answer && <div className="mt-4 rounded-xl bg-[#f6f7fb] p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-[#46516d]">{answer}</p>{sources.length > 0 && <div className="mt-3 border-t border-[#e6e8f1] pt-3 text-xs text-[#68738d]"><strong>Sources</strong><ul className="mt-1 list-inside list-disc">{sources.map((source) => <li key={source}>{source}</li>)}</ul></div>}</div>}
        <div className="mt-6 flex items-center justify-between gap-2 border-t border-[#ebedf3] pt-4"><div><h3 className="text-sm font-semibold text-[#35405e]">Knowledge endpoints</h3><p className="muted-copy mt-1">Authenticated with your dashboard bearer token.</p></div><button className="secondary-button" onClick={() => void copyEndpoints()}><Copy className="h-4 w-4"/>{copied ? 'Copied' : 'Copy routes'}</button></div>
        <div className="mt-3 space-y-2 font-mono text-[11px] text-[#56617c]"><p>GET /api/v1/knowledge/documents</p><p>POST /api/v1/knowledge/notes</p><p>POST /api/v1/knowledge/documents/upload</p><p>POST /api/v1/knowledge/ask</p><p>DELETE /api/v1/knowledge/documents/:id</p></div>
      </section>
      <aside className="surface-card h-fit p-5"><div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-[#7774d9]"/><h2 className="font-semibold text-[#35405e]">Using the API</h2></div><p className="muted-copy mt-2">The dashboard uses your JWT session. Separate API key creation and revocation are not implemented.</p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-[#28334f] p-4 text-[11px] leading-5 text-white">{'POST /api/v1/knowledge/ask\nAuthorization: Bearer <session-token>\nContent-Type: application/json\n\n{"question":"What is our return policy?","model":"' + aiModel + '"}'}</pre>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#fffaf0] p-3 text-xs leading-5 text-[#805f2e]"><KeyRound className="mt-0.5 h-4 w-4 shrink-0"/>Do not share your session token. Use the query tester here to try requests without copying credentials.</div>
        <Link className="secondary-button mt-4 w-full justify-center" href="/dashboard/knowledge">Manage knowledge files<ArrowRight className="h-3.5 w-3.5"/></Link>
        <button className="secondary-button mt-2 w-full justify-center" onClick={() => void refresh()}><CircleDashed className="h-4 w-4"/>Refresh connection status</button>
      </aside>
    </div>
  </div>;
}
