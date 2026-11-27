'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  useMotionValue,
  useMotionTemplate,
} from 'motion/react';
import { Hand, RotateCcw, CheckCircle2 } from 'lucide-react';
import {
  INITIAL_AI_MSG,
  INITIAL_CUSTOMER_MSG,
  OPERATOR_MSG,
  type ChatMsg,
  type OperatorSimState,
} from './operator-types';
import { AgentStatusCards } from './AgentStatusCard';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { NeonBorderOverlay } from '@/components/ui/NeonBorderOverlay';

export function OperatorInterventionDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatViewportRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  const reduceMotion = Boolean(useReducedMotion());
  const [isMobile, setIsMobile] = useState(false);

  const [simState, setSimState] = useState<OperatorSimState>('idle');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [operatorActive, setOperatorActive] = useState(false);
  const [leftHovered, setLeftHovered] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);

  const timersRef = useRef<number[]>([]);
  const hasAutoStarted = useRef(false);

  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(160);
  const spotlightBg = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(34, 211, 238, 0.1), transparent 75%)`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Run initial conversation sequence once section enters viewport
  const startInitialSequence = () => {
    clearTimers();
    setOperatorActive(false);

    if (reduceMotion) {
      setMessages([INITIAL_CUSTOMER_MSG, INITIAL_AI_MSG]);
      setSimState('ai_responded');
      return;
    }

    setMessages([INITIAL_CUSTOMER_MSG]);
    setSimState('customer_message');

    const t1 = window.setTimeout(() => setSimState('ai_typing'), 420);
    const t2 = window.setTimeout(() => {
      setMessages([INITIAL_CUSTOMER_MSG, INITIAL_AI_MSG]);
      setSimState('ai_responded');
    }, 1350);
    timersRef.current.push(t1, t2);
  };

  useEffect(() => {
    if (inView && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startInitialSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Smoothly scroll internal chat container when messages or typing state change
  useEffect(() => {
    const el = chatViewportRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
  }, [messages.length, simState, reduceMotion]);

  const handleToggleIntervention = () => {
    if (operatorActive) {
      startInitialSequence();
      return;
    }

    clearTimers();
    setOperatorActive(true);

    // Ensure initial messages are present if user clicks early
    const baseMessages = [INITIAL_CUSTOMER_MSG, INITIAL_AI_MSG];
    setMessages(baseMessages);

    if (reduceMotion) {
      setMessages([...baseMessages, OPERATOR_MSG]);
      setSimState('operator_responded');
      return;
    }

    setSimState('handoff_requested');
    const t1 = window.setTimeout(() => setSimState('transferring'), 250);
    const t2 = window.setTimeout(() => setSimState('operator_connected'), 950);
    const t3 = window.setTimeout(() => setSimState('operator_typing'), 1300);
    const t4 = window.setTimeout(() => {
      setMessages([...baseMessages, OPERATOR_MSG]);
      setSimState('operator_responded');
    }, 2200);

    timersRef.current.push(t1, t2, t3, t4);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMobile || reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const showTransferNotice =
    simState === 'operator_connected' ||
    simState === 'operator_typing' ||
    simState === 'operator_responded';

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4"
    >
      {/* Left Column: Controls & Status Cards */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        onPointerEnter={() => !isMobile && setLeftHovered(true)}
        onPointerLeave={() => setLeftHovered(false)}
        className="lg:col-span-5 relative rounded-2xl p-6 sm:p-7 border space-y-5 tm-theme-transition"
        style={{
          backgroundColor: 'var(--tm-surface-card)',
          borderColor: 'var(--tm-border)',
          boxShadow: leftHovered
            ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.12)'
            : 'var(--tm-shadow-card)',
        }}
      >
        <NeonBorderOverlay hovered={leftHovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs"
            style={{
              backgroundColor: 'rgba(0, 210, 253, 0.12)',
              color: 'var(--tm-secondary)',
            }}
          >
            <Hand size={13} />
            HUMAN-IN-THE-LOOP DEMO
          </span>
          <span
            className="font-mono text-xs px-2.5 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: operatorActive
                ? 'rgba(52, 211, 153, 0.15)'
                : 'rgba(139, 92, 246, 0.16)',
              color: operatorActive ? '#34D399' : '#C4B5FD',
            }}
          >
            {operatorActive ? 'OPERATOR ACTIVE' : 'SWARM AUTONOMOUS'}
          </span>
        </div>

        <div>
          <h3
            className="text-2xl sm:text-[28px] font-bold tracking-tight mb-2"
            style={{ color: 'var(--tm-text)' }}
          >
            Test the Live Operator Intervention
          </h3>
          <p className="text-[14.5px] leading-relaxed" style={{ color: 'var(--tm-text-muted)' }}>
            Click the toggle below to immediately pause autonomous AI responses and inject a human
            agent into the customer&apos;s active WhatsApp/Telegram thread.
          </p>
        </div>

        {/* AI & Human Operator Status Cards */}
        <AgentStatusCards simState={simState} reduceMotion={reduceMotion} />

        {/* Interactive Toggle Switch */}
        <div
          className="p-4 rounded-xl flex items-center justify-between gap-4 border"
          style={{
            backgroundColor: 'var(--tm-surface-high)',
            borderColor: 'var(--tm-border)',
          }}
        >
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--tm-text)' }}>
              Operator Override Mode
            </div>
            <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--tm-text-muted)' }}>
              Thread #TM-8941 · Marcus V.
            </div>
          </div>

          <motion.button
            type="button"
            role="switch"
            aria-checked={operatorActive}
            aria-label="Toggle Operator Override Mode"
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            onClick={handleToggleIntervention}
            className="relative inline-flex h-8 w-16 items-center rounded-full p-1 transition-colors border shrink-0"
            style={{
              backgroundColor: 'var(--tm-bg)',
              borderColor: operatorActive
                ? 'rgba(52, 211, 153, 0.6)'
                : 'var(--tm-border-strong)',
            }}
          >
            <motion.span
              animate={{ x: operatorActive ? 32 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 420, damping: 28 }
              }
              className="inline-block h-6 w-6 rounded-full shadow-md"
              style={{
                backgroundColor: operatorActive ? '#34D399' : '#8B5CF6',
              }}
            />
          </motion.button>
        </div>

        {/* Context Preservation Indicators */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-text-muted)',
            }}
          >
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
            <span>History retained</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
              color: 'var(--tm-text-muted)',
            }}
          >
            <CheckCircle2 size={12} className="text-cyan-400 shrink-0" />
            <span>Context preserved</span>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Interactive Chat Dashboard */}
      <motion.div
        ref={cardRef}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
        onPointerEnter={() => !isMobile && setCardHovered(true)}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setCardHovered(false)}
        className="lg:col-span-7 relative rounded-2xl p-5 sm:p-6 border overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--tm-surface-card-solid)',
          borderColor: 'var(--tm-border)',
          boxShadow: cardHovered
            ? 'var(--tm-shadow-card), 0 0 18px rgba(57, 255, 20, 0.12)'
            : 'var(--tm-shadow-card)',
        }}
      >
        <NeonBorderOverlay hovered={cardHovered} active={inView} reduceMotion={reduceMotion} radiusClass="rounded-2xl" />
        {/* Restrained Mouse Spotlight */}
        {!isMobile && !reduceMotion && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: spotlightBg,
              opacity: cardHovered ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        )}

        <div className="relative z-10 flex flex-col">
          {/* Chat Header */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 px-3 py-2.5 rounded-xl text-xs font-mono border"
            style={{
              backgroundColor: 'var(--tm-surface-low)',
              borderColor: 'var(--tm-border)',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{
                  backgroundColor: operatorActive ? '#34D399' : '#8B5CF6',
                }}
              />
              <span
                className="font-bold"
                style={{ color: operatorActive ? '#34D399' : 'var(--tm-text)' }}
              >
                {operatorActive
                  ? 'Human Agent: Sarah Jenkins (Tier 3 Lead)'
                  : 'AI Agent Swarm #4 (Active)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] hidden sm:inline" style={{ color: 'var(--tm-text-subtle)' }}>
                SIMULATED DEMO
              </span>
              <button
                type="button"
                onClick={startInitialSequence}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] transition-colors hover:opacity-100 opacity-85"
                style={{
                  backgroundColor: 'var(--tm-surface)',
                  borderColor: 'var(--tm-border)',
                  color: 'var(--tm-secondary)',
                }}
              >
                <RotateCcw size={11} />
                <span>Replay</span>
              </button>
            </div>
          </div>

          {/* Transfer Confirmation Banner */}
          <AnimatePresence>
            {showTransferNotice && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                className="mb-3 px-3 py-2 rounded-lg border text-[11px] font-mono flex items-center justify-between"
                style={{
                  backgroundColor: 'rgba(52, 211, 153, 0.1)',
                  borderColor: 'rgba(52, 211, 153, 0.3)',
                  color: '#6EE7B7',
                }}
              >
                <span>✓ Conversation transferred successfully · History retained</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Contained Scrollable Chat Viewport */}
          <div
            ref={chatViewportRef}
            className="h-[310px] overflow-y-auto pr-1 space-y-3.5 flex flex-col"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} reduceMotion={reduceMotion} />
            ))}

            <AnimatePresence>
              {simState === 'ai_typing' && (
                <TypingIndicator variant="ai" reduceMotion={reduceMotion} />
              )}
              {simState === 'operator_typing' && (
                <TypingIndicator variant="operator" reduceMotion={reduceMotion} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
