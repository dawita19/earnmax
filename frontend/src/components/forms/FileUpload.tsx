// src/components/forms/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { CloudUpload, Clear } from '@mui/icons-material';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  onFileRemoved: () => void;
  acceptedTypes?: string[];
  maxSize?: number;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileAccepted,
  onFileRemoved,
  acceptedTypes = ['image/*', 'application/pdf'],
  maxSize = 5 * 1024 * 1024, // 5MB
  label = 'Drag & drop payment proof here, or click to select',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        if (selectedFile.size > maxSize) {
          setError(`File is too large (max ${maxSize / 1024 / 1024}MB)`);
          return;
        }
        setFile(selectedFile);
        onFileAccepted(selectedFile);
      }
    },
    [maxSize, onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.join(','),
    maxFiles: 1,
  });

  const handleRemove = () => {
    setFile(null);
    onFileRemoved();
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload fontSize="large" color={isDragActive ? 'primary' : 'action'} />
        <Typography variant="body1" sx={{ mt: 1 }}>
          {label}
        </Typography>
        {file && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2">{file.name}</Typography>
            <IconButton onClick={handleRemove} size="small" sx={{ ml: 1 }}>
              <Clear fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Paper>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};