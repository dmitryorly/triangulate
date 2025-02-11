import {
	Scene,
	WebGLRenderer,
	PerspectiveCamera,
	ACESFilmicToneMapping,
	Clock,
	PointLight, DirectionalLight, BufferAttribute, Vector2
} from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import detailsUrl from '/sphere.glb?url'

main()

async function main() {
	const container = document.querySelector('#container')
	const canvas = document.querySelector('#canvas')

	let width = container.offsetWidth
	let height = container.offsetHeight

	const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
	renderer.setSize(width, height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	renderer.toneMapping = ACESFilmicToneMapping
	renderer.toneMappingExposure = 1
	renderer.setClearAlpha(0)

	const clock = new Clock()
	const scene = new Scene()
	const pointer = new Vector2()
	const camera = new PerspectiveCamera(45, width / height, 0.01, 50)
	camera.position.set(0, 0, 5)
	const controls = new OrbitControls(camera, canvas)
	controls.enableDamping = true

	const [model] = await Promise.all([loadModel(detailsUrl)])

	scene.add(model)

	/**
	 * @type {import('three').Mesh}
	 */
	const mesh = model.children[0]
	// Convert to non-indexed geometry
	mesh.geometry = mesh.geometry.toNonIndexed()
	const position = mesh.geometry.getAttribute('position')
	const initialPosition = new BufferAttribute().copy(position)
	const normal = mesh.geometry.getAttribute('normal')

	// Add random shifts for each triangle
	const triangleCount = position.count / 3
	const randomShifts = new Float32Array(triangleCount)
	for (let i = 0; i < triangleCount; i++) {
		randomShifts[i] = Math.random() * 0.5 + 0.5 // Random value between 0.5 and 1
	}

	const sunLight = new DirectionalLight(0xabadaf, 0.5)
	sunLight.position.set(-10, 0, -10)
	scene.add(sunLight)

	const fillLight = new PointLight(0xc3c3c3, 20)
	fillLight.position.set(1, 2, 1.8)
	scene.add(fillLight)

	window.scene = scene
	window.addEventListener('resize', resize)
	window.addEventListener('pointermove', pointermove)
	renderer.setAnimationLoop(update)

	function update() {
		const a = -1.1
		const b = 0
		const c = -0.1
		const progress = 2 * Math.abs(pointer.x) * Math.max(0, Math.abs(a * pointer.x + b) + c)

		for (let i = 0; i < position.count; i++) {
			const triangleIndex = Math.floor(i / 3)
			const randomShift = randomShifts[triangleIndex]

			const x = initialPosition.getX(i) + progress * normal.getX(i) * randomShift
			const y = initialPosition.getY(i) + progress * normal.getY(i) * randomShift
			const z = initialPosition.getZ(i) + progress * normal.getZ(i) * randomShift

			position.setXYZ(i, x, y, z)
		}
		position.needsUpdate = true

		controls.update(clock.getDelta())
		renderer.render(scene, camera)
	}

	function resize() {
		width = container.offsetWidth
		height = container.offsetHeight

		camera.aspect = width / height
		camera.updateProjectionMatrix()
		renderer.setSize(width, height)
	}

	function pointermove(e) {
		pointer.x = 2 * (e.clientX / width - 0.5)
		pointer.y = -2 * (e.clientY / height - 0.5)
	}
}

async function loadModel(url) {
	const loader = new GLTFLoader()
	const result = await loader.loadAsync(url)
	return result.scene
}
