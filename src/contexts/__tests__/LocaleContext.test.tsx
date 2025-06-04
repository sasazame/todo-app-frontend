import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { LocaleProvider, useLocale } from '../LocaleContext';

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock window.location.reload
const mockReload = jest.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (window as any).location;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).location = { reload: mockReload };

describe('LocaleContext', () => {
  beforeEach(() => {
    document.cookie = '';
    mockReload.mockClear();
  });

  describe('LocaleProvider', () => {
    it('renders children correctly', () => {
      const TestComponent = () => <div>Test Content</div>;
      
      const { getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );
      
      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('uses default locale when no initialLocale provided', () => {
      const TestComponent = () => {
        const { locale } = useLocale();
        return <div>{locale}</div>;
      };
      
      const { getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );
      
      expect(getByText('ja')).toBeInTheDocument();
    });

    it('uses provided initialLocale', () => {
      const TestComponent = () => {
        const { locale } = useLocale();
        return <div>{locale}</div>;
      };
      
      const { getByText } = render(
        <LocaleProvider initialLocale="en">
          <TestComponent />
        </LocaleProvider>
      );
      
      expect(getByText('en')).toBeInTheDocument();
    });
  });

  describe('useLocale', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocaleProvider>{children}</LocaleProvider>
    );

    it('returns default locale initially', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      
      expect(result.current.locale).toBe('ja');
    });

    it('allows changing locale', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      
      act(() => {
        result.current.setLocale('en');
      });
      
      expect(result.current.locale).toBe('en');
    });

    it('sets cookie when locale changes', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      
      act(() => {
        result.current.setLocale('en');
      });
      
      // Check if cookie was set (simplified check)
      expect(document.cookie).toContain('locale=en');
    });

    it('reloads page when locale changes', () => {
      const { result } = renderHook(() => useLocale(), { wrapper });
      
      act(() => {
        result.current.setLocale('en');
      });
      
      expect(mockReload).toHaveBeenCalled();
    });

    it('throws error when used outside provider', () => {
      // Capture console.error to prevent test output pollution
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useLocale());
      }).toThrow('useLocale must be used within a LocaleProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Cookie handling', () => {
    it('reads locale from cookie on mount', () => {
      // Set cookie before rendering
      document.cookie = 'locale=en; path=/';
      
      const TestComponent = () => {
        const { locale } = useLocale();
        return <div>{locale}</div>;
      };
      
      const { getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );
      
      // Should read 'en' from cookie
      expect(getByText('en')).toBeInTheDocument();
    });

    it('ignores invalid locale from cookie', () => {
      // Set invalid locale in cookie
      document.cookie = 'locale=invalid; path=/';
      
      const TestComponent = () => {
        const { locale } = useLocale();
        return <div>{locale}</div>;
      };
      
      const { getByText } = render(
        <LocaleProvider>
          <TestComponent />
        </LocaleProvider>
      );
      
      // Should fall back to default locale
      expect(getByText('ja')).toBeInTheDocument();
    });
  });
});