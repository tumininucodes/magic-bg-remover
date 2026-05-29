// Disable SSR for the entire app — this is a fully client-side app.
// Prevents @huggingface/transformers (+ WASM binaries) from being
// bundled into Vercel's serverless functions, which would exceed the 250MB limit.
export const ssr = false;
