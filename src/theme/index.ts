import { Colors } from '../constants/Colors';
import { DefaultTheme as ExpoDefaultTheme, DarkTheme as ExpoDarkTheme } from '@react-navigation/native';

export const LightTheme = {
  ...ExpoDefaultTheme,
  dark: false,
  colors: {
    ...ExpoDefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.notification,
  },
};

export const DarkTheme = {
  ...ExpoDarkTheme,
  dark: true,
  colors: {
    ...ExpoDarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.notification,
  },
};
