// src/components/dashboard/WelcomeBanner.tsx
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

export const WelcomeBanner = () => {
  const { user, isLoading } = useUser();
  
  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-6 shadow-lg"
    >
      {isLoading ? (
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
      ) : (
        <>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.fullName.split(' ')[0]}!
          </h1>
          <p className="text-blue-100 mt-1">
            VIP Level: <span className="font-semibold text-white">{user?.vipLevel}</span>
          </p>
          <div className="flex items-center mt-4">
            <span className="text-blue-100">Account Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              user?.accountStatus === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user?.accountStatus}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};