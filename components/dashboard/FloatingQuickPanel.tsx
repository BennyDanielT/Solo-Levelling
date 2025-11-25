'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Target,
  CalendarCheck,
  Crosshair,
  CheckCheck,
} from 'lucide-react';

const QUICK_ACTIONS = [
  {
    title: 'Add Goal',
    description: 'Create a new objective or milestone',
    href: '#add-goal',
    icon: Target,
  },
  {
    title: 'Weekly Review',
    description: 'Check progress and adjust habits',
    href: '#weekly-review',
    icon: CalendarCheck,
  },
  {
    title: 'Focus Mode',
    description: 'Jump into the dashboard overview',
    href: '#dashboard',
    icon: Crosshair,
  },
  {
    title: 'Celebrate Win',
    description: 'Mark a goal as completed',
    href: '#celebrate',
    icon: CheckCheck,
  },
];

export function FloatingQuickPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='fixed bottom-6 right-6 z-50'>
      <button
        type='button'
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className='group flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-purple-500/40 transition hover:scale-105'
      >
        <Sparkles className='h-4 w-4' />
        Quick Panel
      </button>

      {isOpen && (
        <div className='mt-3 w-80 rounded-3xl border border-white/10 bg-[#090b1a]/95 p-4 text-white shadow-2xl backdrop-blur'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-widest text-white/70'>
                Instant Actions
              </p>
              <p className='text-base font-semibold'>Command Center</p>
            </div>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/80 transition hover:bg-white/20'
            >
              Close
            </button>
          </div>

          <div className='space-y-3'>
            {QUICK_ACTIONS.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className='flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/10'
                onClick={() => setIsOpen(false)}
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/70 to-emerald-400/70 text-white'>
                  <Icon className='h-5 w-5' />
                </div>
                <div>
                  <p className='text-sm font-semibold'>{title}</p>
                  <p className='text-xs text-white/70'>{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
