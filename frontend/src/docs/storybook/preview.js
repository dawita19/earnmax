import { themes } from '@storybook/theming';
import { ThemeProvider, Global, css } from '@emotion/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from '../src/styles/theme';
import { GlobalStyles } from '../src/styles/global';

// Initialize MSW
initialize({
  onUnhandledRequest: 'bypass',
  serviceWorker: {
    url: `${process.env.PUBLIC_URL}/mockServiceWorker.js`,
  },
});

// Create react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    sort: 'requiredFirst',
  },
  darkMode: {
    current: 'light',
    dark: {
      ...themes.dark,
      appBg: '#1E1E1E',
      brandTitle: 'EarnMax Elite (Dark)',
    },
    light: {
      ...themes.normal,
      appBg: '#FFFFFF',
      brandTitle: 'EarnMax Elite',
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#FFFFFF' },
      { name: 'dark', value: '#1E1E1E' },
      { name: 'vip0', value: '#F5F5F5' },
      { name: 'vip1', value: '#E3F2FD' },
      { name: 'vip8', value: '#0D47A1' },
    ],
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      tablet: {
        name: 'Tablet',
        styles: {
          width: '768px',
          height: '1024px',
        },
      },
      desktop: {
        name: 'Desktop',
        styles: {
          width: '1440px',
          height: '900px',
        },
      },
    },
  },
  chromatic: {
    modes: {
      mobile: { viewport: 'mobile' },
      tablet: { viewport: 'tablet' },
      desktop: { viewport: 'desktop' },
    },
  },
};

export const decorators = [
  (Story, context) => {
    const isDarkMode = context.globals.backgrounds?.value === '#1E1E1E';
    
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={isDarkMode ? theme.dark : theme.light}>
          <Global styles={GlobalStyles} />
          <Story />
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </ThemeProvider>
      </QueryClientProvider>
    );
  },
];

export const loaders = [mswLoader];