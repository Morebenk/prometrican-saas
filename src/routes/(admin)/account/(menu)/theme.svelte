<script lang="ts">
  import { browser } from "$app/environment"

  // Get HTML element reference once
  const htmlElement = browser ? document.documentElement : null

  // Load theme from localStorage
  let theme = browser
    ? localStorage.getItem("ui_theme") || "default"
    : "default"
  $: isDark = theme === "dracula"

  // Apply theme on load
  if (htmlElement) {
    htmlElement.setAttribute("data-theme", theme)
  }

  function setTheme(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked
    theme = isChecked ? "dracula" : "default"

    // Apply theme
    htmlElement?.setAttribute("data-theme", theme)

    // Persist theme
    if (theme !== "default") {
      localStorage.setItem("ui_theme", theme)
    } else {
      localStorage.removeItem("ui_theme")
    }
  }
</script>

<div class="flex items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>

  <label class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      class="sr-only peer"
      checked={isDark}
      on:change={setTheme}
    />
    <div
      class="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-600 peer-focus:ring-4 peer-focus:ring-gray-500 transition-all"
    ></div>
    <div
      class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform peer-checked:translate-x-5"
    ></div>
  </label>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
</div>
