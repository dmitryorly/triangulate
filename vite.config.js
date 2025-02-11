import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('vite').UserConfig} */
export default defineConfig({
	base: '/triangulate/',
	root: './src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'src/index.html'),
				displacement: resolve(__dirname, 'src/displacement.html'),
				randomize: resolve(__dirname, 'src/randomize.html')
			}
		}
	}
})
