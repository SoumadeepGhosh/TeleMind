'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-[#79839b]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7774d9]" />
        <p className="text-sm font-medium tracking-wide">Connecting to TeleMind SaaS...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main key={user.organizationId} className="dashboard-content space-y-6">{children}</main>
    </div>
  );
}
