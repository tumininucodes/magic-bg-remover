<script lang="ts">
  import { onMount } from 'svelte';

  // Props
  let { 
    originalUrl, 
    removedUrl, 
    onClose, 
    onSave 
  } = $props<{
    originalUrl: string;
    removedUrl: string;
    onClose: () => void;
    onSave: (newUrl: string, newBlob: Blob) => void;
  }>();

  // Editor states
  let activeToolTab = $state<'brush' | 'background'>('brush');
  let brushMode = $state<'erase' | 'restore'>('erase');
  let brushSize = $state(30);

  let editorBgType = $state<'transparent' | 'color' | 'image'>('transparent');
  let editorColor = $state('#ffffff');
  let editorImageUrl = $state('');

  // Canvas elements
  let displayCanvas = $state<HTMLCanvasElement | null>(null);
  let originalImage = $state<HTMLImageElement | null>(null);
  let maskCanvas = $state<HTMLCanvasElement | null>(null);
  let bgImageElement = $state<HTMLImageElement | null>(null);

  // Mouse tracking
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let mouseX = $state<number | null>(null);
  let mouseY = $state<number | null>(null);
  let isHovering = $state(false);

  // Preset background options
  const presetColors = [
    '#ffffff', '#000000', '#f87171', '#fbbf24', 
    '#34d399', '#60a5fa', '#818cf8', '#c084fc'
  ];

  const presetImages = [
    { name: 'Studio', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60' },
    { name: 'Nature', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=60' },
    { name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60' },
    { name: 'Abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60' }
  ];

  let customBgInput = $state<HTMLInputElement | null>(null);

  onMount(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = originalUrl;
    img.onload = () => {
      originalImage = img;
      
      if (displayCanvas) {
        displayCanvas.width = img.naturalWidth;
        displayCanvas.height = img.naturalHeight;
      }

      const removedImg = new Image();
      removedImg.crossOrigin = 'anonymous';
      removedImg.src = removedUrl;
      removedImg.onload = () => {
        maskCanvas = document.createElement('canvas');
        maskCanvas.width = img.naturalWidth;
        maskCanvas.height = img.naturalHeight;
        const mCtx = maskCanvas.getContext('2d');
        if (mCtx) {
          mCtx.drawImage(removedImg, 0, 0);
        }
        
        requestAnimationFrame(draw);
      };
    };
  });

  $effect(() => {
    if (editorBgType || editorColor || editorImageUrl || brushMode || brushSize || mouseX || mouseY || isHovering) {
      draw();
    }
  });

  function draw() {
    if (!displayCanvas || !originalImage || !maskCanvas) return;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

    if (editorBgType === 'color') {
      ctx.fillStyle = editorColor;
      ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    } else if (editorBgType === 'image' && bgImageElement) {
      drawCoverImage(ctx, bgImageElement, displayCanvas.width, displayCanvas.height);
    } else {
      drawCheckerboard(ctx, displayCanvas.width, displayCanvas.height);
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = displayCanvas.width;
    offscreen.height = displayCanvas.height;
    const oCtx = offscreen.getContext('2d');
    if (oCtx) {
      oCtx.drawImage(originalImage, 0, 0);
      oCtx.globalCompositeOperation = 'destination-in';
      oCtx.drawImage(maskCanvas, 0, 0);
      ctx.drawImage(offscreen, 0, 0);
    }

    if (isHovering && mouseX !== null && mouseY !== null && activeToolTab === 'brush') {
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, brushSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = brushMode === 'erase' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = Math.max(2, displayCanvas.width / 400);
      ctx.stroke();
    }
  }

  function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let dWidth, dHeight, dx, dy;

    if (imgRatio > canvasRatio) {
      dHeight = height;
      dWidth = height * imgRatio;
      dx = (width - dWidth) / 2;
      dy = 0;
    } else {
      dWidth = width;
      dHeight = width / imgRatio;
      dx = 0;
      dy = (height - dHeight) / 2;
    }

    ctx.drawImage(img, dx, dy, dWidth, dHeight);
  }

  function drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const size = 20;
    const cols = Math.ceil(width / size);
    const rows = Math.ceil(height / size);
    
    const style = getComputedStyle(document.documentElement);
    const color1 = style.getPropertyValue('--checkerboard-color-1') || '#ffffff';
    const color2 = style.getPropertyValue('--checkerboard-color-2') || '#f1f5f9';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? color1 : color2;
        ctx.fillRect(c * size, r * size, size, size);
      }
    }
  }

  function getCanvasCoords(clientX: number, clientY: number) {
    if (!displayCanvas) return { x: 0, y: 0 };
    const rect = displayCanvas.getBoundingClientRect();
    const scaleX = displayCanvas.width / rect.width;
    const scaleY = displayCanvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function drawBrush(x1: number, y1: number, x2: number, y2: number) {
    if (!maskCanvas) return;
    const mCtx = maskCanvas.getContext('2d');
    if (!mCtx) return;

    mCtx.beginPath();
    mCtx.lineWidth = brushSize;
    mCtx.lineCap = 'round';
    mCtx.lineJoin = 'round';

    if (brushMode === 'erase') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.strokeStyle = 'rgba(255,255,255,1)';
      mCtx.fillStyle = 'rgba(255,255,255,1)';
    }

    mCtx.moveTo(x1, y1);
    mCtx.lineTo(x2, y2);
    mCtx.stroke();
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    if (activeToolTab !== 'brush') return;
    isDrawing = true;
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    const coords = getCanvasCoords(clientX, clientY);
    lastX = coords.x;
    lastY = coords.y;
    
    drawBrush(lastX, lastY, lastX, lastY);
    draw();
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!displayCanvas) return;
    
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    const coords = getCanvasCoords(clientX, clientY);
    
    mouseX = coords.x;
    mouseY = coords.y;

    if (isDrawing && activeToolTab === 'brush') {
      drawBrush(lastX, lastY, coords.x, coords.y);
      lastX = coords.x;
      lastY = coords.y;
      draw();
    }
  }

  function stopDraw() {
    isDrawing = false;
  }

  function loadBgImage(url: string) {
    editorBgType = 'image';
    editorImageUrl = url;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      bgImageElement = img;
      draw();
    };
  }

  function handleCustomBg(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const url = URL.createObjectURL(file);
      loadBgImage(url);
    }
  }

  function getMaskedBlob(): Promise<{ url: string; blob: Blob }> {
    return new Promise((resolve) => {
      if (!originalImage || !maskCanvas) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(originalImage, 0, 0);
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(maskCanvas, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({ url, blob });
        }
      }, 'image/png');
    });
  }

  async function handleApplyChanges() {
    const { url, blob } = await getMaskedBlob();
    onSave(url, blob);
  }

  function handleDownloadComposite() {
    if (!displayCanvas) return;
    const dataUrl = displayCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'magic-bg-edited.png';
    a.click();
  }
</script>

<div class="fixed inset-0 bg-[#0b0f19] z-[1000] flex flex-col text-slate-100 select-none">
  <!-- Top bar -->
  <div class="h-16 bg-[#151d30] border-b border-[#27354f] px-6 flex items-center justify-between">
    <div class="flex items-center gap-2 font-bold text-lg">
      <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
      <span>Edit Canvas</span>
    </div>
    
    <div class="flex gap-3">
      <button class="bg-[#1e293b] border border-[#27354f] text-slate-300 px-5 py-2 text-sm font-semibold rounded-full hover:bg-[#27354f] hover:text-white transition-all cursor-pointer" onclick={onClose}>Close</button>
      <button class="bg-gradient-to-r from-primary to-[#298dff] text-white px-5 py-2 text-sm font-semibold rounded-full hover:opacity-95 transition-all cursor-pointer" onclick={handleApplyChanges}>Apply Edits</button>
    </div>
  </div>

  <!-- Main Work area -->
  <div class="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">
    <!-- Left panel: Canvas workspace -->
    <div class="bg-[#0b0c10] flex items-center justify-center p-8 overflow-auto relative">
      <div 
        class="bg-transparent rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-[90%] max-h-[90%] flex items-center justify-center"
        onmouseenter={() => isHovering = true}
        onmouseleave={() => { isHovering = false; stopDraw(); }}
        role="presentation"
      >
        <canvas
          bind:this={displayCanvas}
          onmousedown={startDraw}
          onmousemove={handleMove}
          onmouseup={stopDraw}
          ontouchstart={startDraw}
          ontouchmove={handleMove}
          ontouchend={stopDraw}
          class="max-w-full max-h-full object-contain block shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          style="cursor: {activeToolTab === 'brush' ? 'none' : 'default'}"
        ></canvas>
      </div>
    </div>

    <!-- Right panel: Toolbox sidebar -->
    <div class="bg-[#151d30] border-l lg:border-l border-t lg:border-t-0 border-[#27354f] flex flex-col h-auto lg:h-full">
      <div class="flex border-b border-[#27354f] bg-[#0b0f19]">
        <button 
          class="flex-1 py-4 text-center text-xs font-bold text-[#94a3b8] border-b-3 border-transparent transition-all cursor-pointer
          {activeToolTab === 'brush' ? 'text-white border-b-primary bg-[#151d30]' : ''}"
          onclick={() => activeToolTab = 'brush'}
        >
          Erase / Restore
        </button>
        <button 
          class="flex-1 py-4 text-center text-xs font-bold text-[#94a3b8] border-b-3 border-transparent transition-all cursor-pointer
          {activeToolTab === 'background' ? 'text-white border-b-primary bg-[#151d30]' : ''}"
          onclick={() => activeToolTab = 'background'}
        >
          Background
        </button>
      </div>

      <div class="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        {#if activeToolTab === 'brush'}
          <!-- Brush Tool Details -->
          <div class="flex flex-col gap-2">
            <h4 class="text-xs uppercase tracking-wider text-[#94a3b8] font-bold">Brush Mode</h4>
            <div class="flex gap-2">
              <button 
                class="flex-1 inline-flex items-center justify-center gap-2 p-3 bg-[#1e293b] border border-[#27354f] text-[#94a3b8] rounded-md font-semibold text-sm transition-all cursor-pointer
                {brushMode === 'erase' ? 'bg-red-500/15 border-red-500 text-red-300' : ''}"
                onclick={() => brushMode = 'erase'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
                  <path d="M20 20H4M20 20h-4L7.5 11.5 11.5 7.5 20 16v4ZM11.5 7.5l-4-4-4 4 4 4" />
                </svg>
                Erase
              </button>
              
              <button 
                class="flex-1 inline-flex items-center justify-center gap-2 p-3 bg-[#1e293b] border border-[#27354f] text-[#94a3b8] rounded-md font-semibold text-sm transition-all cursor-pointer
                {brushMode === 'restore' ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300' : ''}"
                onclick={() => brushMode = 'restore'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                Restore
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <h4 class="text-xs uppercase tracking-wider text-[#94a3b8] font-bold">Brush Size</h4>
              <span class="text-xs font-bold text-primary">{brushSize}px</span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              bind:value={brushSize} 
              class="w-full h-1.5 bg-[#1e293b] rounded-full outline-none appearance-none cursor-pointer"
            />
          </div>
          
          <p class="text-[0.725rem] text-[#64748b] leading-relaxed mt-auto">
            Hover over the canvas to brush. Erase deletes pixels, Restore recovers original details. Size adjusts brush thickness.
          </p>
        {:else}
          <!-- Background Tool Details -->
          <div class="flex flex-col gap-2">
            <h4 class="text-xs uppercase tracking-wider text-[#94a3b8] font-bold">Solid Colors</h4>
            <div class="grid grid-cols-5 gap-2">
              <button 
                class="aspect-square rounded-md border-2 border-transparent cursor-pointer shadow-sm overflow-hidden relative hover:scale-110 transition-all
                {editorBgType === 'transparent' ? 'border-primary' : ''}"
                onclick={() => editorBgType = 'transparent'}
                title="Transparent"
              >
                <div class="checkerboard w-full h-full"></div>
              </button>
              
              {#each presetColors as color}
                <button 
                  class="aspect-square rounded-md border-2 border-transparent cursor-pointer shadow-sm hover:scale-110 transition-all
                  {editorBgType === 'color' && editorColor === color ? 'border-primary' : ''}"
                  style="background-color: {color}"
                  onclick={() => { editorBgType = 'color'; editorColor = color; }}
                  title={color}
                ></button>
              {/each}

              <!-- Color picker -->
              <div class="relative aspect-square">
                <input 
                  type="color" 
                  value={editorColor} 
                  oninput={(e) => { editorBgType = 'color'; editorColor = (e.target as HTMLInputElement).value; }} 
                  id="editor-color-picker"
                  class="absolute w-1.5 h-1.5 opacity-0"
                />
                <label 
                  for="editor-color-picker" 
                  class="w-full h-full rounded-md border border-[#27354f] bg-[#1e293b] text-[#94a3b8] hover:text-white flex items-center justify-center cursor-pointer hover:scale-110 transition-all" 
                  title="Custom Color"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <h4 class="text-xs uppercase tracking-wider text-[#94a3b8] font-bold">Photo Backgrounds</h4>
            <div class="grid grid-cols-3 gap-2">
              {#each presetImages as img}
                <button 
                  class="aspect-square rounded-md border-2 border-transparent bg-cover bg-center cursor-pointer shadow-sm hover:scale-105 transition-all
                  {editorBgType === 'image' && editorImageUrl === img.url ? 'border-primary' : ''}"
                  style="background-image: url({img.url})"
                  onclick={() => loadBgImage(img.url)}
                  title={img.name}
                ></button>
              {/each}
              
              <!-- Custom upload background in editor -->
              <input 
                type="file" 
                accept="image/*" 
                bind:this={customBgInput} 
                onchange={handleCustomBg}
                class="hidden"
              />
              <button 
                class="aspect-square rounded-md border border-[#27354f] bg-[#1e293b] text-[#94a3b8] hover:text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-all" 
                onclick={() => customBgInput?.click()}
                title="Upload photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        {/if}
      </div>

      <div class="p-6 border-t border-[#27354f] bg-[#0b0f19]">
        <button class="w-full bg-[#1e293b] border border-[#27354f] hover:bg-[#27354f] text-white py-3 rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer" onclick={handleDownloadComposite}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download Image
        </button>
      </div>
    </div>
  </div>
</div>
