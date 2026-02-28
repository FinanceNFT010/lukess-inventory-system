'use client';

import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        loading = false,
        disabled,
        children,
        ...props
    }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

        const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
            primary: 'bg-gold-500 text-white hover:bg-gold-600 focus:ring-gold-500 shadow-sm',
            secondary: 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50 focus:ring-zinc-500 shadow-sm',
            danger: 'bg-zinc-900 text-white hover:bg-black focus:ring-zinc-900 shadow-sm',
            ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        };

        const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
