'use client';

import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: number | string;
  color?: string;
}

// Icon registry - maps icon names to components
const iconRegistry: Record<string, React.ComponentType<{ className?: string; size?: number | string; color?: string }>> = {};

export function registerIcon(name: string, component: React.ComponentType<{ className?: string; size?: number | string; color?: string }>) {
  iconRegistry[name] = component;
}

export function Icon({ name, className = '', size = 24, color }: IconProps) {
  const IconComponent = iconRegistry[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in registry`);
    return null;
  }
  
  return <IconComponent className={className} size={size} color={color} />;
}

