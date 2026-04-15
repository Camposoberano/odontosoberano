import React from 'react';
import InputMask from 'react-input-mask';
import { Input, InputProps } from './input';
import { cn } from '@/lib/utils';

interface MaskedInputProps extends Omit<InputProps, 'onChange'> {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  maskChar?: string | null;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value, onChange, maskChar = '_', className, ...props }, ref) => {
    return (
      <InputMask
        mask={mask}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maskChar={maskChar}
      >
        {(inputProps: any) => (
          <Input
            {...inputProps}
            {...props}
            ref={ref}
            className={className}
          />
        )}
      </InputMask>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

// Componentes específicos para casos comuns

interface CPFInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CPFInput = React.forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <MaskedInput
        mask="999.999.999-99"
        value={value}
        onChange={onChange}
        placeholder="000.000.000-00"
        ref={ref}
        {...props}
      />
    );
  }
);

CPFInput.displayName = 'CPFInput';

interface TelefoneInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const TelefoneInput = React.forwardRef<HTMLInputElement, TelefoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    // Detectar se é celular (11 dígitos) ou fixo (10 dígitos)
    const mask = value.replace(/\D/g, '').length <= 10
      ? '(99) 9999-9999'
      : '(99) 99999-9999';

    return (
      <MaskedInput
        mask={mask}
        value={value}
        onChange={onChange}
        placeholder="(00) 00000-0000"
        ref={ref}
        {...props}
      />
    );
  }
);

TelefoneInput.displayName = 'TelefoneInput';

interface CNPJInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CNPJInput = React.forwardRef<HTMLInputElement, CNPJInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <MaskedInput
        mask="99.999.999/9999-99"
        value={value}
        onChange={onChange}
        placeholder="00.000.000/0000-00"
        ref={ref}
        {...props}
      />
    );
  }
);

CNPJInput.displayName = 'CNPJInput';

interface CEPInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CEPInput = React.forwardRef<HTMLInputElement, CEPInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <MaskedInput
        mask="99999-999"
        value={value}
        onChange={onChange}
        placeholder="00000-000"
        ref={ref}
        {...props}
      />
    );
  }
);

CEPInput.displayName = 'CEPInput';

interface DataInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const DataInput = React.forwardRef<HTMLInputElement, DataInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <MaskedInput
        mask="99/99/9999"
        value={value}
        onChange={onChange}
        placeholder="DD/MM/AAAA"
        ref={ref}
        {...props}
      />
    );
  }
);

DataInput.displayName = 'DataInput';

interface HoraInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const HoraInput = React.forwardRef<HTMLInputElement, HoraInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <MaskedInput
        mask="99:99"
        value={value}
        onChange={onChange}
        placeholder="HH:MM"
        ref={ref}
        {...props}
      />
    );
  }
);

HoraInput.displayName = 'HoraInput';
