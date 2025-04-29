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
  HStack,
  Box,
  useColorModeValue,
  Divider,
  Badge,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { MovementType } from '../../types/chainData';
import { getEndpointActions } from '../../config/endpointActions';
import { nodeIdToAddress } from '../../utils/formatters';
import { Info, Plus } from 'lucide-react';

interface CreateMovementFormProps {
  nodeData: any;
  onSubmit: (data: FormState) => Promise<void>;
  onClose: () => void;
  selectedTokenColor?: string;
}

const CreateMovementForm: React.FC<CreateMovementFormProps> = ({ 
  nodeData,
  onSubmit,
  onClose,
  selectedTokenColor = '#7C3AED' // Default to brand purple if no color provided
}) => {
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  
  // Initialize validation based on action type
  const [validation, setValidation] = useState<MovementFormValidation>({
    target: true,
    calldata: true,
    description: true,
    value: true,
    to: true
  });
  
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
    console.log('Node Data:', nodeData); // Debug log
    console.log('Movement Endpoints:', nodeData?.movementEndpoints); // Debug log
    
    // Always start with the "Create New Endpoint" option
    const options = [{
      value: 'new',
      label: 'Create New Endpoint',
      authType: formData.type || MovementType.AgentMajority,
      balance: '0'
    }];
    
    // Add existing endpoints if available
    if (nodeData?.movementEndpoints) {
      nodeData.movementEndpoints.forEach((endpoint: string) => {
        if (!endpoint) return; // Skip if endpoint is empty/null
        
        options.push({
          value: endpoint,
          label: `${endpoint.slice(0, 6)}...${endpoint.slice(-4)}`,
          authType: MovementType.AgentMajority, // Endpoints created through Execution.sol are always AgentMajority
          balance: nodeData.basicInfo?.[2] || '0'
        });
      });
    }
    
    console.log('Final options:', options); // Debug log
    return options;
  }, [nodeData?.movementEndpoints, nodeData?.basicInfo, formData.type]);

  const handleEndpointChange = (endpoint: string) => {
    const selectedEndpoint = endpointOptions.find(opt => opt.value === endpoint);
    
    if (!selectedEndpoint) return;
    
    setFormData(prev => ({
      ...prev,
      endpoint,
      // Lock movement type to the endpoint's auth type for existing endpoints
      type: endpoint === 'new' ? prev.type : selectedEndpoint.authType,
      // Set target to the endpoint address for existing endpoints
      target: endpoint === 'new' ? ethers.ZeroAddress : endpoint,
      calldata: '0x',
      value: '0'
    }));
    
    setValidation({
      target: true,
      calldata: true,
      description: true,
      value: true,
      to: true
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
          // Convert the recipient address to proper format
          const recipient = ethers.getAddress(cleanParams.to);
          
          // This will throw if the amount is invalid
          const amount = ethers.parseUnits(cleanParams.amount, 18);
          
          // Create ERC20 interface and encode transfer call
          const tokenInterface = new ethers.Interface([
            "function transfer(address to, uint256 amount) returns (bool)"
          ]);
          
          const transferCalldata = tokenInterface.encodeFunctionData('transfer', [
            recipient,
            amount
          ]);

          console.log('Token transfer parameters:', {
            to: recipient,
            amount: amount.toString(),
            encodedCalldata: transferCalldata
          });

          innerCall = {
            target: targetAddress,
            callData: transferCalldata,
            value: ethers.parseEther('0').toString() // Ensure value is string
          };
        } catch (error: unknown) {
          console.error('Error encoding token transfer:', error);
          throw new Error('Invalid token transfer parameters: ' + (error instanceof Error ? error.message : String(error)));
        }
      } else {
        try {
          // Parse and validate value if provided
          const value = formData.value ? ethers.parseEther(formData.value) : ethers.parseEther('0');
          
          innerCall = {
            target: targetAddress,
            callData: formData.calldata || '0x',
            value: value.toString() // Ensure value is string
          };
        } catch (error) {
          throw new Error('Invalid value format');
        }
      }

      // Encode the tryAggregate call
      const multicallInterface = new ethers.Interface([
        "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData, uint256 value)[] calls) returns (tuple(bool success, bytes returnData)[])"
      ]);

      // Validate the inner call
      if (!ethers.isAddress(innerCall.target)) {
        throw new Error('Invalid target address');
      }
      if (!innerCall.callData.startsWith('0x')) {
        throw new Error('Invalid calldata format');
      }

      console.log('Inner call to be encoded:', {
        target: innerCall.target,
        callData: innerCall.callData,
        value: innerCall.value
      });

      const encodedCalldata = multicallInterface.encodeFunctionData('tryAggregate', [
        true, // requireSuccess
        [innerCall]
      ]);

      console.log('Encoded tryAggregate calldata:', encodedCalldata);

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      toast({
        title: 'Error creating movement',
        description: errorMessage,
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
          value={(() => {
            const fieldValue = formData.params?.[field.name];
            if (typeof fieldValue === 'object' && fieldValue !== null && 'cid' in fieldValue) {
              return (fieldValue as {cid: string}).cid;
            }
            return (fieldValue as string | number) || '';
          })()}
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

  // Create a properly typed version of the endpoint options
  type EndpointOption = {
    value: string;
    label: string;
    authType: number;
    balance: string;
  };

  return (
    <VStack 
      spacing={6} 
      align="stretch"
      p={4}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Box>
        <FormControl>
          <FormLabel color={labelColor} display="flex" alignItems="center" gap={2}>
            Execution Endpoint
            <Tooltip 
              label={
                formData.endpoint === 'new' 
                  ? 'Create a new execution endpoint for this movement'
                  : 'Select an existing endpoint - movement type will match the endpoint\'s authorization type'
              }
              placement="top"
            >
              <Icon as={Info} boxSize={4} color="gray.400" />
            </Tooltip>
          </FormLabel>
          <Select
            value={formData.endpoint}
            onChange={(e) => handleEndpointChange(e.target.value)}
            borderColor={borderColor}
            _hover={{ borderColor: selectedTokenColor }}
            _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
          >
            {endpointOptions.map((option) => {
              console.log('Rendering option:', option); // Debug log
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.value !== 'new' && (
                    ` (${option.authType === MovementType.AgentMajority ? 'Agent' : 'Value'})`
                  )}
                </option>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      <Divider borderColor={borderColor} />

      <Box>
        <FormControl>
          <FormLabel color={labelColor} display="flex" alignItems="center" gap={2}>
            Movement Type
            <Tooltip label="Select the type of consensus required for this movement">
              <Icon as={Info} boxSize={4} color="gray.400" />
            </Tooltip>
          </FormLabel>
          <Select
            value={formData.type}
            onChange={(e) => handleInputChange('type', parseInt(e.target.value))}
            isDisabled={formData.endpoint !== 'new'}
            borderColor={borderColor}
            _hover={{ borderColor: selectedTokenColor }}
            _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
          >
            <option value={MovementType.AgentMajority}>Agent Majority</option>
            <option value={MovementType.EnergeticMajority}>Value Majority</option>
          </Select>
          <FormHelperText color={labelColor}>
            {formData.endpoint !== 'new' 
              ? 'Movement type is determined by the selected endpoint'
              : 'Select the type of consensus required for this movement'}
          </FormHelperText>
        </FormControl>
      </Box>

      <Divider borderColor={borderColor} />

      <Box>
        <FormControl isInvalid={touchedFields.description && !validation.description}>
          <FormLabel color={labelColor}>Description</FormLabel>
          <Textarea
            value={typeof formData.description === 'string' ? formData.description : JSON.stringify(formData.description)}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onBlur={() => setTouchedFields(prev => ({ ...prev, description: true }))}
            placeholder="Describe the purpose of this movement..."
            minH="100px"
            isDisabled={isUploading}
            borderColor={borderColor}
            _hover={{ borderColor: selectedTokenColor }}
            _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
          />
          <FormErrorMessage>
            {error || 'Description must be at least 10 characters long'}
          </FormErrorMessage>
        </FormControl>
      </Box>

      <Box>
        <FormControl>
          <FormLabel color={labelColor}>Expires In (Days)</FormLabel>
          <HStack>
            <Button 
              onClick={() => handleInputChange('expiryDays', Math.max(1, formData.expiryDays - 1))}
              aria-label="Decrease expiry days"
              colorScheme="gray"
              variant="outline"
              size="sm"
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
              borderColor={borderColor}
              _hover={{ borderColor: selectedTokenColor }}
              _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
            />
            <Button 
              onClick={() => handleInputChange('expiryDays', formData.expiryDays + 1)}
              aria-label="Increase expiry days"
              colorScheme="gray"
              variant="outline"
              size="sm"
            >
              +
            </Button>
          </HStack>
          <FormHelperText color={labelColor}>
            Number of days until this movement expires
          </FormHelperText>
        </FormControl>
      </Box>

      <Divider borderColor={borderColor} />

      <Box>
        <FormControl isRequired>
          <FormLabel color={labelColor}>Action Type</FormLabel>
          <Select
            value={formData.actionType || 'customCall'}
            onChange={(e) => handleActionChange(e.target.value)}
            borderColor={borderColor}
            _hover={{ borderColor: selectedTokenColor }}
            _focus={{ borderColor: selectedTokenColor, boxShadow: `0 0 0 1px ${selectedTokenColor}` }}
          >
            {getActionOptions.map(action => (
              <option key={action.id} value={action.id}>
                {action.label}
              </option>
            ))}
          </Select>
          <FormHelperText color={labelColor}>
            {getActionOptions.find(a => a.id === formData.actionType)?.description}
          </FormHelperText>
        </FormControl>
      </Box>

      {/* Dynamic fields based on selected action */}
      {renderDynamicFields()}

      <Button
        colorScheme="purple"
        onClick={handleSubmit}
        width="100%"
        isLoading={isSubmitting || isUploading}
        loadingText={isUploading ? "Uploading Description..." : "Creating Movement..."}
        isDisabled={!Object.values(validation).every(Boolean)}
        bg={selectedTokenColor}
        _hover={{ bg: `${selectedTokenColor}90` }}
        _active={{ bg: `${selectedTokenColor}80` }}
      >
        Create Movement
      </Button>

      {(isSubmitting || isUploading) && (
        <Progress 
          size="xs" 
          isIndeterminate 
          width="100%" 
          colorScheme="purple"
          bg={`${selectedTokenColor}20`}
        />
      )}
    </VStack>
  );
};

CreateMovementForm.displayName = 'CreateMovementForm';

export default CreateMovementForm;