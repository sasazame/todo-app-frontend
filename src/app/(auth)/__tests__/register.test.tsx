import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterPage from '../register/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth API
jest.mock('@/services/auth', () => ({
  authAPI: {
    register: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
  AuthAPIError: class AuthAPIError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthAPIError';
    }
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('RegisterPage', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders registration form correctly', () => {
    render(<RegisterPage />, { wrapper });

    expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Initially, no password strength indicator
    expect(screen.queryByText(/password requirements/i)).not.toBeInTheDocument();

    // Type weak password
    await user.type(passwordInput, 'abc');

    // Should show requirements
    expect(screen.getByText(/password requirements/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
    expect(screen.getByText(/one special character/i)).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'DifferentPass123!');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it('validates username format', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    
    // Test invalid username with special characters
    await user.type(usernameInput, 'user@name');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Toggle password visibility
    const passwordToggle = passwordInput.parentElement?.querySelector('button[type="button"]');
    const confirmPasswordToggle = confirmPasswordInput.parentElement?.querySelector('button[type="button"]');

    if (passwordToggle) {
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }

    if (confirmPasswordToggle) {
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    }
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    // Create a controllable promise for register API call
    let resolveRegister: (value: unknown) => void;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    
    // Mock auth API to use our controllable promise
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockAuthAPI = require('@/services/auth').authAPI;
    mockAuthAPI.register.mockReturnValue(registerPromise);
    
    render(<RegisterPage />, { wrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'ValidPass123!');
    await user.type(confirmPasswordInput, 'ValidPass123!');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/creating account/i);
    });

    // Resolve the register promise
    resolveRegister!({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      message: 'Registration successful',
    });

    // Wait for redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?registered=true');
    });
  });

  it('has correct links', () => {
    render(<RegisterPage />, { wrapper });

    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login');

    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    expect(termsLink).toHaveAttribute('href', '/terms');

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('shows strong password when all requirements are met', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { wrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'StrongPass123!');

    // All requirements should show as met (with check marks)
    // Check for success class or check icon presence
    const requirements = screen.getByText(/password requirements/i).parentElement;
    expect(requirements).toBeInTheDocument();
    
    // All requirements should be marked as valid
    const requirementTexts = [
      /at least 8 characters/i,
      /one uppercase letter/i,
      /one lowercase letter/i,
      /one number/i,
      /one special character/i,
    ];

    requirementTexts.forEach(text => {
      const element = screen.getByText(text);
      expect(element).toHaveClass('text-success-500');
    });
  });
});