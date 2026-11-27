'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Bot, UserCheck } from 'lucide-react';
import type { OperatorSimState } from './operator-types';

interface AgentStatusCardProps {
  simState: OperatorSimState;
  reduceMotion: boolean;
}

export function AgentStatusCards({ simState, reduceMotion }: AgentStatusCardProps) {
  const isAiPaused =
    simState === 'handoff_requested' ||
    simState === 'transferring' ||
    simState === 'operator_connected' ||
    simState === 'operator_typing' ||
    simState === 'operator_responded';

  const isTransferring =
    simState === 'handoff_requested' || simState === 'transferring';

  const isOperatorActive =
    simState === 'operator_connected' ||
    simState === 'operator_typing' ||
    simState === 'operator_responded';

  return (
    <div className="space-y-2.5 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* AI Agent Card */}
        <div
          className="rounded-xl p-3 border transition-all duration-300"
          style={{
            backgroundColor: !isAiPaused
              ? 'rgba(139, 92, 246, 0.12)'
              : 'var(--tm-surface-low)',
            borderColor: !isAiPaused
              ? 'rgba(139, 92, 246, 0.42)'
              : 'var(--tm-border)',
            opacity: isAiPaused ? 0.65 : 1,
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--tm-text)' }}>
                AI Swarm #4
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={isAiPaused ? 'paused' : 'active'}
                initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: isAiPaused
                    ? 'rgba(148, 163, 184, 0.14)'
                    : 'rgba(139, 92, 246, 0.2)',
                  color: isAiPaused ? '#94A3B8' : '#C4B5FD',
                }}
              >
                {isAiPaused ? 'PAUSED' : 'ACTIVE'}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-[10px] font-mono" style={{ color: 'var(--tm-text-muted)' }}>
            {isAiPaused ? 'Autonomous replies halted' : 'Handling Groq 120B replies'}
          </div>
        </div>

        {/* Human Operator Card */}
        <div
          className="rounded-xl p-3 border transition-all duration-300"
          style={{
            backgroundColor: isOperatorActive
              ? 'rgba(52, 211, 153, 0.12)'
              : isTransferring
              ? 'rgba(251, 191, 36, 0.1)'
              : 'var(--tm-surface-low)',
            borderColor: isOperatorActive
              ? 'rgba(52, 211, 153, 0.45)'
              : isTransferring
              ? 'rgba(251, 191, 36, 0.4)'
              : 'var(--tm-border)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                <UserCheck size={15} />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--tm-text)' }}>
                Sarah Jenkins
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={
                  isOperatorActive
                    ? 'connected'
                    : isTransferring
                    ? 'connecting'
                    : 'standby'
                }
                initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: isOperatorActive
                    ? 'rgba(52, 211, 153, 0.2)'
                    : isTransferring
                    ? 'rgba(251, 191, 36, 0.18)'
                    : 'rgba(148, 163, 184, 0.12)',
                  color: isOperatorActive
                    ? '#34D399'
                    : isTransferring
                    ? '#FBBF24'
                    : '#94A3B8',
                }}
              >
                {isOperatorActive
                  ? 'ACTIVE'
                  : isTransferring
                  ? 'CONNECTING'
                  : 'STANDBY'}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="text-[10px] font-mono" style={{ color: 'var(--tm-text-muted)' }}>
            {isOperatorActive
              ? 'Tier 3 Lead connected'
              : isTransferring
              ? 'Receiving thread context...'
              : 'Ready for 1-click takeover'}
          </div>
        </div>
      </div>

      {/* Handoff Progress Beam */}
      <AnimatePresence>
        {isTransferring && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-lg px-3 py-2 border font-mono text-[10px] space-y-1.5"
              style={{
                backgroundColor: 'rgba(34, 211, 238, 0.08)',
                borderColor: 'rgba(34, 211, 238, 0.28)',
              }}
            >
              <div className="flex items-center justify-between text-cyan-300">
                <span>Transferring conversation context...</span>
                <span>100%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400"
                  initial={{ width: '10%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: reduceMotion ? 0 : 0.65, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
