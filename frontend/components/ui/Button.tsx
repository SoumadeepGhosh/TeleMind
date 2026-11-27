'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  children: React.ReactNode;
  className?: string;
}

type ButtonProps =
  | (BaseButtonProps & {
      href: string;
      onClick?: () => void;
      type?: never;
      disabled?: never;
    })
  | (BaseButtonProps & {
      href?: never;
      onClick?: () => void;
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
    });

export function Button({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const reduceMotion = Boolean(useReducedMotion());

  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : size === 'lg'
      ? 'px-7 py-3.5 text-sm sm:text-base'
      : 'px-5 py-2.5 text-xs sm:text-sm';

  const variantClasses =
    variant === 'primary'
      ? 'bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_26px_rgba(124,58,237,0.5)]'
      : variant === 'secondary'
      ? 'border transition-colors'
      : 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5';

  const variantStyle: React.CSSProperties =
    variant === 'secondary'
      ? {
          backgroundColor: 'var(--tm-surface-card)',
          borderColor: 'var(--tm-border)',
          color: 'var(--tm-text)',
        }
      : variant === 'ghost'
      ? { color: 'var(--tm-text-muted)' }
      : {};

  const content = (
    <span className="inline-flex items-center justify-center gap-2">
      <span>{children}</span>
      {withArrow && (
        <ArrowRight
          size={15}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </span>
  );

  const sharedClass = `group inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${sizeClasses} ${variantClasses} ${className}`;

  if ('href' in rest && rest.href) {
    return (
      <Link href={rest.href} className={sharedClass} style={variantStyle}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      type={rest.type ?? 'button'}
      disabled={rest.disabled}
      onClick={rest.onClick}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      className={sharedClass}
      style={variantStyle}
    >
      {content}
    </motion.button>
  );
}
