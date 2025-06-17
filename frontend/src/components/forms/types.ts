// src/components/forms/types.ts
import { FieldValues, FieldErrors, Control } from 'react-hook-form';

export interface FormFieldProps<T extends FieldValues> {
  name: keyof T;
  control: Control<T>;
  errors: FieldErrors<T>;
}

export interface OptionType {
  value: string | number;
  label: string;
}

export interface CountryType {
  code: string;
  label: string;
  phone: string;
}