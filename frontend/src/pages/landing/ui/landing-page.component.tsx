/**
 * Landing Page — Warm editorial, distinctive.
 * Fixed left “clima” strip, asymmetric layout, display + body type, staggered reveal.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate } from '@tanstack/react-router';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { CustomPalette } from '../../../types';
import { interpolatePalette, type Palette } from '../../../shared/lib/color-interpolate.utils';
import { LandingCTA } from '../../../components/landing/LandingCTA';
import { LandingPreview } from '../../../components/landing/LandingPreview';
// @ts-ignore - Vite handles ?url imports
import illustrationSvg from '../../../assets/illustration-landing-page.svg?url';
import { Button } from '@/shared/ui';

const LANDING_THEME_STRIP_KEY = 'tarefitas-landing-theme-value';

// Journey: colorful/warm (0) → balanced (50) → low stimulus (100)
const PALETTES: Palette[] = [
  {
    bg: '#fef7f0',
    panel: '#fffaf5',
    sidebar: '#fefaf5',
    text: '#4a3728',
    mutedText: '#7d6b5a',
    accent: '#b85c38',
    border: '#eaded4',
  },
  {
    bg: '#f5f5f4',
    panel: '#ffffff',
    sidebar: '#fafafa',
    text: '#2d3436',
    mutedText: '#636e72',
    accent: '#5c7cfa',
    border: '#e5e5e5',
  },
  {
    bg: '#f0f0ef',
    panel: '#f5f5f5',
    sidebar: '#f8f8f8',
    text: '#6b6b6b',
    mutedText: '#9a9a9a',
    accent: '#8a8a8a',
    border: '#e2e2e2',
  },
];

function valueToPalette(value: number): CustomPalette {
  const t = value / 100;
  if (t <= 0.5) {
    return interpolatePalette(PALETTES[0], PALETTES[1], t * 2) as CustomPalette;
  }
  return interpolatePalette(PALETTES[1], PALETTES[2], (t - 0.5) * 2) as CustomPalette;
}

const STRIP_WIDTH = 48;

export function LandingPage() {
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [sliderValue, setSliderValue] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(LANDING_THEME_STRIP_KEY);
    const n = raw ? parseFloat(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  });

  const applyPalette = useCallback(
    (value: number) => {
      const palette = valueToPalette(value);
      updateSettings({ themeId: 'custom', customPalette: palette });
    },
    [updateSettings]
  );

  useEffect(() => {
    applyPalette(sliderValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const handleSliderChange = (value: number) => {
    const v = Math.max(0, Math.min(100, value));
    setSliderValue(v);
    applyPalette(v);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANDING_THEME_STRIP_KEY, String(v));
    }
  };

  const navigate = useNavigate();

  return (
    <main
      className="landing-page min-h-screen bg-theme-bg text-theme-text flex"
      role="main"
      aria-label="Página inicial"
      style={{ marginLeft: `${STRIP_WIDTH}px` }}
    >
      <div className="landing-page-content flex-1 flex flex-col w-full">
        <div className="flex-1 grid lg:grid-cols-[1fr,minmax(320px,40%)] gap-12 lg:gap-16 items-center px-6 sm:px-10 py-14 md:py-20 max-w-6xl mx-auto w-full">
          <div className="flex justify-center lg:justify-end gap-4">
           <Button variant="primary" size="large"
           onClick={() => navigate({ to: '/onboarding/nome' })}
           >
             Começar
          </Button>
          <Button variant="secondary" size="large">
            Entrar
          </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
