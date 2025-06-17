import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';

interface PaymentProofProps {
  onUpload: (file: File) => Promise<boolean>;
  required?: boolean;
  transactionId?: string;
}

const PaymentProof: React.FC<PaymentProofProps> = ({ onUpload, required = true, transactionId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    // Validate file
    if (!selectedFile.type.match('image.*')) {
      setError('Only image files are accepted');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    try {
      setIsUploading(true);
      const success = await onUpload(selectedFile);
      if (!success) {
        setError('Upload failed. Please try again.');
        setFile(null);
        setPreview(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxFiles: 1,
    disabled: isUploading
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="payment-proof-uploader">
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
            <p>Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <Image
              src={preview}
              alt="Payment proof preview"
              width={200}
              height={200}
              className="mx-auto rounded-md object-contain max-h-40"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiUpload size={24} className="mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop the payment proof here'
                : 'Drag & drop payment proof, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted: JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>

      {transactionId && (
        <p className="text-sm text-gray-600 mt-2">
          Transaction ID: <span className="font-mono">{transactionId}</span>
        </p>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2 flex items-center">
          <FiX className="mr-1" /> {error}
        </p>
      )}

      {file && !error && (
        <p className="text-green-600 text-sm mt-2 flex items-center">
          <FiCheckCircle className="mr-1" /> Proof uploaded successfully
        </p>
      )}
    </div>
  );
};

export default PaymentProof;