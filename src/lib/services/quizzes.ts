import type { Database } from '$lib/DatabaseDefinitions';
import type { Quiz, QuizAttempt } from '$lib/types';
import { supabaseClient } from '$lib/api';

export async function getQuizzesByCategory(categoryId: string) {
  const { data, error } = await supabaseClient
    .from('quizzes')
    .select(`
      *,
      category:categories(*),
      questions:quiz_questions(
        question:questions(
          *,
          choices(*)
        )
      )
    `)
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('title');

  if (error) throw error;
  return data as unknown as Quiz[];
}

export async function getQuiz(quizId: string) {
  const { data, error } = await supabaseClient
    .from('quizzes')
    .select(`
      *,
      category:categories(*),
      questions:quiz_questions(
        question:questions(
          *,
          choices(*)
        )
      )
    `)
    .eq('id', quizId)
    .single();

  if (error) throw error;
  return data as unknown as Quiz;
}

export async function createQuizAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
  const { data, error } = await supabaseClient
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: userId,
      started_at: new Date().toISOString(),
      score: 0
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizAttempts(userId: string) {
  const { data, error } = await supabaseClient
    .from('quiz_attempts')
    .select(`
      *,
      quiz:quizzes(
        *,
        category:categories(*)
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data;
}