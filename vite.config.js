import { defineConfig } from 'vite'

/** @type {import('vite').UserConfig} */
export default defineConfig({
	base: '/triangulate/',
	build: {
		rollupOptions: {
			input: {
				'index': './index.html',
				'displacement': './displacement.html'
			}
		}
	}
})
