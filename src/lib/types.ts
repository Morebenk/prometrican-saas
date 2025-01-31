import type { Database } from './DatabaseDefinitions';

export type Quiz = Database['public']['Tables']['quizzes']['Row'] & {
    category: Database['public']['Tables']['categories']['Row'];
    questions: QuestionWithChoices[];
};

export type QuestionWithChoices = Database['public']['Tables']['questions']['Row'] & {
    choices: Database['public']['Tables']['choices']['Row'][];
};

export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];

// Type guards
export function isQuiz(data: unknown): data is Quiz {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'title' in data &&
        'category' in data &&
        Array.isArray((data as any).questions)
    );
}

export function isQuizAttempt(data: unknown): data is QuizAttempt {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'user_id' in data &&
        'quiz_id' in data
    );
}

// Add these type definitions if missing
export interface QuestionWithChoices {
    id: string;
    content: string;
    image_url?: string | null;
    explanation?: string | null;
    choices: Choice[];
    created_at: string;
    updated_at: string | null;
    is_active: boolean;
}

export interface Choice {
    id: string;
    content: string;
    is_correct: boolean;
    explanation?: string | null;
}

export interface QuizAttempt {
    id: string;
    user_id: string;
    quiz_id: string;
    started_at: string;
    completed_at: string | null;
    last_answered_question_id: string | null;
    score: number;
}