import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Code,
  useToast
} from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center" py={10} px={6}>
              <AlertTriangle size={50} className="mx-auto text-red-500" />
              <Heading as="h2" size="xl" mt={6} mb={2}>
                Something went wrong
              </Heading>
              <Text color="gray.500">
                We encountered an error while rendering this page.
              </Text>
            </Box>

            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Error:</Text>
              <Code display="block" whiteSpace="pre-wrap" p={4}>
                {this.state.error?.toString()}
              </Code>
            </Box>

            {this.state.errorInfo && (
              <Box bg="gray.50" p={4} borderRadius="md">
                <Text fontWeight="bold" mb={2}>Component Stack:</Text>
                <Code display="block" whiteSpace="pre-wrap" p={4}>
                  {this.state.errorInfo.componentStack}
                </Code>
              </Box>
            )}

            <Button 
              colorScheme="purple"
              onClick={this.handleReset}
              alignSelf="center"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              alignSelf="center"
            >
              Return to Home
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}