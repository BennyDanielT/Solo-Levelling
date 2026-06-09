'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Target,
  CalendarCheck,
  Crosshair,
  CheckCheck,
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  action: string;
  icon: any;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Add Goal',
    description: 'Create a new objective or milestone',
    action: 'add-goal',
    icon: Target,
  },
  {
    title: 'Weekly Review',
    description: 'Check progress and adjust habits',
    action: 'weekly-review',
    icon: CalendarCheck,
  },
  {
    title: 'Focus Mode',
    description: 'Jump into the dashboard overview',
    action: 'focus-mode',
    icon: Crosshair,
  },
  {
    title: 'Celebrate Win',
    description: 'Mark a goal as completed',
    action: 'celebrate',
    icon: CheckCheck,
  },
];

interface FloatingQuickPanelProps {
  onAddGoal?: () => void;
}

export function FloatingQuickPanel({ onAddGoal }: FloatingQuickPanelProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Position and dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialClickPos = useRef({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState(0);

  // Don't show panel for unauthenticated users, or on unauthenticated pages
  const isUnauthenticatedPage = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/error',
    '/landing'
  ].includes(pathname || '');

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    initialClickPos.current = { x: e.clientX, y: e.clientY };
    setDragDistance(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
    initialClickPos.current = { x: touch.clientX, y: touch.clientY };
    setDragDistance(0);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;

      // Keep inside boundaries (prevent dragging off-screen)
      const maxX = 16;
      const minX = -window.innerWidth + 200;
      const maxY = 16;
      const minY = -window.innerHeight + 100;

      const boundedX = Math.max(minX, Math.min(maxX, newX));
      const boundedY = Math.max(minY, Math.min(maxY, newY));

      setPosition({ x: boundedX, y: boundedY });
      setDragDistance(Math.hypot(e.clientX - initialClickPos.current.x, e.clientY - initialClickPos.current.y));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.current.x;
      const newY = touch.clientY - dragStart.current.y;

      const maxX = 16;
      const minX = -window.innerWidth + 200;
      const maxY = 16;
      const minY = -window.innerHeight + 100;

      const boundedX = Math.max(minX, Math.min(maxX, newX));
      const boundedY = Math.max(minY, Math.min(maxY, newY));

      setPosition({ x: boundedX, y: boundedY });
      setDragDistance(Math.hypot(touch.clientX - initialClickPos.current.x, touch.clientY - initialClickPos.current.y));
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  if (isUnauthenticatedPage || status === 'unauthenticated' || !session) {
    return null;
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    // If user dragged more than 5 pixels, treat it as a drag and don't toggle open/close
    if (dragDistance > 5) {
      e.preventDefault();
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const handleAction = (action: string) => {
    setIsOpen(false);
    
    if (action === 'add-goal' && onAddGoal) {
      onAddGoal();
    } else if (action === 'focus-mode') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal(action);
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
    >
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-3 w-80 rounded-3xl border border-white/10 bg-[#090b1a]/95 p-4 text-white shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">
                Instant Actions
              </p>
              <p className="text-base font-semibold">Command Center</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/80 transition hover:bg-white/20"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {QUICK_ACTIONS.map(({ title, description, action, icon: Icon }) => (
              <button
                key={title}
                onClick={() => handleAction(action)}
                className="w-full flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/70 to-emerald-400/70 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/70">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        aria-expanded={isOpen}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleButtonClick}
        className="group flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-purple-500/40 transition hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing select-none"
      >
        <Sparkles className="h-4 w-4" />
        Quick Panel
      </button>

      {/* Modals */}
      {activeModal && (
        <QuickActionModal
          action={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}

interface QuickActionModalProps {
  action: string;
  onClose: () => void;
}

function QuickActionModal({ action, onClose }: QuickActionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {action === 'weekly-review' && 'Weekly Review'}
            {action === 'celebrate' && 'Celebrate Your Win! 🎉'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>
        
        <div className="text-gray-600 dark:text-gray-400">
          {action === 'weekly-review' && (
            <p>Weekly review feature coming soon!</p>
          )}
          {action === 'celebrate' && (
            <p>Mark your goals as complete from the Goals page to celebrate your achievements!</p>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
