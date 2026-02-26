import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
    return (
        <div className="page-header" style={{
            marginBottom: 'var(--spacing-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <h1 className="page-title" style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-gray-900)',
                    marginBottom: 'var(--spacing-1)'
                }}>{title}</h1>
                {subtitle && (
                    <p className="page-subtitle" style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-gray-500)',
                        margin: 0
                    }}>{subtitle}</p>
                )}
            </div>
            {actions && (
                <div className="page-actions" style={{
                    display: 'flex',
                    gap: 'var(--spacing-3)'
                }}>
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
