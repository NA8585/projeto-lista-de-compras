export const palettes = {
  fresh: {
    light: {
      primary: '#007AFF',
      success: '#34C759',
      danger: '#FF3B30',
      warning: '#FF9500',
      background: '#F2F2F7',
      surface: '#FFFFFF',
      text: '#1C1C1E',
      muted: '#8E8E93',
      border: '#E5E5EA',
      control: '#F2F2F7',
      highlight: '#E3F2FD',
      separator: '#C7C7CC'
    },
    dark: {
      primary: '#0A84FF',
      success: '#30D158',
      danger: '#FF453A',
      warning: '#FF9F0A',
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      muted: '#8E8E93',
      border: '#3A3A3C',
      control: '#48484A',
      highlight: '#0A84FF20',
      separator: '#636366'
    }
  },
  tropical: {
    light: {
      primary: '#00B894',
      success: '#26de81',
      danger: '#ff6b6b',
      warning: '#fdcb6e',
      background: '#E0F2F1',
      surface: '#FFFFFF',
      text: '#004D40',
      muted: '#4F4F4F',
      border: '#B2DFDB',
      control: '#C8E6C9',
      highlight: '#B2EBF2',
      separator: '#A7A7A7'
    },
    dark: {
      primary: '#1dd1a1',
      success: '#10ac84',
      danger: '#ee5253',
      warning: '#feca57',
      background: '#004D40',
      surface: '#005B4F',
      text: '#FFFFFF',
      muted: '#B0BEC5',
      border: '#004D40',
      control: '#00695C',
      highlight: '#004D40',
      separator: '#607D8B'
    }
  },
  berry: {
    light: {
      primary: '#AF52DE',
      success: '#34C759',
      danger: '#FF375F',
      warning: '#FF9500',
      background: '#F8EAF9',
      surface: '#FFFFFF',
      text: '#1D1331',
      muted: '#6E6E73',
      border: '#E5E5EA',
      control: '#F3E5F5',
      highlight: '#F2E1F9',
      separator: '#C7C7CC'
    },
    dark: {
      primary: '#BF5AF2',
      success: '#30D158',
      danger: '#FF375F',
      warning: '#FF9F0A',
      background: '#1D1331',
      surface: '#2C1A43',
      text: '#FFFFFF',
      muted: '#A284B7',
      border: '#3A3A3C',
      control: '#3C2E56',
      highlight: '#2C1A43',
      separator: '#636366'
    }
  },
  orchard: {
    light: {
      primary: '#5AC8FA',
      success: '#34C759',
      danger: '#FF3B30',
      warning: '#FF9500',
      background: '#EFFBFF',
      surface: '#FFFFFF',
      text: '#1C1C1E',
      muted: '#8E8E93',
      border: '#E5E5EA',
      control: '#DFF6FD',
      highlight: '#E0F7FF',
      separator: '#C7C7CC'
    },
    dark: {
      primary: '#64D2FF',
      success: '#32D74B',
      danger: '#FF453A',
      warning: '#FF9F0A',
      background: '#00141E',
      surface: '#0A1F29',
      text: '#FFFFFF',
      muted: '#8E8E93',
      border: '#3A3A3C',
      control: '#123645',
      highlight: '#0A1F29',
      separator: '#636366'
    }
  }
} as const;

export type PaletteName = keyof typeof palettes;

export const colors = palettes.fresh.light;
