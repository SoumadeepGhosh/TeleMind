'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { HeroPreviewVariant } from './hero-products';

export function HeroProductPreview({ variant }: { variant: HeroPreviewVariant }) {
  const reduceMotion = Boolean(useReducedMotion());

  const rowStyle: React.CSSProperties = {
    backgroundColor: 'var(--tm-surface-low)',
    borderColor: 'var(--tm-border)',
  };

  switch (variant) {
    case 'inbox':
      return (
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border" style={rowStyle}>
            <span className="font-semibold" style={{ color: 'var(--tm-text)' }}>Marcus V. · #TM-8941</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--tm-tertiary)' }}>AI ACTIVE</span>
          </div>
          <div
            className="flex items-center justify-between px-2.5 py-1.5 rounded-md border"
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', borderColor: 'rgba(124, 58, 237, 0.3)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--tm-text)' }}>CareClinic · #TM-8940</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--tm-secondary)' }}>115ms</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md border" style={rowStyle}>
            <span style={{ color: 'var(--tm-text-muted)' }}>UrbanStore · #TM-8938</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--tm-text-subtle)' }}>RESOLVED</span>
          </div>
        </div>
      );

    case 'whatsapp':
      return (
        <div className="space-y-2 text-[11px]">
          <div className="rounded-xl rounded-tl-sm px-3 py-2 max-w-[88%] border" style={{ ...rowStyle, color: 'var(--tm-text)' }}>
            Invoice #INV-2041 shows $4,200—can you apply our 22% enterprise tier?
          </div>
          <div
            className="rounded-xl rounded-tr-sm px-3 py-2 ml-auto max-w-[90%] border"
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.14)', borderColor: 'rgba(124, 58, 237, 0.32)', color: 'var(--tm-text)' }}
          >
            <div className="text-[9px] font-mono mb-0.5" style={{ color: 'var(--tm-tertiary)' }}>
              Verified · Doc #CTR-8812
            </div>
            Recalculated to <span className="font-semibold" style={{ color: 'var(--tm-tertiary)' }}>$3,276.00</span>.
          </div>
        </div>
      );

    case 'telegram':
      return (
        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex justify-between px-2.5 py-1.5 rounded border" style={rowStyle}>
            <span style={{ color: 'var(--tm-text-muted)' }}>STEP 1: TENANT ROUTING</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>18ms</span>
          </div>
          <div className="flex justify-between px-2.5 py-1.5 rounded border" style={rowStyle}>
            <span style={{ color: 'var(--tm-text-muted)' }}>STEP 2: VECTOR MATCH</span>
            <span style={{ color: 'var(--tm-secondary)' }}>0.941</span>
          </div>
          <div
            className="flex justify-between px-2.5 py-1.5 rounded border"
            style={{ backgroundColor: 'rgba(34, 211, 238, 0.1)', borderColor: 'rgba(34, 211, 238, 0.3)' }}
          >
            <span style={{ color: 'var(--tm-text)' }}>STEP 3: GROQ 120B</span>
            <span style={{ color: 'var(--tm-secondary)' }}>1,240 tok/s</span>
          </div>
        </div>
      );

    case 'takeover':
      return (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between p-2.5 rounded-lg border" style={rowStyle}>
            <div>
              <div className="font-semibold" style={{ color: 'var(--tm-text)' }}>Operator Override</div>
              <div className="text-[10px] font-mono" style={{ color: 'var(--tm-text-muted)' }}>Sarah Jenkins · Tier 3</div>
            </div>
            <div
              className="w-10 h-5 rounded-full border flex items-center justify-end p-0.5"
              style={{ backgroundColor: 'rgba(34, 211, 238, 0.2)', borderColor: 'rgba(34, 211, 238, 0.45)' }}
            >
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--tm-secondary)' }} />
            </div>
          </div>
          <div className="text-[10px] font-mono px-1" style={{ color: 'var(--tm-secondary)' }}>
            ● Swarm paused · Human response active
          </div>
        </div>
      );

    case 'swarm':
      return (
        <div className="space-y-2 text-[11px]">
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-2 rounded border" style={rowStyle}>
              <div className="text-[9px]" style={{ color: 'var(--tm-text-subtle)' }}>TTFT</div>
              <div className="font-bold" style={{ color: 'var(--tm-tertiary)' }}>42ms</div>
            </div>
            <div className="p-2 rounded border" style={rowStyle}>
              <div className="text-[9px]" style={{ color: 'var(--tm-text-subtle)' }}>TOTAL</div>
              <div className="font-bold" style={{ color: 'var(--tm-secondary)' }}>115ms</div>
            </div>
            <div className="p-2 rounded border" style={rowStyle}>
              <div className="text-[9px]" style={{ color: 'var(--tm-text-subtle)' }}>HALLUC.</div>
              <div className="font-bold" style={{ color: 'var(--tm-tertiary)' }}>0.00%</div>
            </div>
          </div>
          <div
            className="px-2.5 py-1.5 rounded border font-mono text-[10px]"
            style={{ backgroundColor: 'rgba(124, 58, 237, 0.12)', borderColor: 'rgba(124, 58, 237, 0.3)', color: 'var(--tm-primary)' }}
          >
            RLS-Partition: org_apex_44 · Verified
          </div>
        </div>
      );

    case 'knowledge':
      return (
        <div className="space-y-1.5 text-[11px]">
          {[
            { doc: 'enterprise-terms-2025.pdf', status: 'INDEXED' },
            { doc: 'hipaa-compliance-faq.md', status: 'INDEXED' },
            { doc: 'sla-schedule-v4.docx', status: 'INDEXED' },
          ].map((row) => (
            <div key={row.doc} className="flex items-center justify-between px-2.5 py-1.5 rounded border" style={rowStyle}>
              <span className="font-mono text-[10px] truncate max-w-[170px]" style={{ color: 'var(--tm-text)' }}>
                {row.doc}
              </span>
              <span className="font-mono text-[9px]" style={{ color: 'var(--tm-tertiary)' }}>{row.status}</span>
            </div>
          ))}
        </div>
      );

    case 'groq':
      return (
        <div className="space-y-2 font-mono text-[10px]">
          <div className="flex items-center justify-between" style={{ color: 'var(--tm-text)' }}>
            <span>groq-llama3-120b</span>
            <span className="font-bold" style={{ color: 'var(--tm-secondary)' }}>1,240 tok/s</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--tm-surface-high)' }}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#22D3EE]"
              initial={reduceMotion ? { width: '92%' } : { width: '0%' }}
              whileInView={{ width: '92%' }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] pt-1" style={{ color: 'var(--tm-text-muted)' }}>
            <span>Region: us-east-1</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>Sub-150ms SLA</span>
          </div>
        </div>
      );

    case 'vector':
      return (
        <div
          className="font-mono text-[10px] space-y-1.5 p-2.5 rounded-lg border"
          style={{ backgroundColor: 'var(--tm-terminal-bg)', borderColor: 'var(--tm-border)', color: 'var(--tm-terminal-text)' }}
        >
          <div className="text-slate-400">-- pgvector cosine retrieval</div>
          <div>
            <span className="text-violet-300">ORDER BY</span> embedding &lt;=&gt;{' '}
            <span className="text-cyan-300">$query_vec</span>
          </div>
          <div className="flex justify-between pt-1 text-emerald-400">
            <span>#EMB-8491-PG</span>
            <span>score: 0.941</span>
          </div>
        </div>
      );

    case 'pii':
      return (
        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="px-2.5 py-1.5 rounded border flex justify-between" style={rowStyle}>
            <span style={{ color: 'var(--tm-text-muted)' }}>Card: 4242-••••</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>[REDACTED_PAN]</span>
          </div>
          <div className="px-2.5 py-1.5 rounded border flex justify-between" style={rowStyle}>
            <span style={{ color: 'var(--tm-text-muted)' }}>SSN: •••-••-6789</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>[REDACTED]</span>
          </div>
          <div className="text-[10px] px-1" style={{ color: 'var(--tm-text-subtle)' }}>PII Latency Overhead: +4ms</div>
        </div>
      );

    case 'playground':
      return (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between font-mono text-[10px]" style={{ color: 'var(--tm-text-muted)' }}>
            <span>Temperature: 0.15</span>
            <span style={{ color: 'var(--tm-primary)' }}>Strict Grounding</span>
          </div>
          <div className="p-2.5 rounded-lg border text-[10px] leading-relaxed" style={{ ...rowStyle, color: 'var(--tm-text)' }}>
            &ldquo;Only answer from verified tenant chunks. Cite DocID on every policy claim.&rdquo;
          </div>
        </div>
      );

    case 'rls':
      return (
        <div
          className="font-mono text-[10px] space-y-1 p-2.5 rounded-lg border"
          style={{ backgroundColor: 'var(--tm-terminal-bg)', borderColor: 'var(--tm-border)', color: 'var(--tm-terminal-text)' }}
        >
          <div className="text-violet-300 font-semibold">ALTER TABLE tenant_kb_embeddings</div>
          <div className="text-slate-300 pl-2">ENABLE ROW LEVEL SECURITY;</div>
          <div className="text-cyan-300 pt-1">
            org_id = current_setting(&apos;app.current_tenant_id&apos;)
          </div>
        </div>
      );

    case 'team':
      return (
        <div className="space-y-1.5 text-[11px]">
          {[
            { name: 'Sarah Jenkins', role: 'ADMIN · Tier 3', color: 'bg-violet-500' },
            { name: 'Marcus Vance', role: 'OPERATOR', color: 'bg-cyan-500' },
            { name: 'Elena Rostova', role: 'AUDITOR', color: 'bg-emerald-500' },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between px-2.5 py-1.5 rounded border" style={rowStyle}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${m.color}`} />
                <span className="font-medium" style={{ color: 'var(--tm-text)' }}>{m.name}</span>
              </div>
              <span className="font-mono text-[9px]" style={{ color: 'var(--tm-text-subtle)' }}>{m.role}</span>
            </div>
          ))}
        </div>
      );

    case 'integrations':
      return (
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          {['WhatsApp Cloud', 'Telegram Bot', 'Notion Sync', 'Google Drive'].map((name) => (
            <div key={name} className="px-2.5 py-2 rounded border flex items-center justify-between" style={rowStyle}>
              <span className="truncate" style={{ color: 'var(--tm-text)' }}>{name}</span>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--tm-tertiary)' }} />
            </div>
          ))}
        </div>
      );

    case 'telemetry':
      return (
        <div className="space-y-2 font-mono text-[10px]">
          <div className="flex items-end gap-1.5 h-12 px-1 pt-1">
            {[42, 65, 58, 84, 72, 95, 88, 98].map((h, idx) => (
              <motion.div
                key={idx}
                className="flex-1 rounded-t bg-gradient-to-t from-[#7C3AED]/80 to-[#22D3EE]/85 origin-bottom"
                style={{ height: `${h}%` }}
                initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : idx * 0.06, ease: 'easeOut' }}
              />
            ))}
          </div>
          <div className="flex justify-between" style={{ color: 'var(--tm-text-muted)' }}>
            <span>11.8M+ Inquiries</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>99.99% SLA</span>
          </div>
        </div>
      );

    case 'billing':
      return (
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px]" style={{ color: 'var(--tm-primary)' }}>GROWTH PLAN</span>
            <span className="font-bold" style={{ color: 'var(--tm-text)' }}>₹799/mo</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--tm-surface-high)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--tm-tertiary-solid)' }}
              initial={reduceMotion ? { width: '68%' } : { width: '0%' }}
              whileInView={{ width: '68%' }}
              viewport={{ once: true }}
              transition={{ duration: reduceMotion ? 0 : 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px]" style={{ color: 'var(--tm-text-muted)' }}>
            <span>1,360 / 2,000 msgs</span>
            <span style={{ color: 'var(--tm-tertiary)' }}>ACTIVE</span>
          </div>
        </div>
      );
  }
}
