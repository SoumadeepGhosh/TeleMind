'use client';

import { motion } from 'motion/react';
import { Bot, UserCheck, User } from 'lucide-react';
import type { ChatMsg } from './operator-types';

interface ChatMessageProps {
  message: ChatMsg;
  reduceMotion: boolean;
}

export function ChatMessage({ message, reduceMotion }: ChatMessageProps) {
  const isCustomer = message.sender === 'customer';
  const isAi = message.sender === 'ai';

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col max-w-[88%] ${isCustomer ? 'ml-auto items-end' : 'mr-auto items-start'}`}
    >
      <div
        className="flex items-center gap-1.5 mb-1 text-[10px] font-mono"
        style={{
          color: isCustomer
            ? 'var(--tm-text-subtle)'
            : isAi
            ? '#C4B5FD'
            : '#6EE7B7',
        }}
      >
        {isCustomer ? (
          <User size={11} />
        ) : isAi ? (
          <Bot size={11} />
        ) : (
          <UserCheck size={11} />
        )}
        <span className="font-semibold">{message.senderLabel}</span>
        <span style={{ color: 'var(--tm-text-subtle)' }}>· {message.timestamp}</span>
      </div>

      <div
        className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
          isCustomer ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          backgroundColor: isCustomer
            ? 'var(--tm-surface-high)'
            : isAi
            ? 'rgba(139, 92, 246, 0.14)'
            : 'rgba(52, 211, 153, 0.12)',
          borderColor: isCustomer
            ? 'var(--tm-border)'
            : isAi
            ? 'rgba(139, 92, 246, 0.32)'
            : 'rgba(52, 211, 153, 0.32)',
          color: 'var(--tm-text)',
        }}
      >
        {message.text}
      </div>
    </motion.div>
  );
}
