'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage, IntegrationStatus } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { AlertCircle, Bot, CircleDashed, Loader2, MessageCircle, RefreshCw, Send, Smartphone, Unplug } from 'lucide-react';
import Image from 'next/image';

export default function ChannelsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const refresh = useCallback(async () => {
    try {
      const next = await api.getIntegrationStatus();
      setStatus(next);
      if (next.whatsappDemo.claimedByWorkspace && !next.whatsappDemo.status.includes('CONNECTED')) {
        const result = await api.getWhatsappDemoQr();
        setQr(result.qrDataUrl);
      } else setQr(null);
    } catch (cause) { setError(errorMessage(cause, 'Could not load channel status.')); }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
    const poll = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(poll);
  }, [refresh]);

  const connectTelegram = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await api.connectTelegram(token);
      setToken(''); setNotice(`Connected @${result.botUsername}. Open that bot in Telegram and send /start.`);
      await refresh();
    } catch (cause) { setError(errorMessage(cause, 'Could not connect this Telegram bot.')); }
    finally { setBusy(false); }
  };

  const disconnectTelegram = async () => {
    if (!window.confirm('Disconnect the Telegram bot from this workspace?')) return;
    setBusy(true); setError('');
    try { await api.disconnectTelegram(); setNotice('Telegram bot disconnected.'); await refresh(); }
    catch (cause) { setError(errorMessage(cause, 'Could not disconnect Telegram.')); }
    finally { setBusy(false); }
  };

  const claimWhatsApp = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await api.claimWhatsappDemo(); setNotice('This workspace now has the shared demo scanner.'); await refresh(); }
    catch (cause) { setError(errorMessage(cause, 'Could not claim the WhatsApp demo.')); }
    finally { setBusy(false); }
  };

  const releaseWhatsApp = async () => {
    if (!window.confirm('Release the shared WhatsApp demo from this workspace? Other workspaces will then be able to claim it.')) return;
    setBusy(true); setError('');
    try { await api.releaseWhatsappDemo(); setNotice('The shared WhatsApp demo is released.'); await refresh(); }
    catch (cause) { setError(errorMessage(cause, 'Could not release the WhatsApp demo.')); }
    finally { setBusy(false); }
  };

  return <div>
    <header className="page-heading"><div><h1>Telegram & WhatsApp</h1><p>Connect messaging to {user?.organizationName || 'this workspace'}.</p></div><button className="secondary-button" onClick={() => void refresh()}><RefreshCw className="h-4 w-4"/>Refresh status</button></header>
    {error && <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    {!canManage && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Only workspace owners and admins can connect or disconnect channels.</p>}
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="surface-card p-5 sm:p-6"><header className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0efff] text-[#7774d9]"><Send className="h-5 w-5"/></span><div><h2 className="font-semibold text-[#35405e]">Telegram bot</h2><p className="text-xs text-[#8993a9]">One bot token per workspace</p></div></div><span className={`status-pill ${status?.telegram.connected ? 'bg-[#e7f5ef] text-[#4d896f]' : 'bg-[#fff5e7] text-[#a26f29]'}`}><span className="status-dot"/>{status?.telegram.connected ? 'Connected' : status?.telegram.status || 'Loading'}</span></header>
        {status?.telegram.botUsername && <p className="mt-4 rounded-xl bg-[#f6f7fb] p-3 text-sm text-[#4d5874]">Bot: <strong>@{status.telegram.botUsername}</strong></p>}
        {status?.telegram.lastError && <p className="mt-3 text-xs text-rose-700">{status.telegram.lastError}</p>}
        {!status?.telegram.connected ? <form className="mt-4 space-y-3" onSubmit={connectTelegram}><label className="block text-xs font-semibold text-[#5b6680]">Bot token from @BotFather<input className="soft-input mt-2" type="password" autoComplete="new-password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the Telegram bot token" minLength={20} maxLength={512} required disabled={!canManage || busy}/></label><button className="primary-button" disabled={!canManage || busy || !token.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Bot className="h-4 w-4"/>}Connect Telegram</button></form> : <button className="secondary-button mt-4" onClick={() => void disconnectTelegram()} disabled={!canManage || busy}><Unplug className="h-4 w-4"/>Disconnect bot</button>}
        <div className="mt-5 rounded-xl bg-[#f6f7fb] p-4 text-xs leading-5 text-[#68738d]"><strong className="text-[#46516d]">Setup steps</strong><ol className="ml-4 mt-2 list-decimal space-y-1"><li>In Telegram, open <strong>@BotFather</strong> and send <code>/newbot</code>.</li><li>Choose a display name and unique username; copy the token it gives you.</li><li>Paste the token above. TeleMind encrypts it and starts this workspace&apos;s bot.</li><li>Open your new bot and send <code>/start</code>. It will answer using this workspace&apos;s knowledge.</li></ol></div>
      </article>

      <article className="surface-card p-5 sm:p-6"><header className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f5ef] text-[#4d896f]"><Smartphone className="h-5 w-5"/></span><div><h2 className="font-semibold text-[#35405e]">WhatsApp demo scanner</h2><p className="text-xs text-[#8993a9]">One shared linked phone for demo use</p></div></div><span className={`status-pill ${status?.whatsappDemo.status === 'CONNECTED' ? 'bg-[#e7f5ef] text-[#4d896f]' : 'bg-[#fff5e7] text-[#a26f29]'}`}><span className="status-dot"/>{status?.whatsappDemo.status || 'Loading'}</span></header>
        <p className="mt-4 rounded-xl border border-[#f2dfb9] bg-[#fffaf0] p-3 text-xs leading-5 text-[#805f2e]"><strong>Demo limitation:</strong> this server has one WhatsApp Web session, so only one workspace can claim it at a time. The QR links the phone to this TeleMind demo. Messages are answered with the knowledge of the workspace currently claiming it.</p>
        {status?.whatsappDemo.lastError && <p role="alert" className="mt-3 text-xs text-rose-700">{status.whatsappDemo.lastError}</p>}
        {status?.whatsappDemo.claimedByWorkspace ? <div className="mt-4 space-y-3">{status.whatsappDemo.status === 'CONNECTED' ? <div className="rounded-xl bg-[#e7f5ef] p-4 text-sm text-[#416f5b]">WhatsApp is linked{status.whatsappDemo.phoneNumber ? ` as +${status.whatsappDemo.phoneNumber}` : ''}. Send a message to that number from another phone to test it.</div> : qr ? <div className="rounded-xl bg-white p-4 text-center"><Image className="mx-auto h-64 w-64" src={qr} width={256} height={256} unoptimized alt="WhatsApp link QR code"/><p className="mt-2 text-xs text-[#68738d]">On the phone used for the demo account, open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device, then scan this code.</p></div> : <div className="rounded-xl bg-[#f6f7fb] p-4 text-sm text-[#68738d]">{status.whatsappDemo.status === 'ERROR' ? 'The scanner could not start. Check that the backend has Chrome/Chromium installed.' : <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Waiting for the server to generate a QR code…</span>}</div>}<div className="flex flex-wrap gap-2"><button className="secondary-button" onClick={() => void refresh()}><RefreshCw className="h-4 w-4"/>Refresh QR</button><button className="secondary-button" disabled={!canManage || busy} onClick={() => void releaseWhatsApp()}><Unplug className="h-4 w-4"/>Release demo</button></div></div> : <div className="mt-4">{status?.whatsappDemo.available ? <button className="primary-button" disabled={!canManage || busy} onClick={() => void claimWhatsApp()}>{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <CircleDashed className="h-4 w-4"/>}Claim demo scanner</button> : <p className="rounded-xl bg-[#f6f7fb] p-3 text-xs text-[#68738d]">The shared demo phone is currently claimed by another workspace. Ask that workspace to release it when they finish testing.</p>}</div>}
        <div className="mt-5 rounded-xl bg-[#f6f7fb] p-4 text-xs leading-5 text-[#68738d]"><strong className="text-[#46516d]">How to test</strong><ol className="ml-4 mt-2 list-decimal space-y-1"><li>An owner/admin claims the demo scanner.</li><li>Wait for the QR, then scan it from Linked Devices on the demo phone.</li><li>From a different phone, message the linked WhatsApp number and ask about a note in this workspace.</li><li>Release the demo when finished so another workspace can try it.</li></ol><p className="mt-2">The backend must be running with Chrome/Chromium available for scanning. Releasing changes workspace routing; it does not log the linked phone out.</p></div>
      </article>
    </section>
    <section className="surface-card mt-5 p-5"><h2 className="flex items-center gap-2 font-semibold text-[#35405e]"><MessageCircle className="h-4 w-4 text-[#7774d9]"/>Messages and data scope</h2><p className="muted-copy mt-2">Both channels use the active workspace&apos;s indexed documents for note search, file uploads, and generated study guides. The current dashboard does not include a conversation inbox.</p></section>
  </div>;
}
