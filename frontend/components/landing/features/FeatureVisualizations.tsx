'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Zap,
  Lock,
} from 'lucide-react';

interface VisualProps {
  id: string;
  active: boolean;
  hovered: boolean;
  reduceMotion: boolean;
}

const boxStyle: React.CSSProperties = {
  backgroundColor: 'var(--tm-surface-low)',
  borderColor: 'var(--tm-border)',
};

const innerRowStyle: React.CSSProperties = {
  backgroundColor: 'var(--tm-surface-card)',
  borderColor: 'var(--tm-border)',
};

/* ── A. Omnichannel Messaging (WhatsApp & Telegram <-> TeleMind AI) ── */
function SyncVisual({ active, hovered, reduceMotion }: Omit<VisualProps, 'id'>) {
  const animate = active && !reduceMotion;
  const duration = hovered ? 1.5 : 2.2;

  return (
    <div
      className="relative h-[108px] w-full rounded-xl border px-3 py-2.5 flex items-center justify-between overflow-hidden"
      style={boxStyle}
    >
      <div className="flex flex-col gap-2 z-10">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono"
          style={{ backgroundColor: 'rgba(37, 211, 102, 0.12)', borderColor: 'rgba(37, 211, 102, 0.35)', color: 'var(--tm-tertiary)' }}
        >
          <MessageSquare size={11} />
          <span>WhatsApp</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono"
          style={{ backgroundColor: 'rgba(34, 211, 238, 0.12)', borderColor: 'rgba(34, 211, 238, 0.35)', color: 'var(--tm-secondary)' }}
        >
          <Send size={11} />
          <span>Telegram</span>
        </div>
      </div>

      <svg viewBox="0 0 120 72" className="flex-1 h-full mx-1 overflow-visible" aria-hidden="true">
        <path d="M 4 18 C 45 18, 70 36, 114 36" fill="none" stroke="rgba(124, 58, 237, 0.3)" strokeWidth="1.5" />
        <path d="M 4 54 C 45 54, 70 36, 114 36" fill="none" stroke="rgba(8, 145, 178, 0.3)" strokeWidth="1.5" />
        {animate && (
          <>
            <motion.circle
              r="3"
              fill="#10B981"
              initial={{ offsetDistance: '0%', opacity: 0 }}
              animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
              style={{ offsetPath: 'path("M 4 18 C 45 18, 70 36, 114 36")' }}
            />
            <motion.circle
              r="3"
              fill="#0891B2"
              initial={{ offsetDistance: '100%', opacity: 0 }}
              animate={{ offsetDistance: ['100%', '0%'], opacity: [0, 1, 1, 0] }}
              transition={{ duration, delay: 0.7, repeat: Infinity, ease: 'easeInOut' }}
              style={{ offsetPath: 'path("M 4 54 C 45 54, 70 36, 114 36")' }}
            />
          </>
        )}
      </svg>

      <div
        className="z-10 flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border"
        style={{ backgroundColor: 'rgba(124, 58, 237, 0.14)', borderColor: 'rgba(124, 58, 237, 0.35)' }}
      >
        <BrainCircuit size={16} style={{ color: 'var(--tm-primary)' }} />
        <span className="text-[9px] font-mono font-semibold" style={{ color: 'var(--tm-primary)' }}>
          TeleMind AI
        </span>
      </div>
    </div>
  );
}

/* ── C. Multi-Tenant Security (pgvector RLS Isolation) ── */
function VaultVisual({ active, reduceMotion }: Omit<VisualProps, 'id'>) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % 3), 1800);
    return () => window.clearInterval(id);
  }, [active, reduceMotion]);

  const tenants = [
    { id: 'org_apex', allowed: true },
    { id: 'org_care', allowed: true },
    { id: 'org_intruder', allowed: false },
  ];

  return (
    <div
      className="h-[108px] w-full rounded-xl border px-3 py-2 flex items-center justify-between gap-2 overflow-hidden"
      style={boxStyle}
    >
      <div className="flex flex-col gap-1.5 flex-1">
        {tenants.map((t, idx) => {
          const isCurrent = step === idx && active && !reduceMotion;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between px-2 py-1 rounded text-[10px] font-mono border transition-colors duration-300"
              style={{
                backgroundColor: t.allowed
                  ? isCurrent
                    ? 'rgba(52, 211, 153, 0.14)'
                    : 'var(--tm-surface-card)'
                  : isCurrent
                  ? 'rgba(239, 68, 68, 0.14)'
                  : 'var(--tm-surface-card)',
                borderColor: t.allowed
                  ? isCurrent
                    ? 'rgba(52, 211, 153, 0.45)'
                    : 'var(--tm-border)'
                  : isCurrent
                  ? 'rgba(239, 68, 68, 0.45)'
                  : 'var(--tm-border)',
                color: 'var(--tm-text)',
              }}
            >
              <span>{t.id}</span>
              {t.allowed ? (
                <ShieldCheck size={11} style={{ color: 'var(--tm-tertiary)' }} />
              ) : (
                <ShieldAlert size={11} className="text-red-500" />
              )}
            </div>
          );
        })}
      </div>

      <div
        className="flex flex-col items-center justify-center px-2.5 py-2 rounded-lg border text-center shrink-0"
        style={{ backgroundColor: 'rgba(8, 145, 178, 0.1)', borderColor: 'rgba(8, 145, 178, 0.3)' }}
      >
        <Lock size={14} style={{ color: 'var(--tm-secondary)' }} className="mb-1" />
        <span className="text-[9px] font-mono font-bold leading-tight" style={{ color: 'var(--tm-secondary)' }}>
          RLS POLICY
        </span>
        <span
          className="text-[8px] font-mono mt-0.5 font-semibold"
          style={{ color: step === 2 && !reduceMotion ? '#EF4444' : 'var(--tm-tertiary)' }}
        >
          {step === 2 && !reduceMotion ? 'DENIED' : 'VERIFIED'}
        </span>
      </div>
    </div>
  );
}

/* ── B + F. AI Intelligence (Groq 120B Processing Sequence) ── */
function GroqVisual({ active, reduceMotion }: Omit<VisualProps, 'id'>) {
  const [stage, setStage] = useState<0 | 1 | 2>(2);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const id = window.setInterval(() => {
      setStage((s) => ((s + 1) % 3) as 0 | 1 | 2);
    }, 1700);
    return () => window.clearInterval(id);
  }, [active, reduceMotion]);

  return (
    <div
      className="h-[108px] w-full rounded-xl border p-2.5 flex flex-col justify-between overflow-hidden"
      style={boxStyle}
    >
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="truncate" style={{ color: 'var(--tm-text)' }}>
          Query: &ldquo;Enterprise discount?&rdquo;
        </span>
        <span className="font-semibold shrink-0 flex items-center gap-1" style={{ color: 'var(--tm-secondary)' }}>
          <Zap size={10} />
          115ms
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--tm-surface-high)' }}>
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#22D3EE] to-[#10B981]"
          animate={
            reduceMotion
              ? { width: '100%' }
              : { width: stage === 0 ? '28%' : stage === 1 ? '68%' : '100%' }
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
      </div>

      <div
        className="px-2.5 py-1.5 rounded-lg border text-[10px] font-mono flex items-center justify-between"
        style={innerRowStyle}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={reduceMotion ? 'static' : stage}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{ color: stage === 2 || reduceMotion ? 'var(--tm-tertiary)' : 'var(--tm-primary)' }}
          >
            {stage === 0 && !reduceMotion
              ? 'Ingesting query...'
              : stage === 1 && !reduceMotion
              ? 'Groq 120B LPU reasoning...'
              : '→ 22% tier applied · Doc #CTR-8812'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── D. Event-Driven Pipeline (Unified Multi-Tenant Inbox) ── */
function InboxVisual({ active, reduceMotion }: Omit<VisualProps, 'id'>) {
  const [nodeIdx, setNodeIdx] = useState(0);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const id = window.setInterval(() => setNodeIdx((n) => (n + 1) % 4), 1000);
    return () => window.clearInterval(id);
  }, [active, reduceMotion]);

  const nodes = ['Webhook', 'RBAC', 'Route', 'Inbox'];

  return (
    <div
      className="h-[108px] w-full rounded-xl border px-3 py-2.5 flex flex-col justify-between overflow-hidden"
      style={boxStyle}
    >
      <div className="flex items-center justify-between gap-1.5">
        {nodes.map((label, idx) => {
          const isLit = reduceMotion ? idx === 3 : nodeIdx === idx && active;
          return (
            <div key={label} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <div
                className="px-2 py-1.5 rounded-lg text-[9px] font-mono font-semibold border transition-all duration-300"
                style={{
                  backgroundColor: isLit ? 'rgba(124, 58, 237, 0.18)' : 'var(--tm-surface-card)',
                  borderColor: isLit ? 'rgba(124, 58, 237, 0.55)' : 'var(--tm-border)',
                  color: isLit ? 'var(--tm-primary)' : 'var(--tm-text-muted)',
                }}
              >
                {label}
              </div>
              {idx < nodes.length - 1 && (
                <div className="flex-1 h-[1.5px] relative overflow-hidden" style={{ backgroundColor: 'var(--tm-border)' }}>
                  {isLit && !reduceMotion && (
                    <motion.div
                      className="absolute inset-y-0 w-1/2"
                      style={{ backgroundColor: 'var(--tm-secondary)' }}
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono pt-1" style={{ color: 'var(--tm-text-muted)' }}>
        <span>Org Isolation: Active</span>
        <span style={{ color: 'var(--tm-secondary)' }}>RBAC Verified</span>
      </div>
    </div>
  );
}

/* ── E. Human Operator Intervention ── */
function TakeoverVisual({ active, reduceMotion }: Omit<VisualProps, 'id'>) {
  const [humanMode, setHumanMode] = useState(false);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const id = window.setInterval(() => setHumanMode((v) => !v), 2400);
    return () => window.clearInterval(id);
  }, [active, reduceMotion]);

  const showHuman = reduceMotion ? true : humanMode;

  return (
    <div
      className="h-[108px] w-full rounded-xl border p-2.5 flex flex-col justify-between overflow-hidden"
      style={boxStyle}
    >
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.span
            key={showHuman ? 'human' : 'ai'}
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 6 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold"
            style={{ color: showHuman ? 'var(--tm-secondary)' : 'var(--tm-primary)' }}
          >
            {showHuman ? <UserCheck size={12} /> : <BrainCircuit size={12} />}
            {showHuman ? 'Human Agent · Sarah J.' : 'AI Swarm #4 Active'}
          </motion.span>
        </AnimatePresence>

        <div
          className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors border ${
            showHuman ? 'justify-end' : 'justify-start'
          }`}
          style={{
            backgroundColor: showHuman ? 'rgba(34, 211, 238, 0.2)' : 'var(--tm-surface-high)',
            borderColor: 'var(--tm-border)',
          }}
        >
          <span
            className="w-3 h-3 rounded-full transition-colors"
            style={{ backgroundColor: showHuman ? 'var(--tm-secondary)' : 'var(--tm-tertiary)' }}
          />
        </div>
      </div>

      <div
        className="px-2.5 py-2 rounded-lg border text-[10px] flex items-center justify-between"
        style={{ ...innerRowStyle, color: 'var(--tm-text)' }}
      >
        <span className="truncate">
          {showHuman ? 'Handoff complete · Operator replying' : 'Autonomous swarm resolving thread'}
        </span>
        <span className="text-[9px] font-mono shrink-0 ml-2 font-semibold" style={{ color: 'var(--tm-tertiary)' }}>
          {showHuman ? 'HANDOFF OK' : 'AUTO'}
        </span>
      </div>
    </div>
  );
}

/* ── F. Automated PII Redaction ── */
function PiiVisual({ active, hovered, reduceMotion }: Omit<VisualProps, 'id'>) {
  const animate = active && !reduceMotion;

  return (
    <div
      className="relative h-[108px] w-full rounded-xl border p-2.5 flex flex-col justify-between overflow-hidden font-mono text-[10px]"
      style={boxStyle}
    >
      {animate && (
        <motion.div
          className="absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none"
          animate={{ x: ['-40px', '320px'] }}
          transition={{
            duration: hovered ? 1.6 : 2.6,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      <div className="flex items-center justify-between px-2 py-1 rounded border" style={innerRowStyle}>
        <span style={{ color: 'var(--tm-text-muted)' }}>PAN: 4242-••••</span>
        <span className="font-semibold" style={{ color: 'var(--tm-tertiary)' }}>[REDACTED_PAN]</span>
      </div>

      <div className="flex items-center justify-between px-2 py-1 rounded border" style={innerRowStyle}>
        <span style={{ color: 'var(--tm-text-muted)' }}>SSN: •••-••-6789</span>
        <span className="font-semibold" style={{ color: 'var(--tm-tertiary)' }}>[REDACTED_SSN]</span>
      </div>

      <div className="flex items-center justify-between text-[9px] px-0.5" style={{ color: 'var(--tm-text-subtle)' }}>
        <span>HIPAA &amp; PCI-DSS Filter</span>
        <span style={{ color: 'var(--tm-primary)' }}>+4ms overhead</span>
      </div>
    </div>
  );
}

export function FeatureVisualization(props: VisualProps) {
  switch (props.id) {
    case 'sync':
      return <SyncVisual {...props} />;
    case 'vault':
      return <VaultVisual {...props} />;
    case 'groq':
      return <GroqVisual {...props} />;
    case 'inbox':
      return <InboxVisual {...props} />;
    case 'takeover':
      return <TakeoverVisual {...props} />;
    case 'pii':
      return <PiiVisual {...props} />;
    default:
      return null;
  }
}
