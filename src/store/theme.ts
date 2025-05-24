import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: {
      from: string;
      to: string;
    };
    secondary: {
      from: string;
      to: string;
    };
    accent: {
      from: string;
      to: string;
    };
    background: {
      from: string;
      via: string;
      to: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
}

const themes: Theme[] = [
  {
    id: 'theme1',
    name: 'Ocean Breeze',
    colors: {
      primary: {
        from: '#007BFF',
        to: '#00C896',
      },
      secondary: {
        from: '#D0F1FF',
        to: '#E0FFF6',
      },
      accent: {
        from: '#1DA1F2',
        to: '#17C1B3',
      },
      background: {
        from: '#D0F1FF',
        via: '#E0FFF6',
        to: '#D0F1FF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#555555',
      },
    },
  },
  {
    id: 'theme2',
    name: 'Nebula',
    colors: {
      primary: {
        from: '#6366F1',
        to: '#8B5CF6',
      },
      secondary: {
        from: 'rgba(255, 255, 255, 0.02)',
        to: 'rgba(255, 255, 255, 0.05)',
      },
      accent: {
        from: '#EC4899',
        to: '#8B5CF6',
      },
      background: {
        from: '#0A0A0B',
        via: '#0F0F10',
        to: '#0A0A0B',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.9)',
        secondary: 'rgba(255, 255, 255, 0.4)',
      },
    },
  },
];

interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  setTheme: (themeId: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentTheme: themes[0], // Default to first theme
      availableThemes: themes,
      setTheme: (themeId: string) => {
        const theme = themes.find((t) => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
); 