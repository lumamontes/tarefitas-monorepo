/**
 * LandingCTA Component
 * Client-side CTA buttons that check for existing user
 */

import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { hasCompletedOnboarding } from '../../shared/lib/user-helpers';

interface LandingCTAProps {
  variant?: 'primary' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

export function LandingCTA({ variant = 'primary', className = '', children }: LandingCTAProps) {
  const [to, setTo] = useState('/onboarding/nome');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkUser = setTimeout(() => {
      if (hasCompletedOnboarding()) {
        setTo('/tasks');
      }
      setIsReady(true);
    }, 100);
    return () => clearTimeout(checkUser);
  }, []);

  const baseClasses = variant === 'primary'
    ? 'inline-flex items-center justify-center px-8 py-4 bg-theme-accent text-white rounded-xl font-medium text-lg hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2'
    : 'inline-flex items-center justify-center px-8 py-4 bg-theme-sidebar border-2 border-theme-accent text-theme-text rounded-xl font-medium text-lg hover:bg-theme-panel/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2';
  const classes = `${baseClasses} ${className}`.trim();

  if (!isReady) {
    return (
      <div className={classes} aria-hidden="true">
        {children}
      </div>
    );
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}
