'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'gold';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    icon?: boolean;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    gold: 'bg-gold-50 text-gold-700 border-gold-200',
};

const icons: Record<BadgeVariant, React.ComponentType<{ className?: string }> | null> = {
    success: CheckCircle,
    warning: AlertTriangle,
    danger: XCircle,
    neutral: Clock,
    gold: null,
};

export function Badge({ children, variant = 'neutral', icon = false, className = '' }: BadgeProps): React.JSX.Element {
    const Icon = icon && variant !== 'gold' ? icons[variant] : null;

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border ${variantStyles[variant]} ${className}`}
        >
            {Icon && <Icon className="w-3 h-3" />}
            {children}
        </span>
    );
}
