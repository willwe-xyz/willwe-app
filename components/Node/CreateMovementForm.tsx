import { DEFAULT_FORM_STATE, FormState, MovementFormValidation, validateFormField, validateFormForSubmission } from '../../types/movements';
import React, { useState, useMemo, memo } from 'react';
import { ethers } from 'ethers';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  FormHelperText,
  FormErrorMessage,
  useToast,
  Progress,
  HStack
} from '@chakra-ui/react';
import { MovementType } from '../../types/chainData';
import { getEndpointActions } from '../../config/endpointActions';
import { nodeIdToAddress } from '../../utils/formatters';

interface CreateMovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
}

const CreateMovementForm: React.FC<CreateMovementFormProps> = ({ 
  nodeData,
  onSubmit,
  onClose 
}) => {
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize validation based on action type
  const [validation, setValidation] = useState<MovementFormValidation>({
    target: true,
    calldata: true,
    description: true,
    value: true,
    to: true
  });
  // const { description, isUploading, error, uploadDescription } = useMovementDescription();
  const toast = useToast();


  const endpointOptions = useMemo(() => {
    if (!nodeData?.movementEndpoints?.length) return [];
    
    return nodeData.movementEndpoints.map(endpoint => ({
      value: endpoint,
      label: `${endpoint.slice(0, 6)}...${endpoint.slice(-4)}`,
      authType: nodeData.childrenNodes.includes(endpoint) ? 
        MovementType.AgentMajority : 
        MovementType.EnergeticMajority,
      balance: nodeData.basicInfo[2] // Use balance anchor
    }));
  }, [nodeData?.movementEndpoints, nodeData?.childrenNodes, nodeData?.basicInfo]);

  // Update the handleEndpointChange to also set safe defaults
  const handleEndpointChange = (endpoint: string) => {
    const selectedEndpoint = endpointOptions.find(opt => opt.value === endpoint);
    setFormData(prev => ({
      ...prev,
      endpoint,
      type: selectedEndpoint ? selectedEndpoint.authType : prev.type,
      target: selectedEndpoint ? selectedEndpoint.value : ethers.ZeroAddress,
      calldata: '0x',
      value: '0'
    }));
    // Reset validations on endpoint change
    setValidation({
      target: true,
      calldata: true,
      description: true,
      value: true
    });
    setTouchedFields({});
  };

  const isValidHexString = (value: string) => /^0x[0-9a-fA-F]*$/.test(value);

  const validateField = (name: keyof FormState, value: string) => {
    if (!value && name === 'value') return true; // Empty value is valid, will default to 0
    if (!value) return true; // Don't show validation errors for empty fields until submit
    
    switch (name) {
      case 'target':
        return isValidHexString(value);
      case 'calldata':
        return isValidHexString(value) && value.length >= 10; // At least function signature
      case 'value':
        return !isNaN(Number(value));
      case 'description':
        return value.length >= 10;
      default:
        return true;
    }
  };

  // Update to handle empty values properly
  const handleInputChange = (field: keyof FormState, value: string) => {
    // Ensure value is treated as string
    let finalValue = value;
    if (field === 'value') {
      // Strip non-numeric characters and leading zeros for value field
      finalValue = value.replace(/[^\d.]/g, '').replace(/^0+(\d)/, '$1');
      if (finalValue === '') finalValue = '0';
    }

    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));

    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setValidation(prev => ({
      ...prev,
      [field]: validateFormField(field, finalValue)
    }));
  };

  const handleSubmit = async () => {
    const isTokenTransfer = formData.actionType === 'tokenTransfer';
    
    try {
      const action = getActionOptions.find(a => a.id === formData.actionType);
      if (!action) throw new Error('Invalid action type');
  
      // Get target address based on action type
      let targetAddress;
      if (isTokenTransfer) {
        targetAddress = nodeData?.rootPath?.[0];
        targetAddress = nodeIdToAddress(targetAddress); 
      } else {
        targetAddress = formData.target || formData.params?.target;
      }
  
      // Validate target address
      if (!targetAddress || !ethers.isAddress(targetAddress)) {
        throw new Error('Target address is required');
      }
  
      // Extract CID from description if it's an object
      const descriptionCid = typeof formData.description === 'object' && 'cid' in formData.description
        ? formData.description.cid
        : formData.description;
  
      // Create clean parameters object without CID objects
      const cleanParams = Object.entries(formData.params || {}).reduce((acc, [key, value]) => {
        let cleanValue;
        
        // Convert CID objects to strings
        if (typeof value === 'object' && 'cid' in value) {
          cleanValue = value.cid;
        }
        // Convert numbers to strings
        else if (typeof value === 'number') {
          cleanValue = value.toString();
        }
        // Handle addresses
        else if (key.toLowerCase().includes('address') || key === 'target' || key === 'to') {
          try {
            cleanValue = ethers.getAddress(value as string);
          } catch {
            cleanValue = value;
          }
        }
        // Use value as is for other cases
        else {
          cleanValue = value;
        }
  
        return { ...acc, [key]: cleanValue };
      }, {});
  
      // Add required parameters
      const formattedParams = {
        ...cleanParams,
        value: formData.value || '0',
        target: targetAddress,
        description: descriptionCid // Use string CID instead of object
      };
  
      // Get call data with formatted parameters
      const callData = action.getCallData(formattedParams, nodeData.rootPath[0]);
  
      // Prepare final submission data
      const submissionData = {
        ...formData,
        description: descriptionCid, // Use string CID
        value: formData.value || '0',
        target: targetAddress,
        callData: callData.callData || '0x',
        params: formattedParams // Use cleaned parameters
      };
  
      // Validate submission data
      const validationResult = {
        ...validateFormForSubmission({
          ...submissionData,
          description: descriptionCid // Ensure validation uses string CID
        }),
        target: true
      };
  
      setValidation(prev => ({
        ...prev,
        ...validationResult
      }));
  
      if (!Object.values(validationResult).every(Boolean)) {
        toast({
          title: 'Validation Error',
          description: 'Please check the form for errors',
          status: 'error',
          duration: 3000
        });
        return;
      }
  
      setIsSubmitting(true);
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create movement',
        status: 'error',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionOptions = useMemo(() => {
    let rootTokenAddress;
    try {
      rootTokenAddress = nodeData?.rootPath?.[0] ? 
        nodeIdToAddress(nodeData.rootPath[0]) : 
        ethers.ZeroAddress;
    } catch (error) {
      console.error('Error converting node ID:', error);
      rootTokenAddress = ethers.ZeroAddress;
    }
    return getEndpointActions(rootTokenAddress, 'tokens');
  }, [nodeData?.rootPath]);

  // Ensure we reset validation states when switching between token transfer and custom call
  const handleActionChange = (actionId: string) => {
    const action = getActionOptions.find(a => a.id === actionId);
    if (action) {
      const defaultTarget = actionId === 'tokenTransfer' ? 
        nodeData?.rootPath?.[0] : 
        ethers.ZeroAddress; // Use ZeroAddress as fallback
  
      setFormData(prev => ({
        ...prev,
        actionType: actionId,
        target: defaultTarget,
        calldata: '0x',
        value: '0',
        params: {
          to: '',
          amount: '0',
          target: defaultTarget, // Initialize target in params as well
          calldata: '0x',
          value: '0'
        }
      }));
      
      // Reset validation state based on action type
      setValidation({
        target: true,
        calldata: true,
        description: true,
        value: true,
        to: true
      });
      
      setTouchedFields({});
    }
  };

  // Update the form controls to only validate on touch or submit
  const renderDynamicFields = () => {
    const action = getActionOptions.find(a => a.id === formData.actionType);
    if (!action) return null;

    return action.fields
      // For token transfers, skip any 'target' field since it's handled automatically
      .filter(field => !(formData.actionType === 'tokenTransfer' && field.name === 'target'))
      .map(field => (
      <FormControl 
        key={field.name} 
        isRequired={field.required}
        isInvalid={touchedFields[field.name] && !validation[field.name]}
      >
        <FormLabel>{field.label}</FormLabel>
        <Input
          type={field.type || 'text'}
          value={formData.params?.[field.name] || ''}
          onChange={(e) => {
            const value = e.target.value;
            setFormData(prev => ({
              ...prev,
              params: {
                ...prev.params,
                [field.name]: value
              }
            }));
            if (touchedFields[field.name]) {
              setValidation(prev => ({
                ...prev,
                [field.name]: validateFormField(field.name, value)
              }));
            }
          }}
          onBlur={() => {
            setTouchedFields(prev => ({ ...prev, [field.name]: true }));
            const value = formData.params?.[field.name] || '';
            setValidation(prev => ({
              ...prev,
              [field.name]: validateFormField(field.name, value)
            }));
          }}
          placeholder={field.placeholder}
        />
        {touchedFields[field.name] && !validation[field.name] && (
          <FormErrorMessage>
            {field.type === 'number' 
              ? 'Please enter a valid number' 
              : field.name === 'to' 
                ? 'Please enter a valid Ethereum address'
                : 'Please enter a valid value'}
          </FormErrorMessage>
        )}
      </FormControl>
    ));
  };

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Execution Endpoint</FormLabel>
        <Select
          value={formData.endpoint}
          onChange={(e) => handleEndpointChange(e.target.value)}
        >
          <option value="new">Create New Execution Endpoint</option>
          {endpointOptions.map(({ value, label, authType, balance }) => (
            <option key={value} value={value}>
              {label} {authType === MovementType.AgentMajority ? '(Agent)' : '(Value)'} - {ethers.formatEther(balance || '0')} tokens
            </option>
          ))}
        </Select>
        <FormHelperText>
          {formData.endpoint === 'new' 
            ? 'A new execution endpoint will be created for this movement'
            : 'Using existing endpoint with matching authorization type'}
        </FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Movement Type</FormLabel>
        <Select
          value={formData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          isDisabled={formData.endpoint !== 'new'}
        >
          <option value={MovementType.AgentMajority}>Agent Majority</option>
          <option value={MovementType.EnergeticMajority}>Value Majority</option>
        </Select>
        <FormHelperText>
          {formData.endpoint !== 'new' && 'Movement type must match endpoint authorization type'}
        </FormHelperText>
      </FormControl>

      <FormControl isInvalid={touchedFields.description && !validation.description}>
        <FormLabel>Description</FormLabel>
        <Textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={() => setTouchedFields(prev => ({ ...prev, description: true }))}
          placeholder="Describe the purpose of this movement..."
          minH="100px"
          isDisabled={isUploading}
        />
        <FormErrorMessage>
          {error || 'Description must be at least 10 characters long'}
        </FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Expires In (Days)</FormLabel>
        <HStack>
          <Button onClick={() => handleInputChange('expiryDays', String(Math.max(1, formData.expiryDays - 1)))}>
            -
          </Button>
          <Input
            type="number"
            value={formData.expiryDays}
            onChange={(e) => handleInputChange('expiryDays', e.target.value)}
            min={1}
            textAlign="center"
          />
          <Button onClick={() => handleInputChange('expiryDays', String(formData.expiryDays + 1))}>
            +
          </Button>
        </HStack>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Action Type</FormLabel>
        <Select
          value={formData.actionType || 'customCall'}
          onChange={(e) => handleActionChange(e.target.value)}
        >
          {getActionOptions.map(action => (
            <option key={action.id} value={action.id}>
              {action.label}
            </option>
          ))}
        </Select>
        <FormHelperText>
          {getActionOptions.find(a => a.id === formData.actionType)?.description}
        </FormHelperText>
      </FormControl>

      {/* Dynamic fields based on selected action */}
      {renderDynamicFields()}

      <Button
        colorScheme="purple"
        onClick={handleSubmit}
        width="100%"
        isLoading={isSubmitting || isUploading}
        loadingText={isUploading ? "Uploading Description..." : "Creating Movement..."}
        isDisabled={!Object.values(validation).every(Boolean)}
      >
        Create Movement
      </Button>

      {(isSubmitting || isUploading) && (
        <Progress size="xs" isIndeterminate width="100%" colorScheme="purple" />
      )}
    </VStack>
  );
};

CreateMovementForm.displayName = 'CreateMovementForm';

export default CreateMovementForm;