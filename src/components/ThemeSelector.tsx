import React from 'react';
import { useThemeStore } from '@/store/theme';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';

const ThemeSelector = () => {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();

  const isDarkTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (!theme) return false;
    // Check if background colors are dark
    return theme.colors.background.from.toLowerCase().includes('0f') || 
           theme.colors.background.from.toLowerCase().includes('1a');
  };

  return (
    <div className="space-y-4">
      <Label>Theme Selection</Label>
      <RadioGroup
        value={currentTheme.id}
        onValueChange={setTheme}
        className="grid grid-cols-1 gap-4"
      >
        {availableThemes.map((theme) => {
          const isDark = isDarkTheme(theme.id);
          
          return (
            <Label
              key={theme.id}
              className={`relative flex cursor-pointer rounded-lg border p-4 ${
                isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-50'
              } ${
                currentTheme.id === theme.id 
                  ? 'border-blue-500 ring-2 ring-blue-500' 
                  : isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200'
              }`}
            >
              <RadioGroupItem value={theme.id} className="sr-only" />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div className="text-sm">
                    <p className={`font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {theme.name}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {/* Primary color preview */}
                      <div
                        className="w-8 h-8 rounded shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors.primary.from}, ${theme.colors.primary.to})`,
                        }}
                      />
                      {/* Secondary color preview */}
                      <div
                        className="w-8 h-8 rounded shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors.secondary.from}, ${theme.colors.secondary.to})`,
                        }}
                      />
                      {/* Accent color preview */}
                      <div
                        className="w-8 h-8 rounded shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors.accent.from}, ${theme.colors.accent.to})`,
                        }}
                      />
                      {/* Background color preview */}
                      <div
                        className="w-8 h-8 rounded shadow-sm"
                        style={{
                          background: `linear-gradient(to right, ${theme.colors.background.from}, ${theme.colors.background.to})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default ThemeSelector; 