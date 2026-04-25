import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true, // Enable PWA in dev mode for testing
				type: 'module'
			},
			manifest: {
				name: 'Sistema de Vaquejada',
				short_name: 'Vaquejada',
				description: 'Sistema para gerenciamento de vaquejadas',
				theme_color: '#ffffff',
				icons: [
					{
						src: 'favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
			}
		})
	]
});
