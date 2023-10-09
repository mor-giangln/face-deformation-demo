import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module'

const DemoScene = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const stats = new Stats()
    document.body.appendChild(stats.dom)

    useEffect(() => {
        // [Scene]
        const scene: THREE.Scene = new THREE.Scene();
        scene.background = new THREE.Color('darkgray');
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // [Camera]
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 30);

        // [Render]
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.setSize(window.innerWidth/2, window.innerHeight/2, false); Keep the size of the app but render it at a lower resolution
        sceneRef.current?.appendChild(renderer.domElement);

        // [Cube]
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(5, 5, 5, 3);
        const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const cube: THREE.Mesh = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // [Sphere]
        const sphereGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(4, 15, 10);
        const sphereMaterial: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
            color: 0x0000FF,
            wireframe: false
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(-10, 10, 0);
        scene.add(sphere);

        // [Plane] (ground)
        const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(30, 30);
        const planeMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -0.5 * Math.PI;
        // scene.add(plane);


        // [Helper]
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);
        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(30);
        scene.add(gridHelper);

        const options = {
            sphereColor: 0x0000FF,
            wireframe: false,
            speed: 0.01
        };

        const gui = new dat.GUI();
        gui.addColor(options, 'sphereColor').onChange(function (e) {
            sphere.material.color.set(e);
        })
        gui.add(options, 'wireframe').onChange(function (e) {
            sphere.material.wireframe = e;
        })
        gui.add(options, 'speed', 0, 0.1);

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        };
        window.addEventListener('resize', handleResize);

        // Animation
        let step = 0;
        const animate = (time: number) => {
            requestAnimationFrame(animate);
            // Auto rotate
            cube.rotation.x = time / 1500;
            cube.rotation.y = time / 1500;

            step += options.speed;
            sphere.position.y = 10 * Math.abs(Math.sin(step));
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }
        animate(1);


        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])

    return <div ref={sceneRef} />
}

export default DemoScene;