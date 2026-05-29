<script lang="ts">
  // Props
  let { 
    originalUrl, 
    removedUrl, 
    removedBlob, 
    onReset, 
    onOpenEditor 
  } = $props<{
    originalUrl: string;
    removedUrl: string;
    removedBlob: Blob | null;
    onReset: () => void;
    onOpenEditor: () => void;
  }>();

  let activeTab = $state<'removed' | 'original'>('removed');
  let selectedBgType = $state<'transparent' | 'color' | 'image'>('transparent');
  let selectedColor = $state('#ffffff');
  let selectedImageUrl = $state('');

  // Preset Colors
  const presetColors = [
    '#ffffff', '#000000', '#f87171', '#fbbf24', 
    '#34d399', '#60a5fa', '#818cf8', '#c084fc'
  ];

  // Preset Background Images (curated Unsplash URLs)
  const presetImages = [
    { name: 'Studio', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60' },
    { name: 'Nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60' },
    { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60' },
    { name: 'Abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60' }
  ];

  let customBgInput = $state<HTMLInputElement | null>(null);

  function selectBgColor(color: string) {
    selectedBgType = 'color';
    selectedColor = color;
    activeTab = 'removed';
  }

  function selectBgImage(url: string) {
    selectedBgType = 'image';
    selectedImageUrl = url;
    activeTab = 'removed';
  }

  function selectTransparent() {
    selectedBgType = 'transparent';
    activeTab = 'removed';
  }

  function handleCustomBgUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const url = URL.createObjectURL(file);
      selectBgImage(url);
    }
  }

  // Composites background and removed-background image and downloads it
  async function downloadComposite() {
    if (!removedUrl) return;

    if (selectedBgType === 'transparent') {
      const a = document.createElement('a');
      a.href = removedUrl;
      a.download = 'magic-bg-removed.png';
      a.click();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = removedUrl;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (selectedBgType === 'color') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawForegroundAndDownload(ctx, canvas, img);
      } else if (selectedBgType === 'image') {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = selectedImageUrl;
        bgImg.onload = () => {
          const imgRatio = bgImg.naturalWidth / bgImg.naturalHeight;
          const canvasRatio = canvas.width / canvas.height;
          let dWidth, dHeight, dx, dy;

          if (imgRatio > canvasRatio) {
            dHeight = canvas.height;
            dWidth = canvas.height * imgRatio;
            dx = (canvas.width - dWidth) / 2;
            dy = 0;
          } else {
            dWidth = canvas.width;
            dHeight = canvas.width / imgRatio;
            dx = 0;
            dy = (canvas.height - dHeight) / 2;
          }

          ctx.drawImage(bgImg, dx, dy, dWidth, dHeight);
          drawForegroundAndDownload(ctx, canvas, img);
        };
        bgImg.onerror = () => {
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawForegroundAndDownload(ctx, canvas, img);
        };
      }
    };
  }

  function drawForegroundAndDownload(
    ctx: CanvasRenderingContext2D, 
    canvas: HTMLCanvasElement, 
    foregroundImg: HTMLImageElement
  ) {
    ctx.drawImage(foregroundImg, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'magic-bg-composite.png';
    a.click();
  }
</script>

<div class="max-w-6xl w-full mx-auto px-6 my-8">
  <div class="mb-6">
    <button class="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-primary transition-colors cursor-pointer" onclick={onReset}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4.5 h-4.5">
        <path d="M19 12H5m7-7-7 7 7 7" />
      </svg>
      Upload New Image
    </button>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8">
    <!-- Left Area: Image Preview with background overlays -->
    <div class="flex flex-col gap-6">
      <div class="flex gap-2 border-b border-[var(--color-border-color)]">
        <button 
          class="px-5 py-3 text-sm font-bold text-[var(--color-text-muted)] border-b-3 border-transparent hover:text-primary transition-all cursor-pointer
          {activeTab === 'removed' ? 'text-primary border-b-primary' : ''}" 
          onclick={() => activeTab = 'removed'}
        >
          Removed Background
        </button>
        <button 
          class="px-5 py-3 text-sm font-bold text-[var(--color-text-muted)] border-b-3 border-transparent hover:text-primary transition-all cursor-pointer
          {activeTab === 'original' ? 'text-primary border-b-primary' : ''}" 
          onclick={() => activeTab = 'original'}
        >
          Original
        </button>
      </div>

      <div class="relative border border-[var(--color-border-color)] rounded-[24px] bg-[var(--color-bg-card)] shadow-md overflow-hidden transition-all duration-300">
        {#if activeTab === 'removed'}
          <!-- Removed Background Viewport -->
          <div 
            class="w-full aspect-[4/3] flex items-center justify-center p-8 relative min-h-[350px] transition-all duration-300
            {selectedBgType === 'transparent' ? 'checkerboard' : ''}"
            style="
              background-color: {selectedBgType === 'color' ? selectedColor : 'transparent'};
              background-image: {selectedBgType === 'image' ? `url(${selectedImageUrl})` : 'none'};
              background-size: cover;
              background-position: center;
            "
          >
            <img src={removedUrl} alt="Removed Background" class="max-w-full max-h-full object-contain rounded-md z-[2]" />
          </div>
        {:else}
          <!-- Original Image Viewport -->
          <div class="w-full aspect-[4/3] flex items-center justify-center p-8 relative min-h-[350px]">
            <img src={originalUrl} alt="Original" class="max-w-full max-h-full object-contain rounded-md z-[2]" />
          </div>
        {/if}

        <button 
          class="absolute top-4 right-4 bg-[var(--color-bg-card)] border border-[var(--color-border-color)] text-[var(--color-text-main)] hover:bg-primary hover:text-white hover:border-primary px-4 py-2 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm transition-all z-[5] cursor-pointer" 
          onclick={onOpenEditor} 
          aria-label="Open editor"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit / Erase
        </button>
      </div>

      <!-- Quick Background Customizer -->
      {#if activeTab === 'removed'}
        <div class="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[16px] p-5 shadow-xs transition-all duration-300">
          <h4 class="text-sm font-bold text-[var(--color-text-main)] mb-3">Add background</h4>
          <div class="flex flex-wrap gap-4 items-center">
            <!-- Transparent Swatch -->
            <button 
              class="w-10 h-10 rounded-md border-2 border-transparent cursor-pointer shadow-sm overflow-hidden relative hover:scale-108 transition-all
              {selectedBgType === 'transparent' ? 'border-primary scale-105' : ''}"
              onclick={selectTransparent}
              title="Transparent"
            >
              <div class="checkerboard w-full h-full"></div>
            </button>

            <!-- Color Swatches -->
            <div class="flex gap-2 pr-4 border-r border-[var(--color-border-color)]">
              {#each presetColors as color}
                <button 
                  class="w-10 h-10 rounded-md border border-black/10 cursor-pointer shadow-sm hover:scale-108 transition-all
                  {selectedBgType === 'color' && selectedColor === color ? 'border-2 border-primary scale-105' : ''}"
                  style="background-color: {color}"
                  onclick={() => selectBgColor(color)}
                  title={color}
                ></button>
              {/each}
              
              <!-- Color Picker -->
              <div class="relative w-10 h-10">
                <input 
                  type="color" 
                  value={selectedColor} 
                  oninput={(e) => selectBgColor((e.target as HTMLInputElement).value)} 
                  id="color-picker-input"
                  class="absolute w-1.5 h-1.5 opacity-0"
                />
                <label 
                  for="color-picker-input" 
                  class="w-10 h-10 rounded-md border border-[var(--color-border-color)] bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-primary flex items-center justify-center cursor-pointer hover:scale-108 transition-all" 
                  title="Custom Color"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12" />
                  </svg>
                </label>
              </div>
            </div>

            <!-- Image presets -->
            <div class="flex gap-2">
              {#each presetImages as img}
                <button 
                  class="w-10 h-10 rounded-md border-2 border-transparent bg-cover bg-center cursor-pointer shadow-sm hover:scale-108 transition-all
                  {selectedBgType === 'image' && selectedImageUrl === img.url ? 'border-primary scale-105' : ''}"
                  style="background-image: url({img.url})"
                  onclick={() => selectBgImage(img.url)}
                  title={img.name}
                ></button>
              {/each}
              
              <!-- Custom upload background image -->
              <input 
                type="file" 
                accept="image/*" 
                bind:this={customBgInput} 
                onchange={handleCustomBgUpload}
                class="hidden"
              />
              <button 
                class="w-10 h-10 rounded-md border border-[var(--color-border-color)] bg-[var(--color-bg-input)] text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center justify-center cursor-pointer hover:scale-108 transition-all" 
                onclick={() => customBgInput?.click()}
                title="Upload custom background image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5.5 h-5.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Right Area: Sidebar download/options panel -->
    <div class="flex flex-col gap-6">
      <div class="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[24px] p-8 shadow-lg lg:sticky lg:top-[90px] transition-all duration-300">
        <h3 class="text-xl font-extrabold text-[var(--color-text-main)] mb-1">Download Image</h3>
        <p class="text-xs text-[var(--color-text-muted)] mb-6">Download standard or high resolution background-removed images.</p>
        
        <div class="flex flex-col gap-4">
          <button class="w-full h-[58px] rounded-[12px] bg-gradient-to-r from-primary to-[#298dff] text-white font-bold text-base flex flex-col items-center justify-center shadow-md hover:shadow-lg hover:opacity-95 transition-all cursor-pointer" onclick={downloadComposite}>
            Download
            <span class="text-[0.725rem] font-medium opacity-80">Preview Size</span>
          </button>
          
          <button class="w-full h-[58px] rounded-[12px] bg-[var(--color-bg-input)] border border-[var(--color-border-color)] text-[var(--color-text-main)] hover:bg-[var(--color-border-color)] font-bold text-base flex flex-col items-center justify-center transition-all cursor-pointer" onclick={downloadComposite}>
            Download HD
            <span class="text-[0.725rem] font-medium opacity-80">Full Resolution</span>
          </button>
        </div>

        <hr class="border-0 border-t border-[var(--color-border-color)] my-8" />
        
        <div class="flex flex-col gap-3">
          <p class="text-xs text-[var(--color-text-muted)] leading-relaxed">Want to fine-tune the results? Erase details or restore parts of the background.</p>
          <button class="w-full py-3 bg-[var(--color-primary-light)] border border-dashed border-primary text-primary hover:bg-primary hover:text-white rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer" onclick={onOpenEditor}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
              <path d="m15 4 5 5M3 21l3-3M20.5 3.5a2.12 2.12 0 0 0-3 0L7 14l-2 5 5-2 10.5-10.5a2.12 2.12 0 0 0 0-3Z" />
            </svg>
            Erase / Restore Brush
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
