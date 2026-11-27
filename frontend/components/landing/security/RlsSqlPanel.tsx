'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { type SimPhase, type TenantKey, getTenantById } from './rls-simulation';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

interface RlsSqlPanelProps {
  phase: SimPhase;
  activeTenantId: TenantKey;
  targetTenantId: TenantKey;
  isCrossTenant: boolean;
  reduceMotion: boolean;
}

interface SqlLine {
  num: string;
  group: 'header' | 'rls' | 'policy' | 'condition' | 'query' | 'result';
  content: React.ReactNode;
}

export function RlsSqlPanel({
  phase,
  activeTenantId,
  targetTenantId,
  isCrossTenant,
  reduceMotion,
}: RlsSqlPanelProps) {
  const [hovered, setHovered] = useState(false);
  const activeTenant = getTenantById(activeTenantId);
  const targetTenant = getTenantById(targetTenantId);

  const lines: SqlLine[] = [
    {
      num: '01',
      group: 'header',
      content: (
        <span style={{ color: 'var(--tm-text-subtle)' }}>
          -- Enforce strict per-tenant pgvector isolation
        </span>
      ),
    },
    {
      num: '02',
      group: 'rls',
      content: (
        <>
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            ALTER TABLE
          </span>{' '}
          tenant_kb_embeddings
        </>
      ),
    },
    {
      num: '03',
      group: 'rls',
      content: (
        <span className="pl-4 font-bold" style={{ color: 'var(--tm-primary)' }}>
          ENABLE ROW LEVEL SECURITY;
        </span>
      ),
    },
    {
      num: '04',
      group: 'policy',
      content: (
        <>
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            CREATE POLICY
          </span>{' '}
          tenant_isolation_policy
        </>
      ),
    },
    {
      num: '05',
      group: 'policy',
      content: (
        <span className="pl-4">
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            ON
          </span>{' '}
          tenant_kb_embeddings
        </span>
      ),
    },
    {
      num: '06',
      group: 'condition',
      content: (
        <span className="pl-4">
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            USING
          </span>{' '}
          (org_id ={' '}
          <span style={{ color: 'var(--tm-secondary)' }}>
            current_setting(&apos;app.current_tenant_id&apos;)
          </span>
          );
        </span>
      ),
    },
    {
      num: '07',
      group: 'header',
      content: (
        <span style={{ color: 'var(--tm-text-subtle)' }}>
          -- Vector similarity execution plan with index
        </span>
      ),
    },
    {
      num: '08',
      group: 'query',
      content: (
        <span className="font-semibold" style={{ color: 'var(--tm-tertiary)' }}>
          EXPLAIN ANALYZE
        </span>
      ),
    },
    {
      num: '09',
      group: 'query',
      content: (
        <>
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            SELECT
          </span>{' '}
          id, chunk_text, 1 - (embedding &lt;=&gt;{' '}
          <span style={{ color: 'var(--tm-secondary)' }}>$query_vec</span>){' '}
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            AS
          </span>{' '}
          similarity
        </>
      ),
    },
    {
      num: '10',
      group: 'query',
      content: (
        <>
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            FROM
          </span>{' '}
          tenant_kb_embeddings{' '}
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            WHERE
          </span>{' '}
          similarity &gt; 0.88
        </>
      ),
    },
    {
      num: '11',
      group: 'query',
      content: (
        <>
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            ORDER BY
          </span>{' '}
          embedding &lt;=&gt;{' '}
          <span style={{ color: 'var(--tm-secondary)' }}>$query_vec</span>{' '}
          <span className="font-bold" style={{ color: 'var(--tm-primary)' }}>
            LIMIT
          </span>{' '}
          4;
        </>
      ),
    },
  ];

  const isLineActive = (group: SqlLine['group']) => {
    if (phase === 'traveling') return group === 'condition';
    if (phase === 'evaluating') return group === 'policy' || group === 'condition';
    if (phase === 'authorized') return group === 'query';
    if (phase === 'filtered') return group === 'condition';
    return false;
  };

  const statusLabel =
    phase === 'traveling'
      ? `CONTEXT: ${activeTenant.orgId}`
      : phase === 'evaluating'
      ? 'EVALUATING POLICY...'
      : phase === 'authorized'
      ? `AUTHORIZED (${activeTenant.orgId})`
      : phase === 'filtered'
      ? 'UNAUTHORIZED ROWS FILTERED'
      : 'RLS POLICY: ACTIVE';

  const statusColor =
    phase === 'filtered'
      ? '#F87171'
      : phase === 'evaluating' || phase === 'traveling'
      ? 'var(--tm-secondary)'
      : 'var(--tm-tertiary)';

  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative rounded-2xl p-4 sm:p-5 font-mono text-xs border tm-theme-transition"
      style={{
        backgroundColor: 'var(--tm-terminal-bg)',
        color: 'var(--tm-terminal-text)',
        borderColor:
          phase === 'filtered'
            ? 'rgba(248, 113, 113, 0.38)'
            : phase === 'authorized'
            ? 'rgba(52, 211, 153, 0.35)'
            : 'var(--tm-border)',
        boxShadow: hovered
          ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.12)'
          : 'var(--tm-shadow-card)',
      }}
    >
      <NeonBorderOverlay hovered={hovered} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />
      {/* Terminal Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 px-3 py-2 rounded-lg text-[11px] border"
        style={{
          backgroundColor: 'var(--tm-surface-low)',
          borderColor: 'var(--tm-border)',
          color: 'var(--tm-text-subtle)',
        }}
      >
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/85" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/85" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/85" />
          <span className="ml-1">pgvector_cluster_01 — psql</span>
        </span>
        <span className="font-semibold transition-colors" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>

      {/* SQL Lines */}
      <div className="overflow-x-auto">
        <div className="min-w-[460px] space-y-0.5 text-[11.5px] leading-relaxed">
          {lines.map((line) => {
            const active = isLineActive(line.group);
            const isReject = active && phase === 'filtered';
            return (
              <motion.div
                key={line.num}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        backgroundColor: active
                          ? isReject
                            ? 'rgba(248, 113, 113, 0.14)'
                            : 'rgba(139, 92, 246, 0.16)'
                          : 'rgba(0, 0, 0, 0)',
                      }
                }
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 px-2 py-0.5 rounded"
                style={{
                  borderLeft: active
                    ? `2px solid ${isReject ? '#F87171' : '#22D3EE'}`
                    : '2px solid transparent',
                  backgroundColor:
                    reduceMotion && active
                      ? isReject
                        ? 'rgba(248, 113, 113, 0.14)'
                        : 'rgba(139, 92, 246, 0.16)'
                      : undefined,
                }}
              >
                <span
                  className="select-none shrink-0 text-[10px] pt-0.5"
                  style={{ color: 'var(--tm-text-subtle)' }}
                >
                  {line.num}
                </span>
                <div style={{ color: 'var(--tm-text-muted)' }}>{line.content}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Illustrative Status Footer */}
      <div
        className="mt-3 pt-2.5 border-t text-[11px] flex flex-wrap items-center justify-between gap-2"
        style={{ borderColor: 'var(--tm-border)' }}
      >
        <span style={{ color: statusColor }}>
          {phase === 'filtered'
            ? `# Simulation: ${activeTenant.orgId} ≠ ${targetTenant.orgId} · 0 unauthorized rows exposed`
            : phase === 'authorized'
            ? `# Simulation: Tenant Scoped (${activeTenant.orgId}) · Permitted row ${activeTenant.rowId} returned`
            : isCrossTenant
            ? `# Simulation: Checking cross-tenant policy...`
            : '# Illustrative RLS policy simulation · Select a tenant or test cross-tenant access'}
        </span>
      </div>
    </div>
  );
}
