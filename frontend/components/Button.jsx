import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon: Icon,
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';

    return (
        <button
            type={type}
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {Icon && <span className="btn-icon-wrapper"><Icon size={size === 'sm' ? 14 : 18} /></span>}
            {children}
        </button>
    );
};

export default Button;
