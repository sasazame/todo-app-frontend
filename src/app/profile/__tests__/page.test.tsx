import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ProfilePage from '../page';
import { userApi } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { showSuccess, showError } from '@/components/ui/toast';

jest.mock('@/services/user');
jest.mock('@/components/ui/toast');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthGuard to render children directly
jest.mock('@/components/auth', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Header component
jest.mock('@/components/layout', () => ({
  Header: () => <div>Mock Header</div>,
}));

// Mock useAuth hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
  useLogout: jest.fn(() => ({
    logout: jest.fn(),
    isLoading: false,
  })),
}));

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function renderWithQuery(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('ProfilePage', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
    (userApi.getById as jest.Mock).mockResolvedValue(mockUser);
  });

  it('displays user information', async () => {
    renderWithQuery(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('プロフィール設定')).toBeInTheDocument();
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });
  });

  it('opens edit profile modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    expect(screen.getByText('プロフィールを編集')).toBeInTheDocument();
    expect(screen.getByLabelText('ユーザー名')).toHaveValue(mockUser.username);
    expect(screen.getByLabelText('メールアドレス')).toHaveValue(mockUser.email);
  });

  it('updates profile successfully', async () => {
    const user = userEvent.setup();
    const updatedUser = { ...mockUser, username: 'newusername' };
    (userApi.update as jest.Mock).mockResolvedValue(updatedUser);

    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    const updateButton = screen.getByText('更新');
    await user.click(updateButton);

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalledWith(mockUser.id, {
        username: 'newusername',
      });
      expect(showSuccess).toHaveBeenCalledWith('Profile updated successfully!');
    });
  });

  it('opens change password modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByRole('button', { name: 'パスワードを変更' });
    await user.click(changePasswordButton);

    expect(screen.getByRole('heading', { name: 'パスワードを変更' })).toBeInTheDocument();
    expect(screen.getByLabelText('現在のパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('新しいパスワード（確認）')).toBeInTheDocument();
  });

  it('changes password successfully', async () => {
    const user = userEvent.setup();
    (userApi.changePassword as jest.Mock).mockResolvedValue(undefined);

    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByText('パスワードを変更');
    await user.click(changePasswordButton);

    await user.type(screen.getByLabelText('現在のパスワード'), 'currentPass123!');
    await user.type(screen.getByLabelText('新しいパスワード'), 'NewPass123!');
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'NewPass123!');

    const changeButton = screen.getByText('変更');
    await user.click(changeButton);

    await waitFor(() => {
      expect(userApi.changePassword).toHaveBeenCalledWith(mockUser.id, {
        currentPassword: 'currentPass123!',
        newPassword: 'NewPass123!',
      });
      expect(showSuccess).toHaveBeenCalledWith('Password changed successfully!');
    });
  });

  it('validates password requirements', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const changePasswordButton = await screen.findByText('パスワードを変更');
    await user.click(changePasswordButton);

    await user.type(screen.getByLabelText('現在のパスワード'), 'current');
    await user.type(screen.getByLabelText('新しいパスワード'), 'weak');
    await user.type(screen.getByLabelText('新しいパスワード（確認）'), 'weak');

    const changeButton = screen.getByText('変更');
    await user.click(changeButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('opens delete account modal when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const deleteButton = await screen.findByText('アカウントを削除');
    await user.click(deleteButton);

    expect(screen.getByText('アカウントの削除')).toBeInTheDocument();
    expect(screen.getByText(/本当にアカウントを削除しますか/)).toBeInTheDocument();
  });

  it('deletes account successfully', async () => {
    const user = userEvent.setup();
    (userApi.delete as jest.Mock).mockResolvedValue(undefined);

    renderWithQuery(<ProfilePage />);

    const deleteButton = await screen.findByText('アカウントを削除');
    await user.click(deleteButton);

    const confirmDeleteButton = screen.getAllByText('アカウントを削除')[1];
    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(userApi.delete).toHaveBeenCalledWith(mockUser.id);
      expect(showSuccess).toHaveBeenCalledWith('Account deleted successfully');
      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/register');
    });
  });

  it('cancels profile edit', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(screen.queryByText('プロフィールを編集')).not.toBeInTheDocument();
  });

  it('shows error when profile update fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Update failed';
    (userApi.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

    renderWithQuery(<ProfilePage />);

    const editButton = await screen.findByText('編集');
    await user.click(editButton);

    const usernameInput = screen.getByLabelText('ユーザー名');
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newusername');

    const updateButton = screen.getByText('更新');
    await user.click(updateButton);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(errorMessage);
    });
  });
});