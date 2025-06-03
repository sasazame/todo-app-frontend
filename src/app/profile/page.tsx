'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthGuard } from '@/components/auth';
import { Header } from '@/components/layout';
import { Card, Input, Button, Modal } from '@/components/ui';
import { showSuccess, showError } from '@/components/ui/toast';
import { userApi } from '@/services/user';
import { useAuth } from '@/hooks/useAuth';
import { UpdateUserDto, ChangePasswordDto } from '@/types/user';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Fetch user details
  const { data: userDetails } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => user?.id ? userApi.getById(user.id) : null,
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => userApi.update(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] });
      setIsEditingProfile(false);
      showSuccess('Profile updated successfully!');
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => userApi.changePassword(user!.id, data),
    onSuccess: () => {
      setIsChangingPassword(false);
      showSuccess('Password changed successfully!');
      changePasswordForm.reset();
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to change password');
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => userApi.delete(user!.id),
    onSuccess: async () => {
      showSuccess('Account deleted successfully');
      await logout();
      router.push('/register');
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to delete account');
    },
  });

  // Profile update form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: userDetails?.username || user?.username || '',
      email: userDetails?.email || user?.email || '',
    },
  });

  // Password change form
  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileUpdate = (data: UpdateProfileFormData) => {
    const updateData: UpdateUserDto = {};
    if (data.username && data.username !== userDetails?.username) {
      updateData.username = data.username;
    }
    if (data.email && data.email !== userDetails?.email) {
      updateData.email = data.email;
    }
    
    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    } else {
      showError('No changes to update');
    }
  };

  const handlePasswordChange = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const displayUser = userDetails || user;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              タスク一覧に戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">プロフィール設定</h1>
        </div>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">ユーザー情報</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              編集
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">ユーザー名</label>
              <p className="text-lg">{displayUser?.username}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">メールアドレス</label>
              <p className="text-lg">{displayUser?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">登録日</label>
              <p className="text-lg">
                {displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('ja-JP') : '-'}
              </p>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">セキュリティ設定</h2>
          <Button
            variant="secondary"
            onClick={() => setIsChangingPassword(true)}
          >
            パスワードを変更
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <h2 className="text-xl font-semibold mb-4 text-destructive">危険な操作</h2>
          <p className="text-muted-foreground mb-4">
            アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
          </p>
          <Button
            variant="danger"
            onClick={() => setIsDeletingAccount(true)}
          >
            アカウントを削除
          </Button>
        </Card>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <Modal open={isEditingProfile} onClose={() => setIsEditingProfile(false)}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">プロフィールを編集</h2>
              
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div>
                  <Input
                    {...profileForm.register('username')}
                    type="text"
                    id="username"
                    label="ユーザー名"
                    error={profileForm.formState.errors.username?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...profileForm.register('email')}
                    type="email"
                    id="email"
                    label="メールアドレス"
                    error={profileForm.formState.errors.email?.message}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditingProfile(false)}
                    disabled={updateProfileMutation.isPending}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? '更新中...' : '更新'}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Change Password Modal */}
        {isChangingPassword && (
          <Modal open={isChangingPassword} onClose={() => setIsChangingPassword(false)}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">パスワードを変更</h2>
              
              <form onSubmit={changePasswordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <div>
                  <Input
                    {...changePasswordForm.register('currentPassword')}
                    type="password"
                    id="currentPassword"
                    label="現在のパスワード"
                    error={changePasswordForm.formState.errors.currentPassword?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...changePasswordForm.register('newPassword')}
                    type="password"
                    id="newPassword"
                    label="新しいパスワード"
                    error={changePasswordForm.formState.errors.newPassword?.message}
                  />
                </div>
                
                <div>
                  <Input
                    {...changePasswordForm.register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    label="新しいパスワード（確認）"
                    error={changePasswordForm.formState.errors.confirmPassword?.message}
                  />
                </div>
                
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsChangingPassword(false)}
                    disabled={changePasswordMutation.isPending}
                  >
                    キャンセル
                  </Button>
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? '変更中...' : '変更'}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Delete Account Modal */}
        {isDeletingAccount && (
          <Modal open={isDeletingAccount} onClose={() => setIsDeletingAccount(false)}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-destructive">アカウントの削除</h2>
              <p className="text-muted-foreground">
                本当にアカウントを削除しますか？この操作は取り消せません。
                すべてのTODOデータも一緒に削除されます。
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsDeletingAccount(false)}
                  disabled={deleteAccountMutation.isPending}
                >
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? '削除中...' : 'アカウントを削除'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}

export default function ProfilePageWithAuth() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}