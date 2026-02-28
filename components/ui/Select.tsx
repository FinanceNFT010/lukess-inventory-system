'use client';

import React from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    error?: string;
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', error, children, ...props }, ref) => {
        return (
            <div className="w-full">
                <select
                    ref={ref}
                    className={`w-full bg-white border ${error ? 'border-red-600' : 'border-zinc-300'
                        } rounded-md px-3 py-2 text-sm text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && (
                    <p className="mt-1 text-xs text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
