export const Colors = {
  light: {
    primary: '#8B4A2B',       // Warm Earth Brown
    secondary: '#C97A4A',     // Terracotta / Golden Clay (richer)
    accent: '#5D8A58',        // Accent Green
    background: '#F9F6F1',    // Cream Background
    card: '#FFFFFF',          // Cards Background
    text: '#2E2E2E',          // Primary Text
    textMuted: '#6E6E6E',     // Secondary Text
    success: '#7FA65A',       // Success Green
    warning: '#E8A63D',       // Warning Yellow/Orange
    border: '#EDEAE5',        // Soft border
    notification: '#C97A4A',
  },
  dark: {
    primary: '#C97A4A',       // Golden Clay (Lighter for contrast)
    secondary: '#8B4A2B',     // Warm Earth Brown
    accent: '#729E6C',        // Lighter Accent Green
    background: '#141210',    // Calming Dark Charcoal
    card: '#1F1B19',          // Deep warm card
    text: '#F3EFEB',          // Creamy Off-White Text
    textMuted: '#A59E96',     // Secondary Text Muted
    success: '#95BD70',
    warning: '#F7BA55',
    border: '#2D2724',
    notification: '#8B4A2B',
  }
} as const;

export type ColorTheme = typeof Colors.light;
