<script lang="ts">
  // Props
  let { progress, stage } = $props<{
    progress: number;
    stage: 'loading_model' | 'processing';
  }>();

  let displayProgress = $derived(Math.round(progress));

  let message = $derived(
    stage === 'loading_model'
      ? 'Loading AI model (~70MB)...'
      : 'Removing background...'
  );

  let tip = $derived(
    stage === 'loading_model'
      ? 'First run will download the neural network. Subsequent runs are near-instantaneous.'
      : 'Running edge-detection and transparency segmentation in your browser.'
  );
</script>

<div class="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[24px] p-10 sm:p-14 text-center max-w-[500px] w-full mx-auto my-16 shadow-2xl flex flex-col items-center transition-all duration-300">
  <!-- Progress Ring Container -->
  <div class="relative w-[120px] h-[120px] mb-8">
    <svg class="w-[120px] h-[120px] -rotate-90" viewBox="0 0 100 100">
      <circle 
        class="fill-none stroke-[var(--color-bg-input)] stroke-[8]" 
        cx="50" 
        cy="50" 
        r="40" 
      />
      <circle 
        class="fill-none stroke-primary stroke-[8] stroke-round transition-all duration-150" 
        cx="50" 
        cy="50" 
        r="40" 
        style="stroke-dasharray: 251.2; stroke-dashoffset: {251.2 - (251.2 * progress) / 100}"
      />
    </svg>
    <div class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-[var(--color-text-main)]">{displayProgress}%</div>
  </div>

  <h3 class="text-xl font-extrabold text-[var(--color-text-main)] mb-3">{message}</h3>
  <p class="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[320px] mb-8">{tip}</p>
  
  <!-- Linear Progress Bar -->
  <div class="w-full h-1.5 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
    <div class="h-full bg-gradient-to-r from-primary to-[#298dff] rounded-full transition-all duration-150" style="width: {progress}%"></div>
  </div>
</div>
