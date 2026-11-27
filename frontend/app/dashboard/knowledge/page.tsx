'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, DocumentItem, errorMessage } from '@/lib/api';
import { BookOpen, FileText, Loader2, Plus, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react';

export default function KnowledgePage() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setItems(await api.listDocuments()); } catch (e) { setError(errorMessage(e, 'Could not load notes.')); } finally { setLoading(false); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  const add = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); setError(''); try { const result = await api.createNote(title.trim(), content.trim()); setNotice(`Note added and indexed (${result.chunkCount} chunks).`); setTitle(''); setContent(''); setOpen(false); await load(); } catch (e) { setError(errorMessage(e, 'Could not add note.')); } finally { setBusy(false); } };
  const upload = async () => {
    if (!selectedFile || busy) return;
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File exceeds the 10 MB size limit.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api.uploadDocument(selectedFile);
      setNotice(`Uploaded and indexed ${selectedFile.name} (${result.chunkCount} chunks).`);
      setSelectedFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await load();
    } catch (e) { setError(errorMessage(e, 'Could not upload this file.')); }
    finally { setBusy(false); }
  };
  const remove = async (doc: DocumentItem) => { if (!window.confirm(`Delete “${doc.title}” and its indexed text?`)) return; setError(''); try { await api.deleteDocument(doc.id); setItems((old) => old.filter((item) => item.id !== doc.id)); setNotice(`Deleted “${doc.title}”.`); } catch (e) { setError(errorMessage(e, 'Could not delete this note.')); } };
  const visible = items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
  const chunks = items.reduce((sum, doc) => sum + doc.totalChunks, 0);
  return <div>
    <header className="page-heading"><div><h1>Knowledge Base</h1><p>Add and manage text notes used by the workspace assistant.</p></div><button className="primary-button" onClick={() => setOpen(true)}><Plus className="h-4 w-4"/>Add note</button></header>
    {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}<button className="ml-3 underline" onClick={() => setNotice('')}>Dismiss</button></p>}
    <section className="mb-5 grid gap-4 sm:grid-cols-3"><div className="surface-card metric-card"><p className="muted-copy">Notes returned</p><strong className="mt-2 block text-2xl text-[#35405e]">{loading ? '—' : items.length}</strong><p className="muted-copy mt-1">Latest 20 for this workspace</p></div><div className="surface-card metric-card"><p className="muted-copy">Indexed notes</p><strong className="mt-2 block text-2xl text-[#35405e]">{loading ? '—' : items.filter((d) => d.status === 'INDEXED').length}</strong></div><div className="surface-card metric-card"><p className="muted-copy">Text chunks</p><strong className="mt-2 block text-2xl text-[#35405e]">{loading ? '—' : chunks}</strong></div></section>
    <section className="grid gap-5 xl:grid-cols-[1fr_300px]"><div className="surface-card overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ebedf3] p-4"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#929bb0]"/><input className="soft-input pl-9" aria-label="Search note titles" placeholder="Search note titles…" value={query} onChange={(e) => setQuery(e.target.value)}/></div><button className="secondary-button" onClick={() => void load()} aria-label="Refresh notes"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/></button></div>
      {loading ? <div className="p-12 text-center muted-copy"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin"/>Loading notes…</div> : visible.length === 0 ? <div className="p-12 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-[#aab1c4]"/><p className="font-semibold text-[#4c5874]">{query ? 'No matching notes' : 'No notes yet'}</p><p className="muted-copy mt-1">{query ? 'Try another title.' : 'Add a text note to start building workspace knowledge.'}</p></div> : <div className="overflow-x-auto"><table className="page-table"><thead><tr><th>Note</th><th>Type</th><th>Chunks</th><th>Status</th><th>Updated</th><th></th></tr></thead><tbody>{visible.map((doc) => <tr key={doc.id}><td><span className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-[#7774d9]"/>{doc.title}</span></td><td>{doc.mimeType || 'text/plain'}</td><td>{doc.totalChunks}</td><td><span className="status-pill bg-[#e7f5ef] text-[#4d896f]">{doc.status}</span></td><td>{new Date(doc.updatedAt).toLocaleDateString()}</td><td className="text-right"><button className="rounded-lg p-2 text-[#929bb0] hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${doc.title}`} onClick={() => void remove(doc)}><Trash2 className="h-4 w-4"/></button></td></tr>)}</tbody></table></div>}</div>
      <aside className="surface-card h-fit p-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0efff] text-[#7774d9]"><Upload className="h-5 w-5"/></span><h2 className="mt-4 font-semibold text-[#35405e]">Upload knowledge file</h2><p className="muted-copy mt-2">Upload a document and TeleMind will extract its text, split it into chunks, and index it for assistant queries.</p><input ref={fileInput} className="mt-4 block w-full text-xs text-[#68738d] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f0efff] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#6562bf]" type="file" accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/plain,text/markdown,text/csv,application/json" aria-label="Choose a knowledge file" onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setError(''); }}/><p className="mt-2 text-[11px] text-[#8993a9]">PDF, TXT, MD, CSV, or JSON · Up to 10 MB</p>{selectedFile && <p className="mt-2 truncate text-xs font-medium text-[#46516d]" title={selectedFile.name}>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>}<button className="primary-button mt-4 w-full justify-center" onClick={() => void upload()} disabled={!selectedFile || busy}>{busy ? <><Loader2 className="h-4 w-4 animate-spin"/>Uploading and indexing</> : <><Upload className="h-4 w-4"/>Upload and index</>}</button><div className="mt-4 rounded-xl bg-[#f5f6fb] p-3 text-xs leading-5 text-[#7d879f]">Text-based PDFs are supported. Scanned image PDFs need OCR and may not produce readable text.</div><button className="secondary-button mt-3 w-full justify-center" onClick={() => setOpen(true)}><Plus className="h-4 w-4"/>Write a text note</button></aside></section>
    {open && <div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-labelledby="note-title" className="modal-card"><div className="mb-4 flex justify-between"><h2 id="note-title" className="text-lg font-bold text-[#303b59]">Add knowledge note</h2><button aria-label="Close" onClick={() => setOpen(false)}><X className="h-4 w-4"/></button></div><form className="space-y-4" onSubmit={add}><label className="block text-xs font-semibold text-[#5b6680]">Title<input className="soft-input mt-2" required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)}/></label><label className="block text-xs font-semibold text-[#5b6680]">Text<textarea className="soft-input mt-2 min-h-40" required minLength={5} maxLength={100000} value={content} onChange={(e) => setContent(e.target.value)}/></label><div className="flex justify-end gap-2"><button type="button" className="secondary-button" onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button className="primary-button" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin"/>}Save and index</button></div></form></section></div>}
  </div>;
}
