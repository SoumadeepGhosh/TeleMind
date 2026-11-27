export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string | null;
  organizationId: string;
  organizationName: string;
  role: 'OWNER' | 'ADMIN' | 'AGENT';
}

export interface JwtPayload {
  sub: string;
  organizationId: string;
}
