<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Component imports
  import Header from '$lib/components/Header.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import UploadZone from '$lib/components/UploadZone.svelte';
  import ProcessingState from '$lib/components/ProcessingState.svelte';
  import ResultViewer from '$lib/components/ResultViewer.svelte';
  import InteractiveEditor from '$lib/components/InteractiveEditor.svelte';
  import Footer from '$lib/components/Footer.svelte';

  // Orchestrator states
  let originalFile = $state<File | null>(null);
  let originalUrl = $state('');
  let removedUrl = $state('');
  let removedBlob = $state<Blob | null>(null);

  let stage = $state<'idle' | 'loading_model' | 'processing' | 'done' | 'error'>('idle');
  let progress = $state(0);
  let isEditorOpen = $state(false);
  let errorMessage = $state('');

  // Warm up: start downloading the model as soon as the page loads
  // so it's ready by the time the user picks an image.
  onMount(async () => {
    if (browser) {
      try {
        const { loadModel } = await import('$lib/backgroundRemoval');
        // Silent warm-up — no progress UI needed here
        await loadModel();
      } catch (err) {
        // Non-fatal: model will be loaded on demand when the user uploads
        console.warn('Background model warm-up failed, will retry on image upload:', err);
      }
    }
  });

  async function handleImageSelected(image: File | string) {
    if (image instanceof File) {
      originalFile = image;
      originalUrl = URL.createObjectURL(image);
    } else {
      originalFile = null;
      originalUrl = image;
    }

    stage = 'loading_model';
    progress = 0;
    errorMessage = '';

    try {
      const { removeBackground } = await import('$lib/backgroundRemoval');

      const resultBlob = await removeBackground(image, (currentStage, percent) => {
        if (currentStage === 'loading') {
          stage = 'loading_model';
        } else {
          stage = 'processing';
        }
        progress = percent;
      });

      removedBlob = resultBlob;
      removedUrl = URL.createObjectURL(resultBlob);
      stage = 'done';
    } catch (err: any) {
      console.error(err);
      stage = 'error';
      errorMessage = err.message || 'An unexpected error occurred during background removal.';
    }
  }

  function handleReset() {
    if (originalUrl && originalUrl.startsWith('blob:')) URL.revokeObjectURL(originalUrl);
    if (removedUrl && removedUrl.startsWith('blob:')) URL.revokeObjectURL(removedUrl);

    originalFile = null;
    originalUrl = '';
    removedUrl = '';
    removedBlob = null;
    stage = 'idle';
    progress = 0;
    errorMessage = '';
  }

  function handleSaveEdits(newUrl: string, newBlob: Blob) {
    if (removedUrl && removedUrl.startsWith('blob:')) URL.revokeObjectURL(removedUrl);
    removedUrl = newUrl;
    removedBlob = newBlob;
    isEditorOpen = false;
  }
</script>

<div class="flex flex-col min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-main)] transition-colors duration-300">
  <Header />

  <main class="flex-1 flex flex-col justify-center">
    {#if stage === 'idle'}
      <Hero />
      <UploadZone onImageSelected={handleImageSelected} />
    {:else}
      <div class="py-8">
        {#if stage === 'loading_model' || stage === 'processing'}
          <ProcessingState {progress} {stage} />
        {:else if stage === 'done'}
          <ResultViewer
            {originalUrl}
            {removedUrl}
            {removedBlob}
            onReset={handleReset}
            onOpenEditor={() => isEditorOpen = true}
          />
        {:else if stage === 'error'}
          <div class="max-w-md mx-auto my-16 p-8 bg-[var(--color-bg-card)] border border-red-500/20 rounded-2xl shadow-xl text-center flex flex-col items-center">
            <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
              <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-[var(--color-text-main)] mb-3">Processing Failed</h3>
            <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">{errorMessage}</p>
            <button
              class="px-6 py-2.5 bg-primary text-white font-semibold rounded-full hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer"
              onclick={handleReset}
            >
              Try Again
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <Footer />
</div>

<!-- Modal Editor Dialog -->
{#if isEditorOpen}
  <InteractiveEditor
    {originalUrl}
    {removedUrl}
    onClose={() => isEditorOpen = false}
    onSave={handleSaveEdits}
  />
{/if}
