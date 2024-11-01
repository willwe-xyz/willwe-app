// File: config/theme.ts
import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const fonts = {
  body: "'AdelleSans-Regular', -apple-system, system-ui, sans-serif",
  heading: "'AdelleSans-Semibold', -apple-system, system-ui, sans-serif",
};

const colors = {
  brand: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  },
};

const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
    },
    defaultProps: {
      colorScheme: 'brand',
      size: 'md',
    },
    variants: {
      solid: (props: { colorScheme: string }) => ({
        bg: `${props.colorScheme}.600`,
        color: 'white',
        _hover: {
          bg: `${props.colorScheme}.700`,
        },
      }),
      outline: (props: { colorScheme: string }) => ({
        borderColor: `${props.colorScheme}.600`,
        color: `${props.colorScheme}.600`,
        _hover: {
          bg: `${props.colorScheme}.50`,
        },
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'sm',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'lg',
      },
    },
  },
  Toast: {
    baseStyle: {
      container: {
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'gray.100',
      },
    },
  },
};

const styles = {
  global: {
    'html, body': {
      minHeight: '100vh',
      backgroundColor: 'gray.50',
      color: 'gray.900',
    },
    '*': {
      borderColor: 'gray.200',
      borderStyle: 'solid',
    },
    '::selection': {
      backgroundColor: 'brand.100',
      color: 'brand.900',
    },
  },
};

// Construct the complete theme
export const customTheme = extendTheme({
  config,
  fonts,
  colors,
  breakpoints,
  components,
  styles,
});