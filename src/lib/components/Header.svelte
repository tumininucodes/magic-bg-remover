<script lang="ts">
  import { onMount } from 'svelte';

  let isDark = $state(false);

  onMount(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    isDark = currentTheme === 'dark';
  });

  function toggleTheme() {
    isDark = !isDark;
    const newTheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }
</script>

<header class="sticky top-0 z-[100] bg-[var(--color-bg-card)]/80 backdrop-blur-md border-b border-[var(--color-border-color)] transition-all duration-300">
  <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2 text-xl font-extrabold text-[var(--color-text-main)] group">
      <svg class="w-7 h-7 text-primary transition-transform group-hover:rotate-12 duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M15 4V2m0 4h2m-2 0H9c-1.5 0-3 1.5-3 3v8c0 1.5 1.5 3 3 3h6c1.5 0 3-1.5 3-3V9c0-1.5-1.5-3-3-3Zm0 0V4" />
        <path d="m3 10 3 3m0 0 2-2M6 13l-2 2M9.5 14h5M12 11.5v5" />
      </svg>
      <span>Magic <span class="bg-gradient-to-r from-primary to-[#298dff] bg-clip-text text-transparent">BG</span></span>
    </a>
    
    <!-- Nav Links (Desktop) -->
    <nav class="hidden md:flex items-center gap-8">
      <a href="#features" class="text-[0.925rem] font-medium text-[var(--color-text-muted)] hover:text-primary transition-colors">Features</a>
      <a href="#how-to-use" class="text-[0.925rem] font-medium text-[var(--color-text-muted)] hover:text-primary transition-colors">How to Use</a>
      <div class="relative flex items-center">
        <a href="#pricing" class="text-[0.925rem] font-medium text-[var(--color-text-muted)] hover:text-primary transition-colors">Pricing</a>
        <span class="absolute -top-2.5 -right-6 text-[0.65rem] font-extrabold bg-accent text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90">Free</span>
      </div>
    </nav>

    <!-- Actions -->
    <div class="flex items-center gap-4">
      <button 
        class="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border-color)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-input)] transition-all"
        onclick={toggleTheme} 
        aria-label="Toggle dark mode"
      >
        {#if isDark}
          <!-- Sun Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        {:else}
          <!-- Moon Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        {/if}
      </button>
      <a href="#signup" class="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-primary to-[#298dff] hover:opacity-95 hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-150">Sign up</a>
    </div>
  </div>
</header>
