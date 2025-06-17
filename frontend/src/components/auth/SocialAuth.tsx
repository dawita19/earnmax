import React from 'react';
import { FaGoogle, FaFacebook, FaApple, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion';

type SocialProvider = 'google' | 'facebook' | 'apple' | 'twitter';

type SocialAuthProps = {
  onProviderSelect: (provider: SocialProvider) => void;
  loading?: boolean;
  disabledProviders?: SocialProvider[];
};

const providerConfig = {
  google: {
    icon: <FaGoogle className="text-red-500" />,
    label: 'Google',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    hoverBg: 'hover:bg-gray-50'
  },
  facebook: {
    icon: <FaFacebook className="text-blue-600" />,
    label: 'Facebook',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    hoverBg: 'hover:bg-blue-700'
  },
  apple: {
    icon: <FaApple className="text-black" />,
    label: 'Apple',
    bgColor: 'bg-black',
    textColor: 'text-white',
    borderColor: 'border-black',
    hoverBg: 'hover:bg-gray-800'
  },
  twitter: {
    icon: <FaTwitter className="text-blue-400" />,
    label: 'Twitter',
    bgColor: 'bg-blue-400',
    textColor: 'text-white',
    borderColor: 'border-blue-400',
    hoverBg: 'hover:bg-blue-500'
  }
};

export const SocialAuth: React.FC<SocialAuthProps> = ({
  onProviderSelect,
  loading = false,
  disabledProviders = []
}) => {
  const handleClick = (provider: SocialProvider) => {
    if (!loading && !disabledProviders.includes(provider)) {
      onProviderSelect(provider);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Object.entries(providerConfig).map(([provider, config]) => {
          const isDisabled = disabledProviders.includes(provider as SocialProvider) || loading;
          
          return (
            <motion.button
              key={provider}
              whileTap={{ scale: isDisabled ? 1 : 0.95 }}
              type="button"
              disabled={isDisabled}
              onClick={() => handleClick(provider as SocialProvider)}
              className={`w-full inline-flex justify-center items-center py-2 px-4 rounded-md border ${config.bgColor} ${config.textColor} ${config.borderColor} ${isDisabled ? 'opacity-50 cursor-not-allowed' : config.hoverBg} shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <span className="mr-2">{config.icon}</span>
              {config.label}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        By signing in, you agree to our{' '}
        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
          Privacy Policy
        </a>.
      </div>
    </div>
  );
};