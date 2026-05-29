/**
 * Background removal using @huggingface/transformers + briaai/RMBG-1.4
 *
 * This replaces @imgly/background-removal entirely. It uses Transformers.js
 * which bundles its own compatible ONNX runtime — no version conflicts possible.
 *
 * Model: briaai/RMBG-1.4
 * - Purpose-built for background removal (people, products, animals)
 * - ~170MB download, cached in browser IndexedDB after first load
 * - Runs fully client-side
 */

import {
	AutoModel,
	AutoProcessor,
	RawImage,
	type PreTrainedModel,
	type Processor
} from '@huggingface/transformers';

// Singleton model/processor to avoid re-loading on repeated use
let model: PreTrainedModel | null = null;
let processor: Processor | null = null;
let loadingPromise: Promise<void> | null = null;

const MODEL_ID = 'briaai/RMBG-1.4';

export type ProgressCallback = (stage: 'loading' | 'processing', percent: number) => void;

/**
 * Pre-load the model. Call this early (e.g. on page mount) to warm up.
 * Subsequent calls return immediately — the model is only loaded once.
 */
export async function loadModel(onProgress?: ProgressCallback): Promise<void> {
	if (model && processor) return;
	if (loadingPromise) return loadingPromise;

	loadingPromise = (async () => {
		onProgress?.('loading', 0);

		// Track file download progress
		const progressCallback = (info: { status: string; progress?: number; file?: string }) => {
			if (info.status === 'progress' && info.progress !== undefined) {
				onProgress?.('loading', Math.round(info.progress));
			}
		};

		[model, processor] = await Promise.all([
			// @ts-ignore — progress_callback is valid but TS types may lag behind API
			AutoModel.from_pretrained(MODEL_ID, { progress_callback: progressCallback }),
			AutoProcessor.from_pretrained(MODEL_ID)
		]);

		onProgress?.('loading', 100);
	})();

	return loadingPromise;
}

/**
 * Remove the background from an image.
 *
 * @param source - A File object or a URL string
 * @param onProgress - Optional progress callback
 * @returns A Blob containing the result PNG with transparent background
 */
export async function removeBackground(
	source: File | string,
	onProgress?: ProgressCallback
): Promise<Blob> {
	// Ensure model is loaded
	await loadModel(onProgress);

	if (!model || !processor) {
		throw new Error('Model failed to initialize');
	}

	onProgress?.('processing', 10);

	// Load the image
	let image: RawImage;
	if (source instanceof File) {
		const url = URL.createObjectURL(source);
		try {
			image = await RawImage.fromURL(url);
		} finally {
			URL.revokeObjectURL(url);
		}
	} else {
		image = await RawImage.fromURL(source);
	}

	onProgress?.('processing', 30);

	// Pre-process the image
	const { pixel_values } = await processor(image);

	onProgress?.('processing', 50);

	// Run inference
	const { output } = await model({ input: pixel_values });

	onProgress?.('processing', 80);

	// Post-process: resize mask back to original image dimensions
	const maskData = (
		await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height)
	).data;

	// Composite: original RGB + alpha mask → RGBA canvas
	const canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not get canvas 2D context');

	// Draw original image
	const imgElement = document.createElement('img');
	imgElement.src = source instanceof File ? URL.createObjectURL(source) : source;
	await new Promise<void>((resolve, reject) => {
		imgElement.onload = () => resolve();
		imgElement.onerror = reject;
	});
	ctx.drawImage(imgElement, 0, 0, image.width, image.height);

	// Apply alpha mask
	const imageData = ctx.getImageData(0, 0, image.width, image.height);
	const pixels = imageData.data;
	for (let i = 0; i < maskData.length; i++) {
		pixels[i * 4 + 3] = maskData[i]; // set alpha channel
	}
	ctx.putImageData(imageData, 0, 0);

	onProgress?.('processing', 100);

	// Revoke any object URL we created for the img element
	if (source instanceof File && imgElement.src.startsWith('blob:')) {
		URL.revokeObjectURL(imgElement.src);
	}

	// Return as PNG blob
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error('Failed to create image blob'));
			},
			'image/png',
			1.0
		);
	});
}
