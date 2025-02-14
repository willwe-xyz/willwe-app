import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { FormState, MovementFormValidation, DEFAULT_FORM_STATE } from '../types/movements';
import { getEndpointActions } from '../config/endpointActions';

interface UseMovementFormResult {
  formData: FormState;
  validation: MovementFormValidation;
  isSubmitting: boolean;
  handleInputChange: (field: keyof FormState, value: string) => void;
  handleEndpointChange: (endpoint: string, authType: number) => void;
  handleActionChange: (actionId: string, params?: Record<string, any>) => void;
  handleSubmit: (onSubmit: (data: FormState) => Promise<void>) => Promise<void>;
  getActionFields: () => any[];
  isValid: boolean;
}

export const useMovementForm = (rootTokenAddress: string, tokenSymbol: string): UseMovementFormResult => {
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [validation, setValidation] = useState<MovementFormValidation>({
    target: true,
    calldata: true,
    description: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof FormState, value: string): boolean => {
    switch (name) {
      case 'target':
        return ethers.isAddress(value);
      case 'calldata':
        return value.startsWith('0x') && value.length >= 10;
      case 'description':
        return value.length >= 10;
      default:
        return true;
    }
  }, []);

  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidation(prev => ({
      ...prev,
      [field]: validateField(field, value)
    }));
  }, [validateField]);

  const handleEndpointChange = useCallback((endpoint: string, authType: number) => {
    setFormData(prev => ({
      ...prev,
      endpoint,
      type: authType
    }));
  }, []);

  const actionOptions = useMemo(() => 
    getEndpointActions(rootTokenAddress, tokenSymbol),
    [rootTokenAddress, tokenSymbol]
  );

  const handleActionChange = useCallback((actionId: string, params?: Record<string, any>) => {
    const action = actionOptions.find(a => a.id === actionId);
    if (!action) return;

    const callData = action.getCallData(params || {}, rootTokenAddress);
    setFormData(prev => ({
      ...prev,
      actionType: actionId,
      target: callData.target,
      calldata: callData.callData,
      value: callData.value,
      params
    }));
  }, [actionOptions, rootTokenAddress]);

  const getActionFields = useCallback(() => {
    const action = actionOptions.find(a => a.id === formData.actionType);
    return action ? action.fields : [];
  }, [actionOptions, formData.actionType]);

  const handleSubmit = async (onSubmit: (data: FormState) => Promise<void>) => {
    const newValidation = {
      target: validateField('target', formData.target),
      calldata: validateField('calldata', formData.calldata),
      description: validateField('description', formData.description)
    };
    setValidation(newValidation);

    if (!Object.values(newValidation).every(Boolean)) {
      throw new Error('Please check the form for errors');
    }

    setIsSubmitting(true);
    try {
      // First upload description to IPFS
    
        const metadata = {
          title: formData.description,
          description: formData.description,
        };



        const response = await fetch('/api/upload-to-ipfs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: metadata }),
        });

  
        if (!response.ok) throw new Error('Failed to upload metadata');
        const { cid } = await response.json();
        console.log("uploadDescription, cid:", cid);


      
      // Get call data from selected action
      const action = actionOptions.find(a => a.id === formData.actionType);
      if (!action) throw new Error('Invalid action type');
      
      const callData = action.getCallData(formData.params || {}, rootTokenAddress);

      // Submit with processed data
      await onSubmit({
        ...formData,
        ...callData,
        cid
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = useMemo(() => 
    Object.values(validation).every(Boolean) && 
    formData.description.length >= 10 &&
    (formData.actionType === 'customCall' ? 
      (ethers.isAddress(formData.target) && formData.calldata.startsWith('0x')) : 
      Object.values(formData.params || {}).every(Boolean)
    ),
    [validation, formData]
  );

  return {
    formData,
    validation,
    isSubmitting,
    handleInputChange,
    handleEndpointChange,
    handleActionChange,
    handleSubmit,
    getActionFields,
    isValid
  };
};