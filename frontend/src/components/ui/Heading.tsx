/**
 * Heading Component
 * Semantic heading with configurable level and size
 * ND-safe: Clear hierarchy, accessible
 */

import { type ReactNode } from 'react';

const sizeClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
};

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: keyof typeof sizeClasses;
  className?: string;
  id?: string;
  children: ReactNode;
}

export function Heading({
  level = 1,
  size = '2xl',
  className = '',
  id,
  children,
}: HeadingProps) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  const sizeClass = sizeClasses[size] ?? sizeClasses.base;

  return (
    <Component id={id} className={`font-semibold ${sizeClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}
