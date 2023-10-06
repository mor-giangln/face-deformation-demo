import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const DemoScene: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null);

    // Create scene
    const scene: THREE.Scene = new THREE.Scene();
    scene.background = new THREE.Color('darkgray');
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Create camera
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add a cube for testing
    const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube: THREE.Mesh = new THREE.Mesh(geometry, material);
    scene.add(cube);
    new OrbitControls(camera, renderer.domElement)

    useEffect(() => {
        sceneRef.current?.appendChild(renderer.domElement);
        // renderer.setSize(window.innerWidth/2, window.innerHeight/2, false); Keep the size of the app but render it at a lower resolution

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);


        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])

    useEffect(() => {
        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            // Auto rotate
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            renderer.render(scene, camera);
        }

        animate();
    }, [])

    return <div ref={sceneRef} />
}

export default DemoScene;