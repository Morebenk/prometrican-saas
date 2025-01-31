import { writable } from 'svelte/store';
import type { Quiz, QuizAttempt } from '$lib/types';

export interface QuizState {
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  selectedSubject: string | null;
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  currentQuiz: null,
  currentAttempt: null,
  selectedSubject: null,
  selectedCategory: null,
  loading: false,
  error: null
};

function createQuizStore() {
  const { subscribe, set, update } = writable<QuizState>(initialState);

  return {
    subscribe,
    setCurrentQuiz: (quiz: Quiz) => update(state => ({ ...state, currentQuiz: quiz })),
    setCurrentAttempt: (attempt: QuizAttempt) => update(state => ({ ...state, currentAttempt: attempt })),
    setSelectedSubject: (subjectId: string | null) => 
      update(state => ({ 
        ...state, 
        selectedSubject: subjectId,
        selectedCategory: null, // Reset category when subject changes
        currentQuiz: null // Reset quiz when subject changes
      })),
    setSelectedCategory: (categoryId: string | null) =>
      update(state => ({
        ...state,
        selectedCategory: categoryId,
        currentQuiz: null // Reset quiz when category changes
      })),
    setLoading: (isLoading: boolean) => update(state => ({ ...state, loading: isLoading })),
    setError: (error: string | null) => update(state => ({ ...state, error })),
    reset: () => set(initialState)
  };
}

export const quizStore = createQuizStore();