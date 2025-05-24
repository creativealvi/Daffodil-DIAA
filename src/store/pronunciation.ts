import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PronunciationState {
  dictionary: { [key: string]: string };
  addPronunciation: (word: string, pronunciation: string) => void;
  removePronunciation: (word: string) => void;
  getPronunciation: (word: string) => string | null;
}

export const usePronunciationStore = create<PronunciationState>()(
  persist(
    (set, get) => ({
      dictionary: {
        'DIAA': 'diiaa',
      },
      addPronunciation: (word: string, pronunciation: string) => 
        set((state) => ({
          dictionary: { ...state.dictionary, [word]: pronunciation }
        })),
      removePronunciation: (word: string) =>
        set((state) => {
          const { [word]: _, ...rest } = state.dictionary;
          return { dictionary: rest };
        }),
      getPronunciation: (word: string) => {
        const dictionary = get().dictionary;
        return dictionary[word] || null;
      },
    }),
    {
      name: 'pronunciation-storage',
    }
  )
); 