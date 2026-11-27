'use client';

import { PostgresRlsSection } from './security/PostgresRlsSection';
import { OperatorInterventionDemo } from './operator/OperatorInterventionDemo';

export function SpotlightSections() {
  return (
    <section id="security" className="py-16 px-5 sm:px-8 max-w-[1280px] mx-auto w-full space-y-20">
      {/* Row 1: Interactive PostgreSQL RLS Security Architecture */}
      <PostgresRlsSection />

      {/* Row 2: Interactive Live Operator Intervention */}
      <OperatorInterventionDemo />
    </section>
  );
}
