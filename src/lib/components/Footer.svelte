<footer class="bg-[var(--color-bg-card)] border-t border-[var(--color-border-color)] px-6 py-16 mt-auto transition-all duration-300">
  <div class="max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between gap-16 flex-wrap">
      <!-- Brand Column -->
      <div class="flex-1 min-w-[280px]">
        <div class="flex items-center gap-2 text-xl font-extrabold text-[var(--color-text-main)] mb-4">
          <svg class="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 4V2m0 4h2m-2 0H9c-1.5 0-3 1.5-3 3v8c0 1.5 1.5 3 3 3h6c1.5 0 3-1.5 3-3V9c0-1.5-1.5-3-3-3Zm0 0V4" />
            <path d="m3 10 3 3m0 0 2-2M6 13l-2 2M9.5 14h5M12 11.5v5" />
          </svg>
          <span>Magic <span class="bg-gradient-to-r from-primary to-[#298dff] bg-clip-text text-transparent">BG</span></span>
        </div>
        <p class="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-[320px]">
          Fast, free, and secure background removal running entirely in your browser. Powered by client-side WebAssembly AI.
        </p>
      </div>

      <!-- Links Grid -->
      <div class="flex-[2] grid grid-cols-2 sm:grid-cols-3 gap-8 min-w-[300px]">
        <div class="flex flex-col">
          <h4 class="text-[var(--color-text-main)] text-sm font-bold mb-4 uppercase tracking-wider">Tools</h4>
          <a href="/" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Background Remover</a>
          <a href="#editor" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Photo Editor</a>
          <a href="#pricing" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">API & Pricing</a>
        </div>
        <div class="flex flex-col">
          <h4 class="text-[var(--color-text-main)] text-sm font-bold mb-4 uppercase tracking-wider">Support</h4>
          <a href="#help" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Help Center</a>
          <a href="#terms" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Terms of Service</a>
          <a href="#privacy" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Privacy Policy</a>
        </div>
        <div class="flex flex-col col-span-2 sm:col-span-1">
          <h4 class="text-[var(--color-text-main)] text-sm font-bold mb-4 uppercase tracking-wider">Company</h4>
          <a href="#about" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">About Us</a>
          <a href="#blog" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Blog</a>
          <a href="#careers" class="text-[var(--color-text-muted)] hover:text-primary text-sm mb-3 transition-colors">Careers</a>
        </div>
      </div>
    </div>

    <hr class="border-0 border-t border-[var(--color-border-color)] my-12" />

    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <p class="text-[var(--color-text-muted)] text-sm">&copy; {new Date().getFullYear()} Magic BG. All rights reserved.</p>
      <div class="flex gap-4">
        <a href="#twitter" class="text-[var(--color-text-muted)] hover:text-primary transition-colors" aria-label="Twitter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
        </a>
        <a href="#github" class="text-[var(--color-text-muted)] hover:text-primary transition-colors" aria-label="GitHub">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
