// src/components/forms/PhoneInput.tsx
import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { TextField } from '@mui/material';
import { FieldError } from 'react-hook-form';

interface ControlledPhoneInputProps<T> {
  controlProps: UseControllerProps<T>;
  label: string;
  error?: FieldError;
  helperText?: string;
  defaultCountry?: string;
}

export const ControlledPhoneInput = <T,>({
  controlProps,
  label,
  error,
  helperText,
  defaultCountry = 'ET', // Default to Ethiopia
}: ControlledPhoneInputProps<T>) => {
  const {
    field: { ref, ...fieldProps },
  } = useController(controlProps);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <PhoneInput
        {...fieldProps}
        international
        defaultCountry={defaultCountry}
        withCountryCallingCode
        inputComponent={TextField}
        inputProps={{
          inputRef: ref,
          error: !!error,
          helperText: error?.message || helperText,
          variant: 'outlined',
          fullWidth: true,
        }}
        style={{
          '--PhoneInput-color--focus': 'var(--mui-palette-primary-main)',
          '--PhoneInputCountrySelectArrow-color': 'currentColor',
        }}
      />
    </Box>
  );
};