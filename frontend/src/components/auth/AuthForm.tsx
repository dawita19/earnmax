import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';

// Validation schema
const authSchema = z.object({
  phone: z.string()
    .min(10, 'Phone must be 10 digits')
    .max(13, 'Phone must be 10-13 digits')
    .regex(/^[0-9+]+$/, 'Only numbers and + allowed'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be 8+ characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special char'),
  inviteCode: z.string().length(6, 'Must be 6 characters').optional()
});

type AuthFormProps = {
  variant: 'login' | 'register';
  onSuccess: (data: AuthFormData) => void;
  loading?: boolean;
};

type AuthFormData = z.infer<typeof authSchema>;

export const AuthForm: React.FC<AuthFormProps> = ({ 
  variant, 
  onSuccess, 
  loading = false 
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setError 
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const onSubmit: SubmitHandler<AuthFormData> = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSuccess(data);
    } catch (err) {
      setServerError('Authentication failed. Please try again.');
      setError('root', { message: 'Server error occurred' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full space-y-6"
    >
      {serverError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              autoComplete="tel"
              className={`block w-full pr-10 ${errors.phone ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none sm:text-sm rounded-md`}
              placeholder="+251900000000"
            />
            {errors.phone && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Email Input (only for register) */}
        {variant === 'register' && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (Optional)
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              autoComplete="email"
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none`}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        )}

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete={variant === 'login' ? 'current-password' : 'new-password'}
              className={`block w-full pr-10 ${errors.password ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none sm:text-sm rounded-md`}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Invite Code (only for register) */}
        {variant === 'register' && (
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
              Invitation Code (Optional)
            </label>
            <input
              {...register('inviteCode')}
              type="text"
              id="inviteCode"
              maxLength={6}
              className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${errors.inviteCode ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} focus:outline-none`}
            />
            {errors.inviteCode && (
              <p className="mt-2 text-sm text-red-600">{errors.inviteCode.message}</p>
            )}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : variant === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};