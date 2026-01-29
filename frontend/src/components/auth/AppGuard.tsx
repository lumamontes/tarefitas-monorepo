/**
 * AppGuard Component
 * Optional onboarding gate. Per MVP/NON_GOALS: "No forced onboarding flows",
 * "No account required" — do not use this to block core app usage.
 * Use only where onboarding is explicitly required (e.g. profile section).
 */

import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { hasCompletedOnboarding } from '../../shared/lib/user-helpers';
import { LoadingScreen } from '../ui/LoadingScreen';

interface AppGuardProps {
  children: React.ReactNode;
}

export function AppGuard({ children }: AppGuardProps) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check onboarding status
    const checkOnboarding = () => {
      const completed = hasCompletedOnboarding();
      
      if (!completed) {
        // Redirect to onboarding
        navigate({ to: '/onboarding/nome' });
      } else {
        setIsChecking(false);
      }
    };

    // Small delay to ensure stores are loaded
    const timeoutId = setTimeout(checkOnboarding, 200);
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  if (isChecking) {
    return <LoadingScreen message="Carregando..." />;
  }

  return <>{children}</>;
}
