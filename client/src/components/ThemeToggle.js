import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Skillzy Theme Toggle Component
 * 
 * Supports two presentation variants:
 * 1. "compact" (default): Elegant circular button with sun/moon icon for headers and navigation bars.
 * 2. "segmented": Dual-button segmented switch for settings and profile preferences with descriptive labels.
 */
const ThemeToggle = ({ 
  variant = 'compact', 
  className = '',
  isHeaderTransparent = false 
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center p-1 bg-gray-100 dark:bg-[#13111C] rounded-2xl border border-gray-200 dark:border-[#2D263B] transition-colors ${className}`}
        role="radiogroup"
        aria-label="Theme preference"
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDark}
          onClick={() => setTheme('light')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink ${
            !isDark
              ? 'bg-white text-brand-plum shadow-sm'
              : 'text-gray-500 hover:text-brand-plum dark:text-gray-400 dark:hover:text-purple-200'
          }`}
        >
          <Sun className={`w-4 h-4 ${!isDark ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
          <span>Light Mode</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isDark}
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
            isDark
              ? 'bg-[#1A1625] text-purple-200 shadow-sm border border-purple-900/50'
              : 'text-gray-500 hover:text-brand-plum dark:text-gray-400 dark:hover:text-purple-200'
          }`}
        >
          <Moon className={`w-4 h-4 ${isDark ? 'text-purple-300 fill-purple-300' : 'text-gray-400'}`} />
          <span>Dark Mode</span>
        </button>
      </div>
    );
  }

  // Compact circular button variant for Navbar
  const buttonStyle = isHeaderTransparent
    ? 'text-white hover:bg-white/15 active:bg-white/20'
    : 'text-brand-plum dark:text-purple-200 hover:bg-brand-pink/15 dark:hover:bg-purple-900/30';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-pink dark:focus:ring-purple-400 select-none ${buttonStyle} ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun 
            className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" 
            aria-hidden="true" 
          />
        ) : (
          <Moon 
            className="w-5 h-5 transition-transform duration-300 -rotate-12 hover:rotate-0" 
            aria-hidden="true" 
          />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
