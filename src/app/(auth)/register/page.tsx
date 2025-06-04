'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, UserPlus, User, Mail, Lock, Sparkles } from 'lucide-react';
import { Button, FloatingInput, PasswordStrength } from '@/components/ui';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useRegister, useAuth } from '@/hooks/useAuth';


export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register: registerUser, isLoading, clearError } = useRegister();
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  // Redirect when authenticated (after successful registration)
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser(data.username, data.email, data.password);
      // Redirect will happen automatically via useEffect when isAuthenticated becomes true
    } catch {
      // Error is already handled by the useRegister hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Premium Glass Card */}
      <div className="w-full max-w-md animate-float">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-white/70">
              Enter your information to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FloatingInput
                {...register('username')}
                type="text"
                label="Username"
                error={errors.username?.message}
                autoComplete="username"
                disabled={isLoading}
                leftIcon={<User className="h-4 w-4" />}
              />
            </div>

            <div>
              <FloatingInput
                {...register('email')}
                type="email"
                label="Email Address"
                error={errors.email?.message}
                autoComplete="email"
                disabled={isLoading}
                leftIcon={<Mail className="h-4 w-4" />}
              />
            </div>

            <div>
              <FloatingInput
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                error={errors.password?.message}
                autoComplete="new-password"
                disabled={isLoading}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/70 hover:text-white transition-colors"
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
              {password && <PasswordStrength password={password} />}
            </div>

            <div>
              <FloatingInput
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                disabled={isLoading}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white/70 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>

            <div className="text-xs text-white/60">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-purple-300 hover:text-purple-200">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-purple-300 hover:text-purple-200">
                Privacy Policy
              </Link>
              .
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]"
              size="lg"
              loading={isLoading}
              leftIcon={!isLoading && <UserPlus className="h-5 w-5" />}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm text-white/70">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}