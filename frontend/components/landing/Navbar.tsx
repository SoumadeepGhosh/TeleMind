'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { BrainCircuit, Sun, Moon, Menu, X, User } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Security', href: '/#security' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
] as const;

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const shouldReduceMotion = Boolean(useReducedMotion());
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const [activeHref, setActiveHref] = useState<string>('');
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = lastScrollY.current;
    lastScrollY.current = latest;

    if (mobileMenuOpen) {
      setHidden(false);
      return;
    }

    if (latest <= 40) {
      setHidden(false);
      return;
    }

    const delta = latest - prev;
    if (delta > 4 && latest > 80) {
      setHidden(true);
    } else if (delta < -4) {
      setHidden(false);
    }
  });

  // Track active section in viewport for animated nav indicator
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.replace('/#', ''));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveHref(`/#${visible.target.id}`);
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const indicatorHref = hoveredHref ?? activeHref;
  const transitionDuration = shouldReduceMotion ? 0 : 0.32;

  const isDark = theme === 'dark';

  const navBackground = isDark
    ? 'rgba(10, 12, 20, 0.72)'
    : 'rgba(255, 255, 255, 0.78)';

  const navBorder = isDark
    ? 'rgba(168, 128, 255, 0.3)'
    : 'rgba(112, 41, 239, 0.2)';

  const navShadow = isDark
    ? '0 16px 42px rgba(0, 0, 0, 0.6), 0 0 24px rgba(128, 64, 255, 0.16)'
    : '0 14px 36px rgba(15, 23, 42, 0.1), 0 0 18px rgba(112, 41, 239, 0.08)';

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <motion.header
        initial={false}
        animate={{
          y: hidden ? -110 : 0,
          opacity: hidden ? 0 : 1,
          borderRadius: mobileMenuOpen ? 24 : 9999,
        }}
        transition={{
          duration: transitionDuration,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`backdrop-blur-xl border overflow-hidden ${
          hidden ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
        style={{
          width: 'min(1140px, calc(100% - 24px))',
          marginTop: 14,
          backgroundColor: navBackground,
          borderColor: navBorder,
          boxShadow: navShadow,
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        }}
      >
        <div className="w-full mx-auto flex items-center justify-between h-[62px] px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center border transition-shadow"
              style={{
                backgroundColor: 'var(--tm-surface-high)',
                borderColor: 'var(--tm-border-strong)',
                boxShadow: '0 0 18px var(--tm-primary-glow)',
              }}
            >
              <BrainCircuit size={20} style={{ color: 'var(--tm-primary)' }} />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--tm-text)' }}
            >
              Tele<span style={{ color: 'var(--tm-primary)' }}>Mind</span>
            </span>
          </Link>

          {/* Desktop Navigation with Animated Active/Hover Indicator */}
          <nav
            onMouseLeave={() => setHoveredHref(null)}
            className="hidden lg:flex items-center gap-1 text-[14px]"
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map((item) => {
              const isHighlighted = indicatorHref === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onClick={() => setActiveHref(item.href)}
                  className="relative px-3.5 py-1.5 rounded-full font-medium transition-colors duration-200"
                  style={{
                    color: isHighlighted ? 'var(--tm-text)' : 'var(--tm-text-muted)',
                  }}
                >
                  {isHighlighted && (
                    <motion.span
                      layoutId="tm-nav-pill"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 380, damping: 32 }
                      }
                      className="absolute inset-0 rounded-full -z-10"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(128, 64, 255, 0.2)'
                          : 'rgba(112, 41, 239, 0.1)',
                        border: '1px solid rgba(168, 128, 255, 0.25)',
                      }}
                    />
                  )}
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
              style={{
                backgroundColor: 'var(--tm-surface-low)',
                borderColor: 'var(--tm-border)',
                color: 'var(--tm-text-muted)',
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-[14px] font-medium transition-opacity hover:opacity-100 opacity-85"
              style={{ color: 'var(--tm-text)' }}
            >
              Sign In
            </Link>

            <Link
              href="/login?tab=register"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] transition-all shadow-[0_0_20px_rgba(124,58,237,0.35)]"
            >
              <span>Get Started Free</span>
            </Link>

            <Link
              href="/dashboard"
              aria-label="Workspace"
              className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--tm-primary)' }}
            >
              <User size={16} className="text-[#180045]" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center border"
              style={{
                backgroundColor: 'var(--tm-surface-low)',
                borderColor: 'var(--tm-border)',
                color: 'var(--tm-text)',
              }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Animated Mobile Drawer */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-nav-drawer"
              initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t"
              style={{
                backgroundColor: isDark ? 'rgba(10, 12, 20, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                borderColor: 'var(--tm-border)',
              }}
            >
              <div className="px-5 py-4 space-y-3">
                <div className="flex flex-col gap-1.5 text-sm">
                  {NAV_LINKS.map((item, idx) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setActiveHref(item.href);
                        setMobileMenuOpen(false);
                      }}
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.22,
                        delay: shouldReduceMotion ? 0 : idx * 0.04,
                      }}
                      className="py-2 px-3 rounded-lg font-medium transition-colors hover:bg-white/[0.05]"
                      style={{ color: 'var(--tm-text)' }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>

                <div
                  className="pt-3 border-t flex items-center gap-3"
                  style={{ borderColor: 'var(--tm-border)' }}
                >
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold border"
                    style={{
                      borderColor: 'var(--tm-border-strong)',
                      color: 'var(--tm-text)',
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/login?tab=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: 'var(--tm-primary-solid)' }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
