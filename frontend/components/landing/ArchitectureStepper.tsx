'use client';

import { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { ARCHITECTURE_CHAPTERS } from './LandingData';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

export function ArchitectureStepper() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);

  const chapter = ARCHITECTURE_CHAPTERS[activeIndex];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chapter.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable in restricted contexts
    }
  };

  const prev = () =>
    setActiveIndex((i) => (i - 1 + ARCHITECTURE_CHAPTERS.length) % ARCHITECTURE_CHAPTERS.length);
  const next = () => setActiveIndex((i) => (i + 1) % ARCHITECTURE_CHAPTERS.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Rail: 5 Interactive Steps */}
      <div className="lg:col-span-4 flex flex-col gap-2.5">
        {ARCHITECTURE_CHAPTERS.map((item, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="text-left p-4 rounded-xl transition-all flex items-center justify-between border"
              style={{
                backgroundColor: active ? 'var(--tm-surface-high)' : 'var(--tm-surface-low)',
                borderColor: active ? 'rgba(128, 64, 255, 0.45)' : 'var(--tm-border)',
                color: active ? 'var(--tm-text)' : 'var(--tm-text-muted)',
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--tm-primary-solid)' : 'var(--tm-surface-high)',
                    color: active ? '#ffffff' : 'var(--tm-text)',
                  }}
                >
                  {item.num}
                </span>
                <div>
                  <div className="text-xs font-bold">{item.navTitle}</div>
                  <div className="text-[11px] font-mono" style={{ color: 'var(--tm-text-subtle)' }}>
                    {item.navSubtitle}
                  </div>
                </div>
              </div>
              <ChevronRight
                size={16}
                style={{ color: active ? 'var(--tm-primary)' : 'var(--tm-text-subtle)' }}
              />
            </button>
          );
        })}

        <div
          className="mt-2 p-4 rounded-xl text-xs font-mono flex items-center justify-between border"
          style={{
            backgroundColor: 'var(--tm-surface-low)',
            borderColor: 'var(--tm-border)',
          }}
        >
          <span style={{ color: 'var(--tm-text-subtle)' }}>COMPLETION TIME:</span>
          <span className="font-bold" style={{ color: 'var(--tm-tertiary)' }}>
            &lt; 3 MINUTES TO PROD
          </span>
        </div>
      </div>

      {/* Right: Dynamic Chapter Card */}
      <div
        onPointerEnter={() => setCardHovered(true)}
        onPointerLeave={() => setCardHovered(false)}
        className="lg:col-span-8 tm-glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden min-h-[460px] flex flex-col justify-between"
      >
        <NeonBorderOverlay hovered={cardHovered} radiusClass="rounded-2xl" />
        {/* Watermark */}
        <div
          className="absolute -right-3 -bottom-8 text-[140px] font-black pointer-events-none select-none leading-none opacity-[0.04]"
          aria-hidden="true"
        >
          {chapter.num}
        </div>

        <div key={chapter.num} className="tm-chapter-enter relative z-10">
          {/* Card Header */}
          <div
            className="flex items-center justify-between pb-4 mb-6 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 sm:px-8 pt-5 border-b"
            style={{
              backgroundColor: 'var(--tm-surface-high)',
              borderColor: 'var(--tm-border)',
            }}
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="px-2.5 py-1 rounded font-mono text-[11px] font-bold text-white"
                style={{ backgroundColor: 'var(--tm-primary-solid)' }}
              >
                CHAPTER {chapter.num} / 05
              </span>
              <span className="font-mono text-xs font-semibold" style={{ color: 'var(--tm-secondary)' }}>
                {chapter.cat}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous chapter"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
                style={{
                  backgroundColor: 'var(--tm-surface)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              >
                <ArrowLeft size={15} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next chapter"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border"
                style={{
                  backgroundColor: 'var(--tm-surface)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-text)',
                }}
              >
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight mb-2.5" style={{ color: 'var(--tm-text)' }}>
            {chapter.title}
          </h3>
          <p className="text-[15px] leading-relaxed max-w-2xl mb-6" style={{ color: 'var(--tm-text-muted)' }}>
            {chapter.desc}
          </p>

          {/* CLI Terminal (intentionally dark in both themes) */}
          <div
            className="rounded-xl p-4 font-mono text-xs border"
            style={{
              backgroundColor: 'var(--tm-terminal-bg)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-terminal-text)',
            }}
          >
            <div
              className="flex items-center justify-between text-[11px] pb-2.5 mb-3 border-b text-slate-400"
              style={{
                borderColor: 'rgba(148, 163, 184, 0.16)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <Terminal size={13} className="text-emerald-400" />
                bash — telemind-cli v2.9
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold hidden sm:inline text-emerald-400">
                  VERIFIED RUNTIME
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-300 transition-colors"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <pre className="overflow-x-auto whitespace-pre font-mono leading-relaxed text-xs text-cyan-300">
              {chapter.code}
            </pre>
          </div>

          {/* Spec Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {chapter.badges.map((badge, i) => (
              <span
                key={badge}
                className="px-2.5 py-1 rounded text-[11px] font-mono border"
                style={{
                  backgroundColor: 'var(--tm-surface-high)',
                  borderColor: 'var(--tm-border)',
                  color: i === 2 ? 'var(--tm-tertiary)' : 'var(--tm-text-muted)',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-6 mt-6 flex items-center justify-between text-xs font-mono border-t relative z-10"
          style={{ borderColor: 'var(--tm-border)' }}
        >
          <span style={{ color: 'var(--tm-text-subtle)' }}>
            Step {activeIndex + 1} of {ARCHITECTURE_CHAPTERS.length}
          </span>
          <button
            type="button"
            onClick={next}
            className="flex items-center gap-1.5 font-semibold transition-colors"
            style={{ color: 'var(--tm-primary)' }}
          >
            <span>Next Architecture Step</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
