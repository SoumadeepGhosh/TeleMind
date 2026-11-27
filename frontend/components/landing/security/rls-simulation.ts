export type TenantKey = 'tenant_a' | 'tenant_b' | 'tenant_c';

export type SimPhase =
  | 'idle'
  | 'traveling'
  | 'evaluating'
  | 'authorized'
  | 'filtered';

export interface TenantConfig {
  id: TenantKey;
  label: string;
  orgId: string;
  color: string;
  glow: string;
  bgTint: string;
  borderTint: string;
  rowId: string;
  docName: string;
}

export const TENANTS: TenantConfig[] = [
  {
    id: 'tenant_a',
    label: 'Tenant A',
    orgId: 'org_apex_44',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.35)',
    bgTint: 'rgba(139, 92, 246, 0.14)',
    borderTint: 'rgba(139, 92, 246, 0.45)',
    rowId: '#EMB-8491',
    docName: 'enterprise-terms-2025.pdf',
  },
  {
    id: 'tenant_b',
    label: 'Tenant B',
    orgId: 'org_care_12',
    color: '#22D3EE',
    glow: 'rgba(34, 211, 238, 0.35)',
    bgTint: 'rgba(34, 211, 238, 0.14)',
    borderTint: 'rgba(34, 211, 238, 0.45)',
    rowId: '#EMB-3104',
    docName: 'hipaa-clinic-protocol.md',
  },
  {
    id: 'tenant_c',
    label: 'Tenant C',
    orgId: 'org_urban_09',
    color: '#34D399',
    glow: 'rgba(52, 211, 153, 0.35)',
    bgTint: 'rgba(52, 211, 153, 0.14)',
    borderTint: 'rgba(52, 211, 153, 0.45)',
    rowId: '#EMB-5920',
    docName: 'blackfriday-sla-guide.pdf',
  },
];

export function getTenantById(id: TenantKey): TenantConfig {
  return TENANTS.find((t) => t.id === id) ?? TENANTS[0];
}
