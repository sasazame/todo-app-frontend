'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn, CheckCircle } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { login, isLoading, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Check for registration success message
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please log in to continue.');
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      router.push('/');
    } catch {
      // Error is already handled by the useLogin hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {successMessage && (
              <div className="p-3 text-sm text-green-800 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {successMessage}
              </div>
            )}
            

            <div>
              <Input
                {...register('email')}
                type="email"
                label="Email"
                placeholder="Enter your email"
                error={errors.email?.message}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={isLoading}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline focus:outline-none focus:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              leftIcon={!isLoading && <LogIn className="h-4 w-4" />}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline focus:outline-none focus:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}