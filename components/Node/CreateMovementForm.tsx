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

  // ERC20 minimal ABI for transfer function
  const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)"
  ];

  // Multicall3 ABI for tryAggregate
  const MULTICALL3_ABI = [
    "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData, uint256 value)[] calls) returns (tuple(bool success, bytes returnData)[])"
  ];

  // Function signature for tryAggregate
  const TRY_AGGREGATE_SIG = "0x96b5a755"; // keccak256("tryAggregate(bool,(address,bytes,uint256)[])").slice(0, 10)

  interface CleanParams {
    to?: string;
    amount?: string;
    target?: string;
    calldata?: string;
    value?: string;
    [key: string]: string | undefined;
  }

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

  // Update the handleEndpointChange to allow movement type selection for new endpoints
  const handleEndpointChange = (endpoint: string) => {
    const selectedEndpoint = endpointOptions.find(opt => opt.value === endpoint);
    setFormData(prev => ({
      ...prev,
      endpoint,
      // Only set the type if it's an existing endpoint
      type: endpoint === 'new' ? prev.type : (selectedEndpoint ? selectedEndpoint.authType : prev.type),
      target: selectedEndpoint ? selectedEndpoint.value : ethers.ZeroAddress,
      calldata: '0x',
      value: '0'
    }));
    // Reset validations on endpoint change
    setValidation({
      target: true,
      calldata: true,
      description: true,
      value: true,
      to: true
    });
    setTouchedFields({});
  };

  // Allow movement type selection for new endpoints
  const canSelectMovementType = formData.endpoint === 'new';

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
  const handleInputChange = (field: keyof FormState, value: string | number) => {
    // Handle different field types appropriately
    let finalValue: string | number = value;
    
    if (field === 'expiryDays') {
      // Ensure it's a positive number
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      finalValue = Math.max(1, isNaN(numValue) ? 1 : numValue);
    } else if (field === 'value') {
      // Strip non-numeric characters and leading zeros for value field
      finalValue = String(value).replace(/[^\d.]/g, '').replace(/^0+(\d)/, '$1');
      if (finalValue === '') finalValue = '0';
    }

    setFormData(prev => ({
      ...prev,
      [field]: finalValue
    }));

    setTouchedFields(prev => ({ ...prev, [field]: true }));
    setValidation(prev => ({
      ...prev,
      [field]: validateFormField(field, String(finalValue))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const action = getActionOptions.find(a => a.id === formData.actionType);
      if (!action) throw new Error('Invalid action type');

      // Get target address based on action type
      let targetAddress;
      if (formData.actionType === 'tokenTransfer') {
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

      // Create clean parameters object
      const cleanParams: CleanParams = Object.entries(formData.params || {}).reduce((acc, [key, value]) => {
        let cleanValue: string | undefined;
        if (typeof value === 'object' && 'cid' in value) {
          cleanValue = value.cid;
        } else if (typeof value === 'number') {
          cleanValue = value.toString();
        } else if (key.toLowerCase().includes('address') || key === 'target' || key === 'to') {
          try {
            cleanValue = ethers.getAddress(value as string);
          } catch {
            cleanValue = value as string;
          }
        } else {
          cleanValue = value as string;
        }
        return { ...acc, [key]: cleanValue };
      }, {});

      // Structure the inner call first
      let innerCall;
      if (formData.actionType === 'tokenTransfer') {
        if (!cleanParams.to) {
          throw new Error('Recipient address is required for token transfer');
        }
        if (!cleanParams.amount) {
          throw new Error('Amount is required for token transfer');
        }

        try {
          // This will throw if the amount is invalid
          ethers.parseUnits(cleanParams.amount, 18);
        } catch (error) {
          throw new Error('Invalid amount format');
        }

        const tokenInterface = new ethers.Interface(ERC20_ABI);
        const transferCalldata = tokenInterface.encodeFunctionData('transfer', [
          cleanParams.to,
          ethers.parseUnits(cleanParams.amount, 18)
        ]);

        innerCall = {
          target: targetAddress,
          callData: transferCalldata,
          value: ethers.parseEther('0')
        };
      } else {
        try {
          if (formData.value) {
            // This will throw if the value is invalid
            ethers.parseEther(formData.value);
          }
        } catch (error) {
          throw new Error('Invalid value format');
        }

        innerCall = {
          target: targetAddress,
          callData: formData.calldata || '0x',
          value: ethers.parseEther(formData.value || '0')
        };
      }

      // Encode the tryAggregate call using the contract's interface
      const multicallInterface = new ethers.Interface(MULTICALL3_ABI);
      const encodedCalldata = multicallInterface.encodeFunctionData('tryAggregate', [
        true, // requireSuccess
        [innerCall]
      ]);

      // Prepare final submission data
      const submissionData = {
        ...formData,
        description: descriptionCid,
        target: targetAddress,
        calldata: encodedCalldata,
        calls: [innerCall] // Keep the original calls array for reference
      };

      // Validate submission data
      const validationResult = validateFormForSubmission(submissionData);
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

      await onSubmit(submissionData);
      onClose();
      toast({
        title: 'Movement created',
        description: 'Your movement has been created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error creating movement',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
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
          onChange={(e) => handleInputChange('type', parseInt(e.target.value))}
          isDisabled={!canSelectMovementType}
        >
          <option value={MovementType.AgentMajority}>Agent Majority</option>
          <option value={MovementType.EnergeticMajority}>Value Majority</option>
        </Select>
        <FormHelperText>
          {canSelectMovementType 
            ? 'Select the type of consensus required for this movement' 
            : 'Movement type is determined by the selected endpoint'}
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
          <Button 
            onClick={() => handleInputChange('expiryDays', Math.max(1, formData.expiryDays - 1))}
            aria-label="Decrease expiry days"
          >
            -
          </Button>
          <Input
            type="number"
            value={formData.expiryDays}
            onChange={(e) => handleInputChange('expiryDays', e.target.value)}
            onBlur={(e) => {
              const value = parseInt(e.target.value);
              handleInputChange('expiryDays', isNaN(value) ? 1 : Math.max(1, value));
            }}
            min={1}
            textAlign="center"
            width="80px"
          />
          <Button 
            onClick={() => handleInputChange('expiryDays', formData.expiryDays + 1)}
            aria-label="Increase expiry days"
          >
            +
          </Button>
        </HStack>
        <FormHelperText>Number of days until this movement expires</FormHelperText>
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