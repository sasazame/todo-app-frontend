import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import { useAuth, useLogout } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('Header', () => {
  const mockLogout = jest.fn();

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

    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header with user info when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    render(<Header />);

    expect(screen.getByText('TODO App')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(`(${mockUser.email})`)).toBeInTheDocument();
  });

  it('renders profile link', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    render(<Header />);

    const profileLink = screen.getByRole('link', { name: /profile/i });
    expect(profileLink).toHaveAttribute('href', '/profile');
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });

    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
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

    render(<Header />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeDisabled();
  });
});