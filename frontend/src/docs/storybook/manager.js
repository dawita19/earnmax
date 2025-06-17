import { addons } from '@storybook/addons';
import { create } from '@storybook/theming';
import logo from './public/logo.svg';

const theme = create({
  base: 'light',
  brandTitle: 'EarnMax Elite Design System',
  brandUrl: 'https://earnmaxelite.com',
  brandImage: logo,
  brandTarget: '_self',
  
  colorPrimary: '#4F46E5',
  colorSecondary: '#7C3AED',
  
  // UI
  appBg: '#FFFFFF',
  appContentBg: '#F9FAFB',
  appBorderColor: '#E5E7EB',
  appBorderRadius: 8,
  
  // Typography
  fontBase: '"Inter", sans-serif',
  fontCode: 'monospace',
  
  // Text colors
  textColor: '#111827',
  textInverseColor: '#FFFFFF',
  textMutedColor: '#6B7280',
  
  // Toolbar default and active colors
  barTextColor: '#6B7280',
  barSelectedColor: '#4F46E5',
  barBg: '#FFFFFF',
  
  // Form colors
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
  inputTextColor: '#111827',
  inputBorderRadius: 4,
  
  // Grid
  gridCellSize: 8,
});

addons.setConfig({
  theme,
  panelPosition: 'right',
  sidebar: {
    showRoots: true,
    collapsedRoots: ['other'],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
    'storybook/background': { hidden: false },
    'storybook/viewport': { hidden: false },
    'storybook/outline': { hidden: false },
  },
  enableShortcuts: true,
  showToolbar: true,
  selectedPanel: 'controls',
});