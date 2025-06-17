import React from 'react';
import { FiDownload, FiPrinter, FiShare2 } from 'react-icons/fi';
import { Transaction } from '@/types/transaction';

interface ReceiptViewerProps {
  transaction: Transaction;
  onPrint?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  transaction,
  onPrint,
  onDownload,
  onShare
}) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const actionButtons = [
    { icon: <FiPrinter />, label: 'Print', action: onPrint },
    { icon: <FiDownload />, label: 'Download', action: onDownload },
    { icon: <FiShare2 />, label: 'Share', action: onShare }
  ];

  return (
    <div className="receipt-viewer bg-white rounded-lg shadow-md overflow-hidden">
      <div className="receipt-header bg-blue-600 text-white p-4">
        <h3 className="text-xl font-bold">Payment Receipt</h3>
        <p className="text-sm opacity-90">Transaction #{transaction.id}</p>
      </div>

      <div className="receipt-body p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Transaction Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{formatDate(transaction.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  transaction.status === 'completed' ? 'text-green-600' : 
                  transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="capitalize">{transaction.type}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Payment Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Method:</span>
                <span className="capitalize">{transaction.method.replace('-', ' ')}</span>
              </div>
              {transaction.reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span>{transaction.reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {transaction.notes && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-2">Notes</h4>
            <p className="text-gray-600">{transaction.notes}</p>
          </div>
        )}
      </div>

      <div className="receipt-footer border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-center space-x-4">
          {actionButtons.map((button, index) => (
            <button
              key={index}
              onClick={button.action}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              {button.icon}
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;