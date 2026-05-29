<script lang="ts">
	import favicon from '$lib/assets/favicon.svg?url';
	import './global.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Magic BG Remover - Free Background Remover Online</title>
	<meta name="description" content="Remove image backgrounds automatically and free in 5 seconds. High quality client-side background removal tool, no upload privacy concerns." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<div class="app-container">
	{@render children()}
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
	}
</style>
