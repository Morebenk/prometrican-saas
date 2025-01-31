<script lang="ts">
  import { onMount } from 'svelte';
  import { quizStore, type QuizStatus } from '$lib/stores/quiz';
  import ProgressCircle from '$lib/components/ProgressCircle.svelte';
  import type { Quiz, QuizAttempt } from '$lib/types';
  import type { Database } from '$lib/DatabaseDefinitions';
  import type { PageData } from './+page';

  export let data: PageData;

  type Subject = Database['public']['Tables']['subjects']['Row'];
  type Category = Database['public']['Tables']['categories']['Row'];
  
  let categories: Category[] = [];
  let allCategories: Category[] = [];
  
  $: subjects = data.subjects;
  $: selectedSubject = $quizStore.selectedSubject;
  $: selectedCategory = $quizStore.selectedCategory;
  $: loading = $quizStore.loading;
  $: error = $quizStore.error;

  // Group quizzes by their status
  $: inProgressQuizzes = $quizStore.quizzes.filter(q => q.status === 'in-progress');
  $: notStartedQuizzes = $quizStore.quizzes.filter(q => q.status === 'not-started');
  $: completedQuizzes = $quizStore.quizzes.filter(q => q.status === 'completed');

  // Cache keys
  const CATEGORY_CACHE_KEY = (subjectId: string) => `quiz_category_cache_${subjectId}`;
  const QUIZ_CACHE_KEY = (categoryId: string) => `quiz_cache_${categoryId}`;

  onMount(() => {
    // Restore last selected subject and category from store
    if (selectedSubject) {
      loadCategories(selectedSubject);
      if (selectedCategory) {
        loadQuizzes(selectedCategory);
      }
    }
  });

  async function loadCategories(subjectId: string) {
    // Try to get cached categories
    const cachedCategories = quizStore.getCachedData(CATEGORY_CACHE_KEY(subjectId));
    if (cachedCategories) {
      allCategories = cachedCategories;
      return;
    }

    try {
      const response = await fetch(`/api/categories/${subjectId}`);
      if (!response.ok) throw new Error('Failed to load categories');
      allCategories = await response.json();
      
      // Cache the categories
      quizStore.setCachedData(CATEGORY_CACHE_KEY(subjectId), allCategories);
    } catch (err) {
      quizStore.setError('Failed to load categories');
      allCategories = [];
    }
  }

  async function handleSubjectChange(subjectId: string) {
    quizStore.setError(null);
    
    if (!subjectId) {
      quizStore.setSelectedSubject(null);
      allCategories = [];
      return;
    }

    quizStore.setSelectedSubject(subjectId);
    quizStore.setLoading(true);
    
    await loadCategories(subjectId);
    
    // Automatically select "All Categories"
    if (allCategories.length > 0) {
      handleCategoryChange('all');
    }
    
    quizStore.setLoading(false);
  }

  async function loadQuizzes(categoryId: string) {
    const fetchQuizzesForCategory = async (catId: string) => {
      // Try to get cached quizzes
      const cacheKey = QUIZ_CACHE_KEY(catId);
      const cachedQuizzes = quizStore.getCachedData(cacheKey);
      if (cachedQuizzes) {
        return cachedQuizzes;
      }

      const response = await fetch(`/api/quizzes/${catId}`);
      if (!response.ok) throw new Error('Failed to load quizzes');
      const quizzes = await response.json();
      
      // Cache the quizzes
      quizStore.setCachedData(cacheKey, quizzes);
      return quizzes;
    };

    try {
      // If 'all' is selected, fetch quizzes for all categories
      const promises = categoryId === 'all'
        ? allCategories.map(cat => fetchQuizzesForCategory(cat.id))
        : [fetchQuizzesForCategory(categoryId)];

      const results = await Promise.all(promises);
      const allQuizzes = results.flat();

      // Set quizzes with attempts data
      quizStore.setQuizzes(allQuizzes, data.attempts);
    } catch (err) {
      quizStore.setError('Failed to load quizzes');
      quizStore.setQuizzes([], []);
    }
  }

  async function handleCategoryChange(categoryId: string) {
    quizStore.setError(null);
    quizStore.setSelectedCategory(categoryId);
    quizStore.setLoading(true);
    await loadQuizzes(categoryId);
    quizStore.setLoading(false);
  }

  // Generate quiz link based on attempt status
  function getQuizLink(quiz: Quiz & { lastQuestionId?: string }) {
    const baseUrl = `/quiz/${quiz.id}`;
    return quiz.lastQuestionId ? `${baseUrl}?question=${quiz.lastQuestionId}` : baseUrl;
  }
</script>

<div class="container mx-auto p-4">
  <!-- Header with filters -->
  <div class="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center">
    <h1 class="text-2xl font-bold text-primary whitespace-nowrap">Practice Zone</h1>
    
    <div class="flex flex-wrap gap-4 items-center flex-grow">
      <!-- Subject Selection -->
      <select 
        class="select select-bordered select-sm w-full md:w-48" 
        value={selectedSubject ?? ''} 
        on:change={(e) => handleSubjectChange(e.currentTarget.value)}
      >
        <option value="">Select Subject</option>
        {#each subjects as subject}
          <option value={subject.id}>{subject.name}</option>
        {/each}
      </select>

      <!-- Category Selection -->
      {#if selectedSubject}
        <select 
          class="select select-bordered select-sm w-full md:w-48"
          value={selectedCategory ?? 'all'}
          on:change={(e) => handleCategoryChange(e.currentTarget.value)}
        >
          <option value="all">All Categories</option>
          {#each allCategories as category}
            <option value={category.id}>{category.name}</option>
          {/each}
        </select>
      {/if}
    </div>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  {:else}
    <!-- In Progress Quizzes -->
    {#if inProgressQuizzes.length > 0}
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-primary"></div>
          In Progress
          <span class="text-sm font-normal text-base-content/70">
            ({inProgressQuizzes.length})
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each inProgressQuizzes as quiz}
            <div class="card bg-base-200 hover:bg-base-300 transition-colors">
              <div class="card-body p-4">
                <div class="flex items-start gap-4">
                  <ProgressCircle 
                    status={quiz.status}
                    progress={quiz.progress}
                    score={quiz.score}
                    size={48}
                  />
                  <div class="flex-grow">
                    <h3 class="card-title text-base mb-1">{quiz.title}</h3>
                    {#if quiz.category}
                      <p class="text-sm text-base-content/70 mb-2">
                        {quiz.category.name}
                      </p>
                    {/if}
                    <div class="card-actions justify-end">
                      <a 
                        href={getQuizLink(quiz)} 
                        class="btn btn-sm btn-primary"
                      >
                        Continue
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Not Started Quizzes -->
    {#if notStartedQuizzes.length > 0}
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-neutral-300"></div>
          Not Started
          <span class="text-sm font-normal text-base-content/70">
            ({notStartedQuizzes.length})
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each notStartedQuizzes as quiz}
            <div class="card bg-base-200 hover:bg-base-300 transition-colors">
              <div class="card-body p-4">
                <div class="flex items-start gap-4">
                  <ProgressCircle 
                    status={quiz.status}
                    progress={0}
                    size={48}
                  />
                  <div class="flex-grow">
                    <h3 class="card-title text-base mb-1">{quiz.title}</h3>
                    {#if quiz.category}
                      <p class="text-sm text-base-content/70 mb-2">
                        {quiz.category.name}
                      </p>
                    {/if}
                    <div class="card-actions justify-end">
                      <a href={getQuizLink(quiz)} class="btn btn-sm btn-primary">
                        Start
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Completed Quizzes -->
    {#if completedQuizzes.length > 0}
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-success"></div>
          Completed
          <span class="text-sm font-normal text-base-content/70">
            ({completedQuizzes.length})
          </span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each completedQuizzes as quiz}
            <div class="card bg-base-200 hover:bg-base-300 transition-colors">
              <div class="card-body p-4">
                <div class="flex items-start gap-4">
                  <ProgressCircle 
                    status={quiz.status}
                    progress={100}
                    score={quiz.score}
                    size={48}
                  />
                  <div class="flex-grow">
                    <h3 class="card-title text-base mb-1">{quiz.title}</h3>
                    {#if quiz.category}
                      <p class="text-sm text-base-content/70 mb-2">
                        {quiz.category.name}
                      </p>
                    {/if}
                    <div class="card-actions justify-end">
                      <a href={getQuizLink(quiz)} class="btn btn-sm btn-primary">
                        Review
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Empty State -->
    {#if !inProgressQuizzes.length && !notStartedQuizzes.length && !completedQuizzes.length}
      <div class="text-center py-12">
        <div class="text-5xl mb-4">📚</div>
        <h3 class="text-lg font-medium mb-2">No Quizzes Available</h3>
        <p class="text-base-content/70">
          {selectedSubject ? 
            "No quizzes found for the selected criteria." :
            "Select a subject to see available quizzes."}
        </p>
      </div>
    {/if}
  {/if}

  <!-- Error State -->
  {#if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {/if}
</div>
