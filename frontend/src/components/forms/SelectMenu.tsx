// src/components/forms/SelectMenu.tsx
import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectProps,
} from '@mui/material';

interface SelectOption {
  value: string | number;
  label: string;
}

interface ControlledSelectProps<T> extends Omit<SelectProps, 'name'> {
  controlProps: UseControllerProps<T>;
  label: string;
  options: SelectOption[];
  helperText?: string;
}

export const ControlledSelect = <T,>({
  controlProps,
  label,
  options,
  helperText,
  ...selectProps
}: ControlledSelectProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController(controlProps);

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>{label}</InputLabel>
      <Select
        {...field}
        {...selectProps}
        label={label}
        value={field.value ?? ''}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{error?.message || helperText}</FormHelperText>
    </FormControl>
  );
};