// src/components/forms/ControlledInput.tsx
import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';

type ControlledInputProps<T> = TextFieldProps & {
  controlProps: UseControllerProps<T>;
  label: string;
  helperText?: string;
};

export const ControlledInput = <T,>({
  controlProps,
  label,
  helperText,
  ...textFieldProps
}: ControlledInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController(controlProps);

  return (
    <TextField
      {...field}
      {...textFieldProps}
      label={label}
      variant="outlined"
      fullWidth
      margin="normal"
      error={!!error}
      helperText={error?.message || helperText}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
};