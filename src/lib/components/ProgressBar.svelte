<script lang="ts">
    export let current: number;
    export let total: number;
</script>

<div class="progress-container">
    <div class="progress-bar" style={`width: ${(current/total)*100}%`}></div>
    <div class="progress-text">
        Question {current} of {total}
    </div>
</div>

<style>
    .progress-container {
        height: 1.5rem;
        background-color: #e5e7eb;
        border-radius: 0.75rem;
        position: relative;
        margin: 1rem 0;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background-color: #3b82f6;
        transition: width 0.3s ease;
    }

    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: 500;
        mix-blend-mode: difference;
    }
</style>