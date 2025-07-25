import { MovementType } from './chainData';
import { ethers } from 'ethers';

interface CIDObject {
  cid: string;
}

export interface FormState {
  type: MovementType;
  description: string | CIDObject;
  expiryDays: number;
  endpoint: string;
  target: string;
  calldata: string;
  value: string;
  actionType?: string;
  params?: {
    [key: string]: string | number | { cid: string };
  };
  calls?: Array<{
    target: string;
    callData: string;
    value: string;
  }>;
}

export interface EndpointOption {
  value: string;
  label: string;
  authType: MovementType;
  balance?: string;
  isDisabled?: boolean;
}

export interface MovementFormValidation {
  target: boolean;
  calldata: boolean;
  description: boolean;
  [key: string]: boolean; // Allow dynamic field validation
}

export interface MovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<FormState>;
}

export const DEFAULT_FORM_STATE: FormState = {
  type: MovementType.AgentMajority,
  description: '',
  expiryDays: 7,
  endpoint: 'new',
  target: '',
  calldata: '0x',
  value: '0',
  actionType: 'customCall',
  params: {
    to: '',
    amount: '0',
    target: '',
    calldata: '0x',
    value: '0'
  }
};

export const validateFormField = (name: keyof FormState | string, value: string | number | CIDObject | any): boolean => {
  // Convert value to string for validation
  const stringValue = typeof value === 'object' && value !== null && 'cid' in value
    ? value.cid
    : String(value);
  // Handle empty values appropriately
  if (!stringValue) {
    if (name === 'value' || name === 'amount') return true; // These default to 0
    return true; // Allow empty during editing
  }

  // Basic validations for common fields
  switch (name) {
    case 'target':
    case 'to':
      return /^0x[a-fA-F0-9]{40}$/.test(stringValue);
    case 'calldata':
      return /^0x([a-fA-F0-9]{8,})?$/.test(stringValue); // Allow empty or valid calldata
    case 'value':
    case 'amount':
      return !isNaN(Number(stringValue));
    case 'description':
      return stringValue.length >= 10;
    default:
      return true;
  }
};

export const validateFormForSubmission = (formData: FormState): Record<string, boolean> => {
  const baseValidation = {
    description: typeof formData.description === 'string' && formData.description.length >= 10,
    value: true // Always valid as it defaults to '0'
  };

  if (formData.actionType === 'tokenTransfer') {
    return {
      ...baseValidation,
      target: true, // Token transfer target is always valid (root token)
      calldata: true, // Calldata is generated automatically
      to: formData.params?.to ? /^0x[a-fA-F0-9]{40}$/.test(
          typeof formData.params.to === 'object' && 'cid' in (formData.params.to || {}) 
            ? (formData.params.to as {cid: string}).cid
            : String(formData.params.to)
        ) : false
    };
  }

  // Custom call validation
  return {
    ...baseValidation,
    target: /^0x[a-fA-F0-9]{40}$/.test(formData.target),
    calldata: /^0x([a-fA-F0-9]{8,})?$/.test(formData.calldata)
  };
};

// Add hex string validation helper
export const isHexString = (value: string): boolean => {
  return /^0x[0-9a-fA-F]*$/.test(value);
};