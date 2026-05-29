import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// adapter-static generates a pure static site — no serverless functions.
		// This is correct for a fully client-side app and avoids Vercel's 250MB function limit.
		adapter: adapter({
			// fallback to index.html enables SPA-style client-side routing
			fallback: 'index.html'
		})
	}
};

export default config;
