import { Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const LoadModel: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [modelToRender, setModelToRender] = useState<string>('angelica');
    // ________________________________________________________________________
    
    // Create scene
    const scene: THREE.Scene = new THREE.Scene();
    scene.background = new THREE.Color('darkgray');
    scene.remove();

    // Create camera
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //Set how far the camera will be from the 3D model
    camera.position.z = 500;
    // camera.position.y = 700;

    // Create renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create light
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5); // (color, intensity)
    topLight.position.set(10, 500, 500) //top-left-ish
    topLight.castShadow = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    scene.add(topLight);

    new OrbitControls(camera, renderer.domElement);
    const axesHelper = new THREE.AxesHelper(200);
    scene.add(axesHelper);

    // Load a 3D model (GLTF)
    const loader = new GLTFLoader();
    loader.load(`./assets/${modelToRender}/scene.gltf`, (gltf) => {
        gltf.scene.position.setY(-350)
        scene.add(gltf.scene);
    }, undefined, (error) => {
        console.log('error', error)
    })

    // ________________________________________________________________________

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

    // Render the scene
    useEffect(() => {
        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            // Auto rotate

            renderer.render(scene, camera);
        }

        animate();

    }, [])

    const handleChange = (value: string) => {
        loader.load(`./assets/${value}/scene.gltf`, (gltf) => {
            scene.add(gltf.scene);
        }, undefined, (error) => {
            console.log('error', error)
        })
    };

    return <>
        <div style={{ marginBottom: 20 }}>
            Model:
            <Select
                style={{ width: 120 }}
                onChange={handleChange}
                value={modelToRender}
                options={[
                    { value: 'angelica', label: 'Angelica' },
                    { value: 'dino', label: 'Dinosaur' },
                    { value: 'eye', label: 'Eye' },
                    { value: 'face', label: 'Dallas' },
                ]}
            />
        </div>
        <div ref={sceneRef} />
    </>

}

export default LoadModel;