<script lang="ts">
  import { onMount } from 'svelte';

  let container = $state<HTMLDivElement | null>(null);
  let containerWidth = $state(500);
  let sliderPos = $state(50); // percentage (0 to 100)
  let isDragging = $state(false);

  function handleResize() {
    if (container) {
      containerWidth = container.clientWidth;
    }
  }

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  function moveSlider(clientX: number) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    sliderPos = percentage;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    moveSlider(e.clientX);
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      moveSlider(e.touches[0].clientX);
    }
  }

  function startDragging(e: MouseEvent | TouchEvent) {
    isDragging = true;
    if (e instanceof MouseEvent) {
      moveSlider(e.clientX);
    } else if (e.touches.length > 0) {
      moveSlider(e.touches[0].clientX);
    }
  }

  function stopDragging() {
    isDragging = false;
  }
</script>

<svelte:window 
  onmousemove={handleMouseMove} 
  onmouseup={stopDragging}
  ontouchmove={handleTouchMove}
  ontouchend={stopDragging}
/>

<section class="py-20 px-6 overflow-hidden transition-all duration-300">
  <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
    <!-- Hero content -->
    <div class="flex flex-col items-center lg:items-start">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-text-main)] leading-[1.1] mb-4">
        Remove Image <br />
        <span class="bg-gradient-to-r from-primary to-[#298dff] bg-clip-text text-transparent">Background</span>
      </h1>
      <p class="text-lg sm:text-xl font-bold text-[var(--color-text-muted)] mb-8">100% Automatically and Free</p>
      
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 text-sm sm:text-base font-semibold text-[var(--color-text-main)]">
          <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Privacy First - Runs in your browser</span>
        </div>
        <div class="flex items-center gap-3 text-sm sm:text-base font-semibold text-[var(--color-text-main)]">
          <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>No sign up required for standard quality</span>
        </div>
        <div class="flex items-center gap-3 text-sm sm:text-base font-semibold text-[var(--color-text-main)]">
          <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Advanced Erase & Restore editor</span>
        </div>
      </div>
    </div>

    <!-- Hero visual Comparison Slider -->
    <div class="flex justify-center w-full">
      <div 
        class="relative w-full max-w-[450px] aspect-[4/5] rounded-[24px] overflow-hidden shadow-2xl border border-[var(--color-border-color)] select-none" 
        bind:this={container}
        onmousedown={startDragging}
        ontouchstart={startDragging}
        role="presentation"
        style="cursor: {isDragging ? 'ew-resize' : 'default'}"
      >
        <!-- Background: Original -->
        <img 
          src="/hero-original.png" 
          alt="Original portrait" 
          class="absolute top-0 left-0 w-full h-full object-cover pointer-events-none z-[1]" 
          draggable="false"
        />
        
        <!-- Foreground Overlay: Transparent Wrapper -->
        <div 
          class="absolute top-0 left-0 h-full overflow-hidden z-[2] checkerboard" 
          style="width: {sliderPos}%"
        >
          <img 
            src="/hero-transparent.png" 
            alt="Portrait background removed" 
            class="h-full max-w-none object-cover pointer-events-none"
            style="width: {containerWidth}px"
            draggable="false"
          />
        </div>

        <!-- Slider Line & Handle -->
        <div 
          class="absolute top-0 bottom-0 w-[3px] bg-white z-[3] -translate-x-1/2 pointer-events-none shadow-[0_0_8px_rgba(0,0,0,0.4)]" 
          style="left: {sliderPos}%"
        >
          <div class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg text-primary pointer-events-auto cursor-ew-resize">
            <svg class="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
            </svg>
          </div>
        </div>

        <!-- Labels -->
        <span class="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-950/75 backdrop-blur-xs text-white text-[0.7rem] font-bold rounded-md z-[4] pointer-events-none">Original</span>
        <span class="absolute bottom-4 left-4 px-3 py-1.5 bg-slate-950/75 backdrop-blur-xs text-white text-[0.7rem] font-bold rounded-md z-[4] pointer-events-none">Background Removed</span>
      </div>
    </div>
  </div>
</section>
