import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Skillzy Light / Dark Theme System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
  });

  test('defaults to Light Mode and updates documentElement classes', () => {
    const TestComponent = () => {
      const { theme, isDark } = useTheme();
      return (
        <div>
          <span data-testid="theme-value">{theme}</span>
          <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
          <ThemeToggle />
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(screen.getByTestId('is-dark').textContent).toBe('false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('compact toggle button switches to Dark Mode and persists in localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to toggle to dark mode
    fireEvent.click(toggleButton);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('skillzy_theme')).toBe('dark');

    // Button accessible label should now reflect switching back to light mode
    const lightToggleButton = screen.getByRole('button', { name: /switch to light mode/i });
    expect(lightToggleButton).toBeInTheDocument();

    // Click again to toggle back to light mode
    fireEvent.click(lightToggleButton);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('skillzy_theme')).toBe('light');
  });

  test('segmented toggle provides accessible dual-option selection for settings', () => {
    render(
      <ThemeProvider>
        <ThemeToggle variant="segmented" />
      </ThemeProvider>
    );

    const lightOption = screen.getByRole('radio', { name: /light mode/i });
    const darkOption = screen.getByRole('radio', { name: /dark mode/i });

    expect(lightOption).toHaveAttribute('aria-checked', 'true');
    expect(darkOption).toHaveAttribute('aria-checked', 'false');

    // Click Dark Mode radio
    fireEvent.click(darkOption);

    expect(darkOption).toHaveAttribute('aria-checked', 'true');
    expect(lightOption).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('skillzy_theme')).toBe('dark');

    // Click Light Mode radio
    fireEvent.click(lightOption);

    expect(lightOption).toHaveAttribute('aria-checked', 'true');
    expect(darkOption).toHaveAttribute('aria-checked', 'false');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('skillzy_theme')).toBe('light');
  });

  test('respects pre-existing saved dark theme in localStorage on initial mount', () => {
    localStorage.setItem('skillzy_theme', 'dark');

    const TestComponent = () => {
      const { theme, isDark } = useTheme();
      return (
        <div>
          <span data-testid="theme-value">{theme}</span>
          <span data-testid="is-dark">{isDark ? 'true' : 'false'}</span>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('dark');
    expect(screen.getByTestId('is-dark').textContent).toBe('true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
