import { create } from 'zustand';
import { getAllPronunciations, addPronunciation as addPronunciationToDb, updatePronunciation, removePronunciation as removePronunciationFromDb } from '@/lib/pronunciations';

interface PronunciationState {
  dictionary: { [key: string]: string };
  loadPronunciations: () => Promise<void>;
  addPronunciation: (word: string, pronunciation: string) => Promise<void>;
  removePronunciation: (word: string) => Promise<void>;
  getPronunciation: (word: string) => string | null;
}

export const usePronunciationStore = create<PronunciationState>()((set, get) => ({
  dictionary: {},
  
  loadPronunciations: async () => {
    try {
      const pronunciations = await getAllPronunciations();
      const dict: { [key: string]: string } = {};
      pronunciations.forEach(p => {
        dict[p.word] = p.pronunciation;
      });
      set({ dictionary: dict });
    } catch (error) {
      console.error('Error loading pronunciations:', error);
    }
  },

  addPronunciation: async (word: string, pronunciation: string) => {
    try {
      await addPronunciationToDb(word, pronunciation);
      set((state) => ({
        dictionary: { ...state.dictionary, [word]: pronunciation }
      }));
    } catch (error) {
      console.error('Error adding pronunciation:', error);
      throw error;
    }
  },

  removePronunciation: async (word: string) => {
    try {
      await removePronunciationFromDb(word);
      set((state) => {
        const { [word]: _, ...rest } = state.dictionary;
        return { dictionary: rest };
      });
    } catch (error) {
      console.error('Error removing pronunciation:', error);
      throw error;
    }
  },

  getPronunciation: (word: string) => {
    const dictionary = get().dictionary;
    return dictionary[word] || null;
  },
})); 