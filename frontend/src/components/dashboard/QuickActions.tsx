// src/components/dashboard/QuickActions.tsx
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiDollarSign, FiArrowUp, FiUserPlus, FiCreditCard } from 'react-icons/fi';

const actions = [
  {
    id: 'withdraw',
    icon: <FiDollarSign className="w-5 h-5" />,
    label: 'Withdraw',
    path: '/withdraw'
  },
  {
    id: 'upgrade',
    icon: <FiArrowUp className="w-5 h-5" />,
    label: 'Upgrade VIP',
    path: '/upgrade'
  },
  {
    id: 'invite',
    icon: <FiUserPlus className="w-5 h-5" />,
    label: 'Invite Friends',
    path: '/invite'
  },
  {
    id: 'purchase',
    icon: <FiCreditCard className="w-5 h-5" />,
    label: 'Purchase VIP',
    path: '/purchase'
  }
];

export const QuickActions = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push(action.path)}
          className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-200 transition-colors"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-full text-blue-600">
            {action.icon}
          </div>
          <span className="mt-2 text-sm font-medium text-gray-700">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};