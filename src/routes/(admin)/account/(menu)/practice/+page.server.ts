import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PageData } from './+page';

export const load = (async ({ locals }): Promise<PageData> => {
  const session = await locals.getSession();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { supabase } = locals;

  try {
    // Fetch subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (subjectsError) {
      console.error('Error fetching subjects:', subjectsError);
      throw error(500, 'Failed to load subjects');
    }

    // Fetch user's quiz attempts
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

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError);
      throw error(500, 'Failed to load quiz attempts');
    }

    return {
      subjects: subjects || [],
      attempts: attempts || [],
      user: {
        id: session.user.id,
        email: session.user.email || ''
      }
    };
  } catch (err) {
    console.error('Server error:', err);
    throw error(500, 'Internal Server Error');
  }
}) satisfies PageServerLoad;