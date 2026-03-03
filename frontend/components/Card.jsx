import React from 'react';

const Card = ({
    children,
    title,
    footer,
    className = '',
    bodyClassName = '',
    headerClassName = '',
    footerClassName = '',
    noPadding = false
}) => {
    return (
        <div className={`card ${className}`}>
            {title && (
                <div className={`card-header ${headerClassName}`}>
                    <h2 className="card-title">{title}</h2>
                </div>
            )}
            <div className={`card-body ${noPadding ? 'p-0' : ''} ${bodyClassName}`}>
                {children}
            </div>
            {footer && (
                <div className={`card-footer ${footerClassName}`}>
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
