'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { BrainCircuit, ArrowUpRight } from 'lucide-react';

const PRODUCT_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Architecture', href: '/#how-it-works' },
  { label: 'Security', href: '/#security' },
  { label: 'Live Demo', href: '/#security' },
  { label: 'Pricing', href: '/#pricing' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Refund & Cancellation Policy', href: '/refund-policy' },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const inView = useInView(footerRef, { once: true, amount: 0.15 });
  const reduceMotion = Boolean(useReducedMotion());

  const colAnim = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
          transition: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <footer
      ref={footerRef}
      className="relative w-full border-t overflow-hidden"
      style={{
        backgroundColor: 'var(--tm-bg)',
        borderColor: 'var(--tm-border)',
      }}
    >
      {/* Subtle Top Gradient Hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-[1px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.45) 35%, rgba(34, 211, 238, 0.45) 65%, transparent 100%)',
        }}
      />

      <div className="w-full max-w-[1280px] mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Area A: Brand Information */}
          <motion.div {...colAnim(0)} className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2.5 w-fit group">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border transition-shadow group-hover:shadow-[0_0_18px_rgba(139,92,246,0.35)]"
                style={{
                  backgroundColor: 'var(--tm-surface-high)',
                  borderColor: 'var(--tm-border-strong)',
                }}
              >
                <BrainCircuit size={19} style={{ color: 'var(--tm-primary)' }} />
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: 'var(--tm-text)' }}
              >
                Tele<span style={{ color: 'var(--tm-primary)' }}>Mind</span>
              </span>
            </Link>

            <p
              className="text-[13px] max-w-sm leading-relaxed"
              style={{ color: 'var(--tm-text-muted)' }}
            >
              AI-powered customer support built to help businesses automate conversations, connect
              with customers, and scale efficiently.
            </p>
          </motion.div>

          {/* Area B: Product Navigation */}
          <motion.div {...colAnim(0.08)} className="flex flex-col gap-3">
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--tm-text)' }}
            >
              Product
            </span>
            {PRODUCT_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group text-[13px] inline-flex items-center gap-1 w-fit transition-colors hover:opacity-100 opacity-80"
                style={{ color: 'var(--tm-text-muted)' }}
              >
                <span>{item.label}</span>
                <ArrowUpRight
                  size={12}
                  className="opacity-0 -translate-x-1 transition-all group-hover:opacity-80 group-hover:translate-x-0"
                />
              </Link>
            ))}
          </motion.div>

          {/* Area C: Company */}
          <motion.div {...colAnim(0.14)} className="flex flex-col gap-3">
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--tm-text)' }}
            >
              Company
            </span>
            {COMPANY_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group text-[13px] inline-flex items-center gap-1 w-fit transition-colors hover:opacity-100 opacity-80"
                style={{ color: 'var(--tm-text-muted)' }}
              >
                <span>{item.label}</span>
                <ArrowUpRight
                  size={12}
                  className="opacity-0 -translate-x-1 transition-all group-hover:opacity-80 group-hover:translate-x-0"
                />
              </Link>
            ))}
          </motion.div>

          {/* Area D: Legal */}
          <motion.div {...colAnim(0.2)} className="flex flex-col gap-3">
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: 'var(--tm-text)' }}
            >
              Legal
            </span>
            {LEGAL_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group text-[13px] inline-flex items-center gap-1 w-fit transition-colors hover:opacity-100 opacity-80"
                style={{ color: 'var(--tm-text-muted)' }}
              >
                <span>{item.label}</span>
                <ArrowUpRight
                  size={12}
                  className="opacity-0 -translate-x-1 transition-all group-hover:opacity-80 group-hover:translate-x-0"
                />
              </Link>
            ))}
          </motion.div>
        </div>

        <div
          className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'var(--tm-border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--tm-text-subtle)' }}>
            © 2026 TeleMind. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--tm-text-subtle)' }}>
            <Link href="/login" className="hover:opacity-100 opacity-80 transition-opacity">
              Workspace Sign In
            </Link>
            <span>·</span>
            <Link href="/login?tab=register" className="hover:opacity-100 opacity-80 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
