import type { QuizAttempt } from '$lib/types';
import type { Database } from '$lib/DatabaseDefinitions';

export type Subject = Database['public']['Tables']['subjects']['Row'];

export interface PageData {
  subjects: Subject[];
  attempts: QuizAttempt[];
  user: {
    id: string;
    email: string;
  };
}