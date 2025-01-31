<script lang="ts">
  import { onMount } from 'svelte';
  import { quizStore } from '$lib/stores/quiz';
  import type { Quiz } from '$lib/types';
  import type { Database } from '$lib/DatabaseDefinitions';
  import type { PageData } from './$types';

  export let data: PageData;

  type Subject = Database['public']['Tables']['subjects']['Row'];
  type Category = Database['public']['Tables']['categories']['Row'];
  
  let categories: Category[] = [];
  let quizzes: Quiz[] = [];
  
  $: subjects = data.subjects;
  $: selectedSubject = $quizStore.selectedSubject;
  $: selectedCategory = $quizStore.selectedCategory;
  $: loading = $quizStore.loading;
  $: error = $quizStore.error;

  async function handleSubjectChange(subjectId: string) {
    // Clear previous error
    quizStore.setError(null);
    
    // Reset categories when subject changes
    categories = [];
    quizStore.setSelectedCategory(null);

    // Validate subject ID
    if (!subjectId) {
      quizStore.setSelectedSubject(null);
      return;
    }

    quizStore.setSelectedSubject(subjectId);
    quizStore.setLoading(true);
    
    try {
      const response = await fetch(`/api/categories/${subjectId}`);
      if (!response.ok) throw new Error('Failed to load categories');
      categories = await response.json();
    } catch (err) {
      quizStore.setError('Failed to load categories');
      categories = [];
    } finally {
      quizStore.setLoading(false);
    }
  }

  async function handleCategoryChange(categoryId: string) {
    // Clear previous error
    quizStore.setError(null);

    // Reset quizzes when category changes
    quizzes = [];

    // Validate category ID
    if (!categoryId) {
      quizStore.setSelectedCategory(null);
      return;
    }

    quizStore.setSelectedCategory(categoryId);
    quizStore.setLoading(true);
    
    try {
      const response = await fetch(`/api/quizzes/${categoryId}`);
      if (!response.ok) throw new Error('Failed to load quizzes');
      quizzes = await response.json();
    } catch (err) {
      quizStore.setError('Failed to load quizzes');
      quizzes = [];
    } finally {
      quizStore.setLoading(false);
    }
  }
</script>

<div class="container mx-auto p-4 max-w-4xl">
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="text-2xl font-bold text-primary">Practice Zone</div>

    <!-- Subject Selection -->
    <div class="card bg-base-200">
      <div class="card-body">
        <h2 class="card-title">Select Subject</h2>
        <select 
          class="select select-bordered w-full" 
          value={selectedSubject ?? ''} 
          on:change={(e) => handleSubjectChange(e.currentTarget.value)}
        >
          <option value="">Choose a subject</option>
          {#each subjects as subject}
            <option value={subject.id}>{subject.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Category Selection -->
    {#if selectedSubject}
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">Select Category</h2>
          <select 
            class="select select-bordered w-full"
            value={selectedCategory ?? ''}
            on:change={(e) => handleCategoryChange(e.currentTarget.value)}
          >
            <option value="">Choose a category</option>
            {#each categories as category}
              <option value={category.id}>{category.name}</option>
            {/each}
          </select>
        </div>
      </div>
    {/if}

    <!-- Available Quizzes -->
    {#if selectedCategory}
      <div class="card bg-base-200">
        <div class="card-body">
          <h2 class="card-title">Available Quizzes</h2>
          {#if quizzes.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {#each quizzes as quiz}
                <div class="card bg-base-100 shadow-xl">
                  <div class="card-body">
                    <h3 class="card-title text-lg">{quiz.title}</h3>
                    {#if quiz.description}
                      <p class="text-sm text-base-content/70">{quiz.description}</p>
                    {/if}
                    <div class="card-actions justify-end mt-4">
                      <a href="/quiz/{quiz.id}" class="btn btn-primary">Start Quiz</a>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-center py-4 text-base-content/70">No quizzes available for this category</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if loading}
      <div class="flex justify-center">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    {/if}

    <!-- Error State -->
    {#if error}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {/if}
  </div>
</div>
