<script lang="ts">
  import { onMount } from 'svelte';

  // Props
  let { onImageSelected } = $props<{
    onImageSelected: (image: File | string) => void;
  }>();

  let fileInput = $state<HTMLInputElement | null>(null);
  let isDragging = $state(false);
  let imageUrl = $state('');
  let urlError = $state('');
  let isFetchingUrl = $state(false);

  function triggerFileInput() {
    fileInput?.click();
  }

  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      onImageSelected(target.files[0]);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  }

  // Handle Ctrl+V (clipboard paste) of images
  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          onImageSelected(file);
          break;
        }
      }
    }
  }

  onMount(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  // Fetch Image from URL (Warning: CORS limitations apply in client-side)
  async function fetchImageUrl() {
    if (!imageUrl.trim()) return;
    urlError = '';
    isFetchingUrl = true;

    try {
      new URL(imageUrl);
      
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image from URL');
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('URL does not point to a valid image file');
      }

      const extension = blob.type.split('/')[1] || 'png';
      const file = new File([blob], `url-image.${extension}`, { type: blob.type });
      onImageSelected(file);
    } catch (err: any) {
      console.error(err);
      urlError = 'CORS blocker or invalid image URL. Try downloading the image and uploading it instead.';
    } finally {
      isFetchingUrl = false;
    }
  }

  // Handle Preset Sample Clicks
  async function selectSample(samplePath: string) {
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const filename = samplePath.substring(samplePath.lastIndexOf('/') + 1);
      const file = new File([blob], filename, { type: blob.type });
      onImageSelected(file);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  }
</script>

<div class="max-w-[650px] w-full mx-auto px-6 py-8" id="upload-zone">
  <!-- Upload Drag Card -->
  <div 
    class="bg-[var(--color-bg-card)] border-2 border-dashed border-[var(--color-border-color)] rounded-[24px] p-10 sm:p-14 text-center flex flex-col items-center shadow-lg transition-all duration-300 relative
    {isDragging ? 'border-primary bg-[var(--color-primary-light)] scale-[1.01]' : ''}"
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    role="presentation"
  >
    <input 
      type="file" 
      accept="image/*" 
      bind:this={fileInput} 
      onchange={handleFileChange}
      class="hidden"
    />
    
    <div class="w-18 h-18 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center mb-6 text-primary">
      <svg class="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 16V8m0 8-4-4m4 4 4-4M3 15v3c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3" />
      </svg>
    </div>

    <h3 class="text-lg sm:text-xl font-extrabold text-[var(--color-text-main)] mb-6">Upload your image to remove the background</h3>
    
    <button 
      class="bg-gradient-to-r from-primary to-[#298dff] text-white text-[1.1rem] font-bold px-10 py-4 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all mb-4 animate-pulse-btn cursor-pointer"
      onclick={triggerFileInput}
    >
      Upload Image
    </button>
    
    <p class="text-sm text-[var(--color-text-muted)] mb-2">or drag & drop a file here</p>
    <p class="text-xs text-[var(--color-text-muted)] mb-6">Tip: you can also paste an image using <kbd class="bg-[var(--color-bg-input)] border border-[var(--color-border-color)] rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold shadow-xs">Ctrl</kbd> + <kbd class="bg-[var(--color-bg-input)] border border-[var(--color-border-color)] rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold shadow-xs">V</kbd></p>

    <!-- URL Pasting input -->
    <div class="flex w-full max-w-[400px] bg-[var(--color-bg-input)] border border-[var(--color-border-color)] rounded-full p-1 focus-within:border-primary transition-all duration-200">
      <input 
        type="text" 
        placeholder="Or paste an image URL..." 
        bind:value={imageUrl}
        onkeydown={(e) => e.key === 'Enter' && fetchImageUrl()}
        disabled={isFetchingUrl}
        class="flex-1 bg-transparent px-4 py-2 text-sm text-[var(--color-text-main)] border-0 outline-none"
      />
      <button 
        onclick={fetchImageUrl} 
        disabled={isFetchingUrl}
        class="bg-primary text-white font-bold text-sm px-6 py-2 rounded-full hover:opacity-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        {isFetchingUrl ? 'Fetching...' : 'Fetch'}
      </button>
    </div>
    {#if urlError}
      <p class="text-accent text-xs mt-3 max-w-[400px] leading-relaxed">{urlError}</p>
    {/if}
  </div>

  <!-- Preset sample selector -->
  <div class="mt-10 text-center">
    <p class="text-sm text-[var(--color-text-muted)] font-semibold mb-4">No image? Try one of these samples:</p>
    <div class="grid grid-cols-3 gap-4">
      <button 
        class="group relative aspect-square rounded-[16px] overflow-hidden border border-[var(--color-border-color)] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-200 cursor-pointer" 
        onclick={() => selectSample('/samples/portrait.png')}
      >
        <img src="/samples/portrait.png" alt="Portrait Sample" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
        <span class="absolute bottom-0 left-0 right-0 bg-slate-950/75 backdrop-blur-xs text-white text-[0.7rem] font-bold py-1.5">People</span>
      </button>
      <button 
        class="group relative aspect-square rounded-[16px] overflow-hidden border border-[var(--color-border-color)] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-200 cursor-pointer" 
        onclick={() => selectSample('/samples/shoe.png')}
      >
        <img src="/samples/shoe.png" alt="Shoe Sample" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
        <span class="absolute bottom-0 left-0 right-0 bg-slate-950/75 backdrop-blur-xs text-white text-[0.7rem] font-bold py-1.5">Products</span>
      </button>
      <button 
        class="group relative aspect-square rounded-[16px] overflow-hidden border border-[var(--color-border-color)] shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary transition-all duration-200 cursor-pointer" 
        onclick={() => selectSample('/samples/pet.png')}
      >
        <img src="/samples/pet.png" alt="Pet Sample" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
        <span class="absolute bottom-0 left-0 right-0 bg-slate-950/75 backdrop-blur-xs text-white text-[0.7rem] font-bold py-1.5">Animals</span>
      </button>
    </div>
  </div>
</div>
