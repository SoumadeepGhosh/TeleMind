'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Database,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  TENANTS,
  type SimPhase,
  type TenantKey,
  getTenantById,
} from './rls-simulation';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface RlsNetworkDiagramProps {
  phase: SimPhase;
  activeTenantId: TenantKey;
  targetTenantId: TenantKey;
  isCrossTenant: boolean;
  inView: boolean;
  reduceMotion: boolean;
  onSelectTenant: (id: TenantKey) => void;
}

export function RlsNetworkDiagram({
  phase,
  activeTenantId,
  targetTenantId,
  isCrossTenant,
  inView,
  reduceMotion,
  onSelectTenant,
}: RlsNetworkDiagramProps) {
  const [hoveredNode, setHoveredNode] = useState<TenantKey | null>(null);
  const [gatewayHovered, setGatewayHovered] = useState(false);
  const [hoveredRow, setHoveredRow] = useState<TenantKey | null>(null);
  const [cardHovered, setCardHovered] = useState(false);

  const activeTenant = getTenantById(activeTenantId);
  const isIdle = phase === 'idle';
  const isTraveling = phase === 'traveling';
  const isEvaluating = phase === 'evaluating';
  const isAuthorized = phase === 'authorized';
  const isFiltered = phase === 'filtered';

  const gatewayBorder = isFiltered
    ? 'rgba(248, 113, 113, 0.55)'
    : isAuthorized
    ? 'rgba(52, 211, 153, 0.55)'
    : isEvaluating || isTraveling
    ? 'rgba(34, 211, 238, 0.55)'
    : 'rgba(139, 92, 246, 0.35)';

  return (
    <div
      onPointerEnter={() => setCardHovered(true)}
      onPointerLeave={() => setCardHovered(false)}
      className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-surface-card)',
        borderColor: 'var(--tm-border)',
        boxShadow: cardHovered
          ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.12)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay hovered={cardHovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />
      {/* Top: 3 Tenant Nodes */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 relative z-10">
        {TENANTS.map((tenant, idx) => {
          const isSelected = !isIdle && activeTenantId === tenant.id;
          const isDimmed = !isIdle && !isSelected;
          const isHovered = hoveredNode === tenant.id;

          return (
            <motion.button
              key={tenant.id}
              type="button"
              onClick={() => onSelectTenant(tenant.id)}
              onMouseEnter={() => setHoveredNode(tenant.id)}
              onMouseLeave={() => setHoveredNode(null)}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={
                inView || reduceMotion
                  ? {
                      opacity: isDimmed ? 0.45 : 1,
                      y: isHovered && !reduceMotion ? -3 : 0,
                    }
                  : { opacity: 0, y: 16 }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: inView && isIdle && !reduceMotion ? idx * 0.08 : 0,
              }}
              className="text-left rounded-xl p-2.5 sm:p-3 border transition-colors relative overflow-hidden"
              style={{
                backgroundColor: isSelected ? tenant.bgTint : 'var(--tm-surface-low)',
                borderColor:
                  isSelected || isHovered ? tenant.borderTint : 'var(--tm-border)',
                boxShadow: isSelected ? `0 0 20px ${tenant.glow}` : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tenant.bgTint, color: tenant.color }}
                >
                  <Building2 size={13} />
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded hidden sm:inline"
                  style={{
                    backgroundColor: 'rgba(52, 211, 153, 0.12)',
                    color: '#34D399',
                  }}
                >
                  JWT OK
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-bold truncate" style={{ color: 'var(--tm-text)' }}>
                {tenant.label}
              </div>
              <div className="text-[9px] sm:text-[10px] font-mono truncate" style={{ color: 'var(--tm-text-muted)' }}>
                {tenant.orgId}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* SVG Animated Beams: Tenants -> Central RLS Gateway */}
      <div className="relative h-14 sm:h-16 w-full" aria-hidden="true">
        <svg viewBox="0 0 360 64" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {[
            { id: 'tenant_a' as TenantKey, path: 'M 60 0 C 60 32, 180 28, 180 62', color: '#8B5CF6' },
            { id: 'tenant_b' as TenantKey, path: 'M 180 0 L 180 62', color: '#22D3EE' },
            { id: 'tenant_c' as TenantKey, path: 'M 300 0 C 300 32, 180 28, 180 62', color: '#34D399' },
          ].map((beam) => {
            const isSelected = !isIdle && activeTenantId === beam.id;
            const isHovered = hoveredNode === beam.id;
            const packetColor = isCrossTenant ? '#F87171' : beam.color;

            return (
              <g key={beam.id}>
                {/* Base low-opacity path */}
                <motion.path
                  d={beam.path}
                  fill="none"
                  stroke={isSelected || isHovered ? packetColor : 'rgba(148, 163, 184, 0.22)'}
                  strokeWidth={isSelected || isHovered ? 2 : 1.2}
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={inView || reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.6 }}
                />

                {/* Traveling Request Packet */}
                {isSelected && isTraveling && !reduceMotion && (
                  <motion.circle
                    r="4"
                    fill={packetColor}
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1] }}
                    transition={{ duration: 0.65, ease: 'easeInOut' }}
                    style={{ offsetPath: `path("${beam.path}")` }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Central PostgreSQL RLS Security Gateway */}
      <div className="relative z-10 flex justify-center">
        <div
          onMouseEnter={() => setGatewayHovered(true)}
          onMouseLeave={() => setGatewayHovered(false)}
          className="w-full max-w-md rounded-xl p-3.5 border backdrop-blur-md transition-all relative"
          style={{
            backgroundColor: 'var(--tm-surface-low)',
            borderColor: gatewayBorder,
            boxShadow: isFiltered
              ? '0 0 24px rgba(248, 113, 113, 0.22)'
              : isAuthorized
              ? '0 0 24px rgba(52, 211, 153, 0.22)'
              : gatewayHovered
              ? '0 0 24px rgba(139, 92, 246, 0.28)'
              : undefined,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: isFiltered
                    ? 'rgba(248, 113, 113, 0.14)'
                    : isAuthorized
                    ? 'rgba(52, 211, 153, 0.14)'
                    : 'rgba(139, 92, 246, 0.16)',
                  borderColor: gatewayBorder,
                  color: isFiltered
                    ? '#F87171'
                    : isAuthorized
                    ? '#34D399'
                    : 'var(--tm-primary)',
                }}
              >
                <Database size={17} />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tm-text)' }}>
                  <span>PostgreSQL 16 RLS Gateway</span>
                </div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--tm-text-muted)' }}>
                  Policy: org_id = current_setting(&apos;app.current_tenant_id&apos;)
                </div>
              </div>
            </div>

            <motion.div
              animate={
                isEvaluating && !reduceMotion
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.45 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold shrink-0"
              style={{
                backgroundColor: isFiltered
                  ? 'rgba(248, 113, 113, 0.15)'
                  : isAuthorized
                  ? 'rgba(52, 211, 153, 0.15)'
                  : 'rgba(34, 211, 238, 0.12)',
                color: isFiltered
                  ? '#F87171'
                  : isAuthorized
                  ? '#34D399'
                  : 'var(--tm-secondary)',
              }}
            >
              {isFiltered ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
              <span>
                {isFiltered
                  ? 'FILTERED'
                  : isAuthorized
                  ? 'PERMITTED'
                  : isEvaluating
                  ? 'EVALUATING'
                  : 'ENFORCED'}
              </span>
            </motion.div>
          </div>

          <AnimatePresence>
            {gatewayHovered && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="mt-2 pt-2 border-t text-[10px] font-mono"
                style={{ borderColor: 'var(--tm-border)', color: 'var(--tm-text-muted)' }}
              >
                Kernel-level row filtering rejects any vector query whose org_id does not match the
                active session tenant context.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SVG Animated Beam: Gateway -> Permitted Rows */}
      <div className="relative h-10 w-full flex justify-center" aria-hidden="true">
        <svg viewBox="0 0 120 40" className="w-32 h-full overflow-visible">
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="40"
            stroke={
              isFiltered
                ? 'rgba(248, 113, 113, 0.45)'
                : isAuthorized
                ? activeTenant.color
                : 'rgba(148, 163, 184, 0.22)'
            }
            strokeWidth={isAuthorized || isFiltered ? 2 : 1.2}
            strokeDasharray={isFiltered ? '4 4' : undefined}
          />
          {isAuthorized && !reduceMotion && (
            <motion.circle
              cx="60"
              r="3.5"
              fill={activeTenant.color}
              initial={{ cy: 0, opacity: 0 }}
              animate={{ cy: [0, 40], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            />
          )}
          {isFiltered && (
            <g transform="translate(60, 18)">
              <circle r="7" fill="#111827" stroke="#F87171" strokeWidth="1.5" />
              <path d="M-3 -3 L3 3 M3 -3 L-3 3" stroke="#F87171" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>

      {/* Bottom: Tenant-Specific Database Rows */}
      <div className="space-y-1.5 relative z-10">
        {TENANTS.map((row) => {
          const isPermitted = isAuthorized && activeTenantId === row.id;
          const isBlockedTarget = isFiltered && targetTenantId === row.id;
          const isRowHovered = hoveredRow === row.id;

          return (
            <div
              key={row.id}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className="rounded-lg px-3 py-2 border font-mono text-[10.5px] flex items-center justify-between gap-2 transition-all"
              style={{
                backgroundColor: isPermitted
                  ? row.bgTint
                  : isBlockedTarget
                  ? 'rgba(248, 113, 113, 0.08)'
                  : 'var(--tm-surface-low)',
                borderColor: isPermitted
                  ? row.borderTint
                  : isBlockedTarget
                  ? 'rgba(248, 113, 113, 0.4)'
                  : isRowHovered
                  ? row.borderTint
                  : 'var(--tm-border)',
                opacity:
                  isAuthorized && !isPermitted
                    ? 0.42
                    : isFiltered && !isBlockedTarget
                    ? 0.55
                    : 1,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: row.color }}
                />
                <span className="font-bold shrink-0" style={{ color: 'var(--tm-text)' }}>
                  {row.orgId}
                </span>
                <span className="truncate hidden sm:inline" style={{ color: 'var(--tm-text-muted)' }}>
                  · {row.rowId} ({row.docName})
                </span>
              </div>

              <span className="flex items-center gap-1 shrink-0 font-semibold">
                {isPermitted ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} />
                    PERMITTED
                  </span>
                ) : isBlockedTarget ? (
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle size={12} />
                    LOCKED BY RLS
                  </span>
                ) : (
                  <span className="flex items-center gap-1" style={{ color: 'var(--tm-text-subtle)' }}>
                    <Lock size={11} />
                    {isRowHovered ? `Scoped to ${row.label}` : 'ISOLATED'}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
