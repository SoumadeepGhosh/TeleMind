'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Lock, CheckCircle2, ShieldAlert, RotateCcw } from 'lucide-react';
import {
  TENANTS,
  type SimPhase,
  type TenantKey,
  getTenantById,
} from './rls-simulation';
import { RlsNetworkDiagram } from './RlsNetworkDiagram';
import { RlsSqlPanel } from './RlsSqlPanel';

export function PostgresRlsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });
  const reduceMotion = Boolean(useReducedMotion());

  const [phase, setPhase] = useState<SimPhase>('idle');
  const [activeTenantId, setActiveTenantId] = useState<TenantKey>('tenant_a');
  const [targetTenantId, setTargetTenantId] = useState<TenantKey>('tenant_a');
  const [isCrossTenant, setIsCrossTenant] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const simulateAuthorized = (tenantId: TenantKey) => {
    clearTimers();
    setActiveTenantId(tenantId);
    setTargetTenantId(tenantId);
    setIsCrossTenant(false);

    if (reduceMotion) {
      setPhase('authorized');
      return;
    }

    setPhase('traveling');
    const t1 = window.setTimeout(() => setPhase('evaluating'), 620);
    const t2 = window.setTimeout(() => setPhase('authorized'), 1120);
    timersRef.current.push(t1, t2);
  };

  const simulateCrossTenant = () => {
    clearTimers();
    setActiveTenantId('tenant_a');
    setTargetTenantId('tenant_b');
    setIsCrossTenant(true);

    if (reduceMotion) {
      setPhase('filtered');
      return;
    }

    setPhase('traveling');
    const t1 = window.setTimeout(() => setPhase('evaluating'), 620);
    const t2 = window.setTimeout(() => setPhase('filtered'), 1150);
    timersRef.current.push(t1, t2);
  };

  const handleReset = () => {
    clearTimers();
    setPhase('idle');
    setActiveTenantId('tenant_a');
    setTargetTenantId('tenant_a');
    setIsCrossTenant(false);
  };

  const activeTenant = getTenantById(activeTenantId);
  const targetTenant = getTenantById(targetTenantId);

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      {/* Left Column: Copy, Benefits & Interactive Controls */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        className="lg:col-span-5 flex flex-col items-start"
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs mb-4 border"
          style={{
            backgroundColor: 'var(--tm-surface-low)',
            borderColor: 'var(--tm-border)',
            color: 'var(--tm-tertiary)',
          }}
        >
          <Lock size={13} />
          CRITICAL ENTERPRISE ISOLATION
        </div>

        <h2
          className="text-3xl sm:text-[38px] font-extrabold tracking-tight leading-[1.15] mb-4"
          style={{ color: 'var(--tm-text)' }}
        >
          Zero Data Cross-Contamination with Postgres RLS
        </h2>

        <p
          className="text-[15px] leading-relaxed mb-6"
          style={{ color: 'var(--tm-text-muted)' }}
        >
          Unlike simple vector stores that partition data using soft metadata filters, TeleMind
          enforces PostgreSQL 16 hardware-level Row-Level Security (RLS). Every query execution plan
          injects cryptographic tenant isolation directly into kernel queries.
        </p>

        {/* Staggered Security Benefits */}
        <div className="space-y-2.5 w-full font-mono text-xs mb-6">
          {[
            'Hardened pgvector database schemas per customer account',
            'Automatic query rejection if org_id does not match JWT signature',
            'SOC2 Type II and HIPAA compliant multi-tenant audit logs',
          ].map((item, idx) => (
            <motion.div
              key={item}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : 0.1 + idx * 0.08,
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--tm-surface-card)',
                borderColor: 'var(--tm-border)',
              }}
            >
              <CheckCircle2
                size={16}
                style={{ color: 'var(--tm-tertiary)' }}
                className="shrink-0"
              />
              <span style={{ color: 'var(--tm-text)' }}>{item}</span>
            </motion.div>
          ))}
        </div>

        {/* Interactive Tenant Selection & Simulation Controls */}
        <div
          className="w-full rounded-2xl p-4 border space-y-3"
          style={{
            backgroundColor: 'var(--tm-surface-low)',
            borderColor: 'var(--tm-border)',
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span style={{ color: 'var(--tm-text-muted)' }}>
              INTERACTIVE RLS SIMULATION
            </span>
            {phase !== 'idle' && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 hover:opacity-100 opacity-80"
                style={{ color: 'var(--tm-secondary)' }}
              >
                <RotateCcw size={11} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {TENANTS.map((tenant) => {
              const selected =
                !isCrossTenant && phase !== 'idle' && activeTenantId === tenant.id;
              return (
                <button
                  key={tenant.id}
                  type="button"
                  onClick={() => simulateAuthorized(tenant.id)}
                  className="px-2.5 py-2 rounded-lg text-xs font-mono font-semibold border transition-all"
                  style={{
                    backgroundColor: selected ? tenant.bgTint : 'var(--tm-surface)',
                    borderColor: selected ? tenant.borderTint : 'var(--tm-border)',
                    color: selected ? tenant.color : 'var(--tm-text)',
                  }}
                >
                  {tenant.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={simulateCrossTenant}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor:
                phase === 'filtered'
                  ? 'rgba(248, 113, 113, 0.14)'
                  : 'var(--tm-surface-high)',
              borderColor:
                phase === 'filtered'
                  ? 'rgba(248, 113, 113, 0.45)'
                  : 'var(--tm-border-strong)',
              color: phase === 'filtered' ? '#F87171' : 'var(--tm-text)',
            }}
          >
            <ShieldAlert size={14} />
            <span>Simulate Cross-Tenant Access</span>
          </button>

          {phase === 'filtered' && (
            <p className="text-[11px] leading-relaxed font-mono text-red-300 bg-red-500/10 border border-red-400/25 rounded-lg p-2.5">
              Unauthorized Rows Filtered: {activeTenant.orgId} requested rows owned by{' '}
              {targetTenant.orgId}. The RLS policy predicate rejected the mismatch before returning
              any rows.
            </p>
          )}

          {phase === 'authorized' && (
            <p className="text-[11px] leading-relaxed font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-lg p-2.5">
              Permitted: {activeTenant.orgId} matched{' '}
              <code>app.current_tenant_id</code> and accessed only row {activeTenant.rowId}.
            </p>
          )}
        </div>
      </motion.div>

      {/* Right Column: Animated Tenant Network + Synchronized SQL Panel */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.12 }}
        className="lg:col-span-7 space-y-4"
      >
        <RlsNetworkDiagram
          phase={phase}
          activeTenantId={activeTenantId}
          targetTenantId={targetTenantId}
          isCrossTenant={isCrossTenant}
          inView={inView}
          reduceMotion={reduceMotion}
          onSelectTenant={simulateAuthorized}
        />

        <RlsSqlPanel
          phase={phase}
          activeTenantId={activeTenantId}
          targetTenantId={targetTenantId}
          isCrossTenant={isCrossTenant}
          reduceMotion={reduceMotion}
        />
      </motion.div>
    </div>
  );
}
