import type { Database } from '$lib/DatabaseDefinitions';
import { supabaseClient } from '$lib/api';
import type { QuizAttempt } from '$lib/types';

/**
 * Gets the latest attempt for a quiz, creating a new one if none exists or if the last one is completed
 */
export async function getOrCreateAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
  const { data: existingAttempts, error: fetchError } = await supabaseClient
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1);

  if (fetchError) throw fetchError;

  // If there's an existing incomplete attempt, return it
  const lastAttempt = existingAttempts?.[0];
  if (lastAttempt && !lastAttempt.completed_at) {
    return lastAttempt;
  }

  // Create a new attempt
  const { data: newAttempt, error: createError } = await supabaseClient
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      user_id: userId,
      started_at: new Date().toISOString(),
      score: 0,
    })
    .select()
    .single();

  if (createError) throw createError;
  return newAttempt;
}

/**
 * Updates the progress of a quiz attempt
 */
export async function updateAttemptProgress(
  attemptId: string,
  lastAnsweredQuestionId: string,
  score: number
): Promise<void> {
  const { error } = await supabaseClient
    .from('quiz_attempts')
    .update({
      last_answered_question_id: lastAnsweredQuestionId,
      score,
      updated_at: new Date().toISOString()
    })
    .eq('id', attemptId);

  if (error) throw error;
}

/**
 * Marks a quiz attempt as completed
 */
export async function completeAttempt(
  attemptId: string,
  finalScore: number
): Promise<void> {
  const { error } = await supabaseClient
    .from('quiz_attempts')
    .update({
      completed_at: new Date().toISOString(),
      score: finalScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', attemptId);

  if (error) throw error;
}

/**
 * Gets all attempts for a user
 */
export async function getUserAttempts(userId: string): Promise<QuizAttempt[]> {
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
  return data || [];
}

/**
 * Gets the last attempt for a specific quiz
 */
export async function getLastAttempt(
  quizId: string,
  userId: string
): Promise<QuizAttempt | null> {
  const { data, error } = await supabaseClient
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}