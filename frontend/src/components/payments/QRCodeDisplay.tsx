import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface QRCodeDisplayProps {
  paymentDetails: {
    account: string;
    amount: number;
    currency?: string;
    reference?: string;
    name?: string;
  };
  size?: number;
  showDetails?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  paymentDetails,
  size = 200,
  showDetails = true
}) => {
  const [copied, setCopied] = useState(false);
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Generate QR payload based on payment method
    let payload = '';
    if (paymentDetails.account.startsWith('09')) {
      // Mobile money format
      payload = `ethereum:${paymentDetails.account}?value=${paymentDetails.amount}`;
    } else {
      // Bank account format
      payload = `bank://${paymentDetails.account}?amount=${paymentDetails.amount}&reference=${paymentDetails.reference || ''}`;
    }
    setQrValue(payload);
  }, [paymentDetails]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qr-code-container text-center">
      <div className="qr-wrapper p-4 bg-white rounded-lg inline-block">
        <QRCode
          value={qrValue}
          size={size}
          level="H"
          includeMargin={true}
          renderAs="svg"
          fgColor="#1e40af"
          bgColor="#ffffff"
        />
      </div>

      {showDetails && (
        <div className="details mt-4 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Payment Instructions</h4>
          
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Account:</span>
              <div className="flex items-center">
                <span className="font-mono">{paymentDetails.account}</span>
                <CopyToClipboard text={paymentDetails.account} onCopy={handleCopy}>
                  <button className="ml-2 text-blue-600">
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </CopyToClipboard>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {paymentDetails.amount.toLocaleString()} {paymentDetails.currency || 'ETB'}
              </span>
            </div>

            {paymentDetails.reference && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <div className="flex items-center">
                  <span>{paymentDetails.reference}</span>
                  <CopyToClipboard text={paymentDetails.reference} onCopy={handleCopy}>
                    <button className="ml-2 text-blue-600">
                      {copied ? <FiCheck /> : <FiCopy />}
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            )}

            {paymentDetails.name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span>{paymentDetails.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;