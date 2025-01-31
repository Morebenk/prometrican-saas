import { writable, get } from 'svelte/store';
import type { Quiz, QuizAttempt } from '$lib/types';

export type QuizStatus = 'not-started' | 'in-progress' | 'completed';

export interface QuizWithStatus extends Quiz {
  status: QuizStatus;
  progress: number;
  score: number | null;
  attempt?: QuizAttempt;
  lastQuestionId?: string;
}

export interface QuizState {
  currentQuiz: QuizWithStatus | null;
  selectedSubject: string | null;
  selectedCategory: string | null;
  quizzes: QuizWithStatus[];
  loading: boolean;
  error: string | null;
}

// Local storage keys
const STORAGE_KEYS = {
  STATE: 'quiz_store_state',
  CACHE_TIMESTAMP: 'quiz_store_cache_timestamp',
  SUBJECT_CACHE: 'quiz_subject_cache_',
  CATEGORY_CACHE: 'quiz_category_cache_',
} as const;

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

const initialState: QuizState = {
  currentQuiz: null,
  selectedSubject: null,
  selectedCategory: null,
  quizzes: [],
  loading: false,
  error: null
};

function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle storage errors (e.g., quota exceeded)
    console.warn('Failed to save to localStorage');
  }
}

function isCacheValid(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_DURATION;
}

function determineQuizStatus(quiz: Quiz, attempt?: QuizAttempt): QuizStatus {
  if (!attempt) return 'not-started';
  return attempt.completed_at ? 'completed' : 'in-progress';
}

function calculateProgress(quiz: Quiz, attempt?: QuizAttempt): number {
  if (!attempt) return 0;
  if (attempt.completed_at) return 100;
  
  const totalQuestions = quiz.questions?.length || 0;
  if (!totalQuestions) return 0;
  
  let progress = 0;
  if (attempt.last_answered_question_id) {
    const lastAnsweredIndex = quiz.questions.findIndex(
      q => q.id === attempt.last_answered_question_id
    );
    progress = Math.round(((lastAnsweredIndex + 1) / totalQuestions) * 100);
  }
  
  return progress;
}

function createQuizStore() {
  // Load initial state from localStorage if available
  const savedState = loadFromStorage<QuizState>(STORAGE_KEYS.STATE);
  const { subscribe, set, update } = writable<QuizState>(savedState || initialState);

  // Subscribe to changes and save to localStorage
  subscribe(state => {
    saveToStorage(STORAGE_KEYS.STATE, state);
  });

  return {
    subscribe,
    
    setQuizzes: (quizzes: Quiz[], attempts: QuizAttempt[] = []) => 
      update(state => {
        const updatedQuizzes = quizzes.map(quiz => {
          // Find the most recent attempt for this quiz
          const attempt = attempts
            .filter(a => a.quiz_id === quiz.id)
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0];

          return {
            ...quiz,
            status: determineQuizStatus(quiz, attempt),
            progress: calculateProgress(quiz, attempt),
            score: attempt?.score || null,
            attempt,
            lastQuestionId: attempt?.last_answered_question_id || undefined
          };
        });

        return { ...state, quizzes: updatedQuizzes };
      }),

    setCurrentQuiz: (quiz: QuizWithStatus) => 
      update(state => ({ ...state, currentQuiz: quiz })),

    setSelectedSubject: (subjectId: string | null) => 
      update(state => ({ 
        ...state, 
        selectedSubject: subjectId,
        selectedCategory: null,
        quizzes: []
      })),

    setSelectedCategory: (categoryId: string | null) =>
      update(state => ({
        ...state,
        selectedCategory: categoryId,
        quizzes: []
      })),

    updateQuizProgress: (quizId: string, progress: number, lastQuestionId: string) =>
      update(state => ({
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz.id === quizId
            ? { ...quiz, progress, lastQuestionId }
            : quiz
        )
      })),

    updateQuizScore: (quizId: string, score: number) =>
      update(state => ({
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz.id === quizId
            ? { ...quiz, score, status: 'completed' as const, progress: 100 }
            : quiz
        )
      })),

    setCachedData: (key: string, data: any) => {
      saveToStorage(key, {
        timestamp: Date.now(),
        data
      });
    },

    getCachedData: (key: string) => {
      const cached = loadFromStorage<{timestamp: number; data: any}>(key);
      if (cached && isCacheValid(cached.timestamp)) {
        return cached.data;
      }
      return null;
    },

    setLoading: (isLoading: boolean) => 
      update(state => ({ ...state, loading: isLoading })),

    setError: (error: string | null) => 
      update(state => ({ ...state, error })),

    reset: () => {
      set(initialState);
      localStorage.removeItem(STORAGE_KEYS.STATE);
    }
  };
}

export const quizStore = createQuizStore();