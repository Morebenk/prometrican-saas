<script lang="ts">
  export let progress: number = 0;
  export let size: number = 40;
  export let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
  export let score: number | null = null;

  $: radius = size / 2;
  $: strokeWidth = size / 10;
  $: normalizedRadius = radius - strokeWidth;
  $: circumference = normalizedRadius * 2 * Math.PI;
  $: strokeDashoffset = circumference - (progress / 100) * circumference;

  $: statusColor = {
    'not-started': 'stroke-neutral-300',
    'in-progress': 'stroke-primary',
    'completed': 'stroke-success'
  }[status];

  $: statusBgColor = {
    'not-started': 'bg-neutral-100',
    'in-progress': 'bg-primary/10',
    'completed': 'bg-success/10'
  }[status];

  $: statusTextColor = {
    'not-started': 'text-neutral-500',
    'in-progress': 'text-primary',
    'completed': 'text-success'
  }[status];
</script>

<div 
  class="relative inline-flex items-center justify-center {statusBgColor} rounded-full"
  style="width: {size}px; height: {size}px;"
>
  <svg
    class="transform -rotate-90"
    style="width: {size}px; height: {size}px;"
  >
    <circle
      stroke="currentColor"
      class="stroke-neutral-200"
      fill="transparent"
      stroke-width={strokeWidth}
      r={normalizedRadius}
      cx={radius}
      cy={radius}
    />
    <circle
      stroke="currentColor"
      class={statusColor}
      fill="transparent"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      style="stroke-dashoffset: {strokeDashoffset}"
      r={normalizedRadius}
      cx={radius}
      cy={radius}
    />
  </svg>
  <div class="absolute inset-0 flex items-center justify-center">
    {#if status === 'not-started'}
      <span class="text-xs {statusTextColor}">New</span>
    {:else if status === 'in-progress'}
      <span class="text-xs {statusTextColor}">{progress}%</span>
    {:else}
      <span class="text-xs {statusTextColor}">{score}%</span>
    {/if}
  </div>
</div>