import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('@/hooks/useAuth');

// Mock useTranslations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'app.title': 'TODO App',
      'header.profile': 'Profile',
      'header.logout': 'Logout',
      'common.language': 'Language',
      'language': 'Language',
    };
    return translations[key] || key;
  },
}));

// Mock LocaleContext
jest.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'ja',
    setLocale: jest.fn(),
  }),
}));

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Header', () => {
  const mockLogout = jest.fn();

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLogout as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isLoading: false,
    });
  });

  it('renders nothing when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { container } = renderWithTheme(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header with user info when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    expect(screen.getByText('TODO App')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    // Email is no longer displayed as per requirements
    expect(screen.queryByText(`(${mockUser.email})`)).not.toBeInTheDocument();
  });

  it('renders profile link', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    const profileLink = screen.getByRole('link', { name: 'Profile' });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('renders language switcher', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    // Check for language switcher button (now a globe icon)
    const languageButton = screen.getByRole('button', { name: 'Language' });
    expect(languageButton).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    renderWithTheme(<Header />);

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows loading state on logout button when logging out', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });
    (useLogout as jest.Mock).mockReturnValue({
      logout: mockLogout,
      isLoading: true,
    });

    renderWithTheme(<Header />);

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeDisabled();
  });
});