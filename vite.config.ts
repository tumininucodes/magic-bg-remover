import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],

	// Exclude transformers.js from Vite pre-bundling — it manages its own
	// WASM/ONNX runtime and must be served as-is from node_modules.
	optimizeDeps: {
		exclude: ['@huggingface/transformers']
	},

	server: {
		headers: {
			// Required for SharedArrayBuffer (used by transformers.js for multi-threading)
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'credentialless'
		}
	},
	preview: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'credentialless'
		}
	}
});
