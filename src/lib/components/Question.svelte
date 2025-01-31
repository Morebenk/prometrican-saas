<script lang="ts">
    import type { QuestionWithChoices } from '$lib/types';

    export let question: QuestionWithChoices;
    export let selectedChoice: string | null = null;
    export let showFeedback = false;

    const checkmark = '✓'; // Proper Unicode checkmark
</script>

<div class="question-container">
    <h2 class="text-xl font-semibold mb-4">{question.content}</h2>
    
    {#if question.image_url}
        <img 
            src={question.image_url} 
            alt="Question illustration" 
            class="question-image mb-4 max-w-full h-auto"
        >
    {/if}
    
    <div class="choices-grid">
        {#each question.choices as choice (choice.id)}
            <button
                class="choice-btn {selectedChoice === choice.id ? 'selected' : ''}
                    {showFeedback ? (choice.is_correct ? 'correct' : 'incorrect') : ''}"
                on:click={() => selectedChoice = choice.id}
                disabled={showFeedback}
            >
                <span class="choice-content">{choice.content}</span>
                {#if showFeedback && choice.is_correct}
                    <span class="feedback-icon">{checkmark}</span>
                {/if}
            </button>
        {/each}
    </div>
    
    {#if showFeedback && question.explanation}
        <div class="explanation mt-4 p-3 bg-gray-100 rounded-lg">
            {question.explanation}
        </div>
    {/if}
</div>

<style>
    .question-container {
        margin: 2rem 0;
    }

    .choices-grid {
        display: grid;
        gap: 1rem;
        margin: 1rem 0;
    }

    .choice-btn {
        padding: 1rem;
        text-align: left;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .choice-btn.selected {
        border-color: #3b82f6;
        background-color: #bfdbfe;
    }

    .choice-btn.correct {
        border-color: #10b981;
        background-color: #a7f3d0;
    }

    .choice-btn.incorrect {
        border-color: #ef4444;
        background-color: #fecaca;
    }

    .feedback-icon {
        margin-left: 1rem;
        float: right;
    }
</style>