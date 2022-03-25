import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import imagesLoaded from 'imagesloaded';
import ASScroll from '@ashthornton/asscroll';

// Shaders
import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';
import perlinNoise from '../shaders/perlin-noise.glsl';

// Images
import checker from '../../images/checker.png';

class RunThreeJs {
    constructor(options) {
        this.time = 0;
        this.dom = options.dom;
        this.materials = [];
        this.imageStore = [];
        this.planeSegments = 100;
        this.cornerAnimationDuration = 0.4;

        this.width = this.dom.offsetWidth;
        this.height = this.dom.offsetHeight;

        // this.geometry = new THREE.PlaneBufferGeometry(1, 1, this.planeSegments, this.planeSegments);
        this.geometry = new THREE.PlaneBufferGeometry(1, 1, this.planeSegments, this.planeSegments);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                uImage: { value: new THREE.TextureLoader().load(checker) }
            },
            side: THREE.DoubleSide,
            vertexShader: perlinNoise + vertex,
            fragmentShader: fragment,
            wireframe: false
        });

        // setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 100, 2000);
        this.camera.position.z = 600;
        this.updateCameraFOV();

        // collisions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.width, this.height);
        this.dom.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.images = [...document.querySelectorAll('.js-image')];

        // Preload images
        const preloadImages = new Promise((resolve, reject) => {
            imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
        });

        const allPromises = [preloadImages];

        Promise.all(allPromises).then(() => {
            this.setupSettings();
            this.addObjects();
            // this.addImages();
            // this.setPositions();
            this.resize();
            this.events();
            this.render();
        });
    }

    updateCameraFOV() {
        this.camera.fov = 2 * Math.atan((this.height / 2) / this.camera.position.z) * (180 / Math.PI);
    }

    addObjects() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    setupSettings() {
        // this.settings = {
        //     progress: 0
        // };

        // this.gui = new dat.GUI();
        // this.gui.add(this.settings, 'progress', 0, 1, 0.001);
    }

    addImages() {
        this.imageStore = this.images.map(img => {
            const material = this.material.clone();
            const { top, left, height, width } = img.getBoundingClientRect();
            const texture = new THREE.TextureLoader().load(img.src);

            texture.needsUpdate = true;

            material.uniforms.uImage.value = texture;
            const mesh = new THREE.Mesh(this.geometry, material);

            this.materials.push(material);
            mesh.scale.set(width, height, 1);

            this.scene.add(mesh);

            img.addEventListener('click', e => {
                this.tl = gsap.timeline()
                    .to(material.uniforms.uCorners.value, {
                        x: 1,
                        duration: this.cornerAnimationDuration,
                    })
                    .to(material.uniforms.uCorners.value, {
                        y: 1,
                        duration: this.cornerAnimationDuration,
                    }, 0.1)
                    .to(material.uniforms.uCorners.value, {
                        z: 1,
                        duration: this.cornerAnimationDuration,
                    }, 0.2)
                    .to(material.uniforms.uCorners.value, {
                        w: 1,
                        duration: this.cornerAnimationDuration,
                    }, 0.3);
            });

            return { img, mesh, top, left, width, height };
        });
    }

    setPositions() {
        this.imageStore.forEach(o => {
            // check if image is visible
            o.mesh.position.y = - o.top + this.height / 2 - o.height / 2;
            o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
        });
    }

    events() {
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
    }

    render() {
        this.time += 0.05;

        // this.setPositions();

        this.renderer.render(this.scene, this.camera);

        // For postprocess use
        // this.composer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

export default RunThreeJs;