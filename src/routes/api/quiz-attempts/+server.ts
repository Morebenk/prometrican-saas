import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { supabase } = locals;

  try {
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        quiz:quizzes(
          *,
          category:categories(*)
        )
      `)
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false });

    if (attemptsError) throw error(500, 'Failed to load quiz attempts');

    return json(attempts);
  } catch (err) {
    throw error(500, 'Internal Server Error');
  }
};