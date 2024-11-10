import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Link,
  useClipboard,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { formatAddress } from '../../utils/formatting';

interface MembersListProps {
  members: string[];
  selectedTokenColor: string;
}

export const MembersList: React.FC<MembersListProps> = ({ 
  members, 
  selectedTokenColor 
}) => {
  const { hasCopied, onCopy } = useClipboard('');

  if (!members.length) {
    return (
      <Box>
        <Heading size="md" mb={4}>Members</Heading>
        <Text color="gray.500">No members found</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Members ({members.length})</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Address</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {members.map((address, index) => (
            <Tr key={`${address}-${index}`}>
              <Td>
                <Link 
                  href={`https://etherscan.io/address/${address}`}
                  isExternal
                  color={selectedTokenColor}
                >
                  {formatAddress(address)}
                </Link>
              </Td>
              <Td>
                <Tooltip 
                  label={hasCopied ? "Copied!" : "Copy address"}
                  placement="top"
                >
                  <IconButton
                    aria-label="Copy address"
                    icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => onCopy(address)}
                  />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};