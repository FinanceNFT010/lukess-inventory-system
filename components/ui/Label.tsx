'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export function Label({ children, required, className = '', ...props }: LabelProps): React.JSX.Element {
    return (
        <label
            className={`block text-sm font-medium text-zinc-800 mb-1.5 ${className}`}
            {...props}
        >
            {children}
            {required && <span className="text-red-600 ml-1">*</span>}
        </label>
    );
}
