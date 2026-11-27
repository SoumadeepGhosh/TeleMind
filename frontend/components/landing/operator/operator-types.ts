export type OperatorSimState =
  | 'idle'
  | 'customer_message'
  | 'ai_typing'
  | 'ai_responded'
  | 'handoff_requested'
  | 'transferring'
  | 'operator_connected'
  | 'operator_typing'
  | 'operator_responded';

export interface ChatMsg {
  id: string;
  sender: 'customer' | 'ai' | 'operator';
  senderLabel: string;
  text: string;
  timestamp: string;
}

export const INITIAL_CUSTOMER_MSG: ChatMsg = {
  id: 'msg-customer-1',
  sender: 'customer',
  senderLabel: 'Marcus V. · WhatsApp',
  text: 'Can someone guarantee that our internal SOC2 audit certificates will not be shared with other tenants on the shared infrastructure?',
  timestamp: '11:42 AM',
};

export const INITIAL_AI_MSG: ChatMsg = {
  id: 'msg-ai-1',
  sender: 'ai',
  senderLabel: 'TeleMind Autonomous Swarm',
  text: 'Yes, Marcus. TeleMind uses row-level cryptographic isolation where your tenant cryptographic salt isolates all document vectors. No cross-tenant access is physically possible in our database schema.',
  timestamp: '11:42 AM',
};

export const OPERATOR_MSG: ChatMsg = {
  id: 'msg-operator-1',
  sender: 'operator',
  senderLabel: 'Sarah Jenkins · Tier 3 Lead',
  text: 'Hi Marcus, I have personally reviewed our legal addendum for your enterprise workspace. Your 22% discount and dedicated pgvector instance are active. I am attaching the signed compliance certificate now.',
  timestamp: '11:43 AM',
};
