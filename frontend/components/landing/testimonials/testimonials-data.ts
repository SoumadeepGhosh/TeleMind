export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  accent: string;
  ringColor: string;
  quote: string;
  rating: number;
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    role: 'CTO',
    company: 'CareClinic Health Network',
    initials: 'SJ',
    accent: 'bg-[#d0bcff] text-[#23005c]',
    ringColor: 'rgba(139, 92, 246, 0.55)',
    quote:
      'We manage 14 private clinics across 3 regions. TeleMind’s multi-tenant pgvector isolation is the only architecture our compliance auditors approved without redlines. Response times dropped to 110 milliseconds.',
    rating: 5,
  },
  {
    id: 'anirban-chatterjee',
    name: 'Anirban Chatterjee',
    role: 'VP of Engineering',
    company: 'BengalFin Pay, Kolkata',
    initials: 'AC',
    accent: 'bg-[#a2e7ff] text-[#003642]',
    ringColor: 'rgba(34, 211, 238, 0.55)',
    quote:
      'Integrating WhatsApp Cloud API with strict PostgreSQL RLS isolation gave our fintech support team sub-second answers without ever mixing merchant knowledge bases.',
    rating: 5,
  },
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    role: 'Managing Partner',
    company: 'LegalFlow LLP',
    initials: 'MV',
    accent: 'bg-[#3fe09c] text-[#003823]',
    ringColor: 'rgba(52, 211, 153, 0.55)',
    quote:
      'The One-Click Human Takeover switch is pure engineering craft. When corporate contracts get discussed on Telegram, our partners step in instantly with full conversation context.',
    rating: 5,
  },
  {
    id: 'priya-deshmukh',
    name: 'Priya Deshmukh',
    role: 'Head of Customer Ops',
    company: 'IndusKart Logistics, Bengaluru',
    initials: 'PD',
    accent: 'bg-[#d0bcff] text-[#23005c]',
    ringColor: 'rgba(139, 92, 246, 0.55)',
    quote:
      'During our festive sale spike, Groq 120B handled thousands of WhatsApp order-tracking inquiries seamlessly while our operators focused on complex escalations.',
    rating: 5,
  },
  {
    id: 'subhajit-sen',
    name: 'Subhajit Sen',
    role: 'Principal Architect',
    company: 'Hooghly Cloud Systems',
    initials: 'SS',
    accent: 'bg-[#a2e7ff] text-[#003642]',
    ringColor: 'rgba(34, 211, 238, 0.55)',
    quote:
      'Having automated PII redaction before prompts hit LLM inference let us roll out Telegram and WhatsApp support across our healthcare clients with confidence.',
    rating: 4,
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    role: 'VP of Operations',
    company: 'UrbanStore Global',
    initials: 'ER',
    accent: 'bg-[#3fe09c] text-[#003823]',
    ringColor: 'rgba(52, 211, 153, 0.55)',
    quote:
      'During peak traffic, our WhatsApp channel was hit by massive inquiry volume. Groq 120B didn’t flinch, and our support team stayed completely in control.',
    rating: 5,
  },
];
