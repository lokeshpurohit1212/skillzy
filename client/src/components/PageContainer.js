import React from 'react';

/**
 * Skillzy Standard Page Container
 * Provides consistent header-to-content spacing (pt-20 pb-16),
 * standardized max-width (max-w-6xl or max-w-7xl), horizontal padding,
 * and unified white-and-purple design language across all platform routes.
 */
const PageContainer = ({ 
  children, 
  maxWidth = 'max-w-6xl', 
  className = '', 
  title, 
  description, 
  badge,
  action 
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 pt-20 pb-16 px-4 sm:px-6 lg:px-8 animate-fade-in ${className}`}>
      <div className={`w-full ${maxWidth} mx-auto space-y-8`}>
        {(title || badge) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-6">
            <div>
              {badge && (
                <div className="inline-flex items-center space-x-1.5 bg-purple-50 text-[#5D3C64] border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  {badge}
                </div>
              )}
              {title && (
                <h1 className="text-3xl md:text-4xl font-extrabold text-brand-plum tracking-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-brand-orchid text-base mt-1">
                  {description}
                </p>
              )}
            </div>
            {action && <div className="flex items-center gap-3">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
