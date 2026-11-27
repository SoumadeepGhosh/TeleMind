'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import {
  PRICING_PLANS,
  calculateYearlySavingsPct,
  type BillingCycle,
} from './pricing-config';
import { BillingToggle } from './BillingToggle';
import { PricingCard } from './PricingCard';
import { EnterpriseBanner } from './EnterpriseBanner';

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const reduceMotion = Boolean(useReducedMotion());

  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const savingsPct = calculateYearlySavingsPct(
    PRICING_PLANS[1].monthlyPriceInr,
    PRICING_PLANS[1].yearlyTotalInr
  );

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full overflow-hidden"
    >
      {/* Diagonal Purple-Cyan Light Beam from Top-Right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-8%] w-[520px] h-[520px] -z-10"
      >
        <div
          className="w-full h-full opacity-75"
          style={{
            background:
              'linear-gradient(225deg, rgba(224, 242, 254, 0.42) 0%, rgba(168, 85, 247, 0.45) 22%, rgba(124, 58, 237, 0.18) 46%, transparent 70%)',
            filter: 'blur(38px)',
            transform: 'rotate(-14deg) scaleX(0.65)',
          }}
        />
      </div>

      {/* Subtle Purple Corner Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 w-[420px] h-[360px] -z-10 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(168, 85, 247, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.14) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(circle at 80% 20%, black 10%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(circle at 80% 20%, black 10%, transparent 72%)',
        }}
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <span
          className="font-mono text-xs font-semibold tracking-widest uppercase mb-2"
          style={{ color: 'var(--tm-primary)' }}
        >
          TIER MATRIX
        </span>
        <h2
          className="text-3xl sm:text-[40px] font-extrabold tracking-tight max-w-2xl leading-[1.15]"
          style={{ color: 'var(--tm-text)' }}
        >
          Powerful AI. Affordable Pricing.
        </h2>
        <p className="text-[15px] max-w-xl mt-3 mb-6" style={{ color: 'var(--tm-text-muted)' }}>
          Start small, automate customer support, and scale as your business grows.
        </p>

        <BillingToggle
          billing={billing}
          savingsPct={savingsPct}
          reduceMotion={reduceMotion}
          onChange={setBilling}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan, idx) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            billing={billing}
            index={idx}
            sectionInView={inView}
            isMobile={isMobile}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <EnterpriseBanner inView={inView} reduceMotion={reduceMotion} />

      {/* Transparent Billing Information */}
      <div
        className="mt-6 text-center text-[11px] font-mono leading-relaxed max-w-3xl mx-auto"
        style={{ color: 'var(--tm-text-subtle)' }}
      >
        All prices are displayed in Indian Rupees (INR ₹). Annual plans are billed once per year.
        Applicable taxes (such as GST) and third-party messaging channel charges may apply
        separately. Each plan includes defined monthly AI message limits.
      </div>
    </section>
  );
}
