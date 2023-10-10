import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

import { GUI } from 'dat.gui';

const modelToRender = 'dentist'

const LoadModel = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        const debug = document.getElementById('debug1') as HTMLDivElement;
        // ________________________________________________________________________
        // [Scene]
        const scene: THREE.Scene = new THREE.Scene();
        scene.background = new THREE.Color('darkgray');
        scene.remove();

        // [Camera]
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        //Set how far the camera will be from the 3D model
        camera.position.z = 500;
        // camera.position.y = 700;

        // [Renderer]
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneRef.current?.appendChild(renderer.domElement);
        // renderer.setSize(window.innerWidth/2, window.innerHeight/2, false); Keep the size of the app but render it at a lower resolution

        // Cube
        const cube: THREE.Mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5, 3),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
        );
        cube.position.set(0.10191834484203222, -17.518704193074587, 104.21923445137645)
        scene.add(cube);

        // [Light]
        const topLight = new THREE.DirectionalLight(0xffffff, 1.5); // (color, intensity)
        topLight.position.set(10, 500, 500) //top-left-ish
        topLight.castShadow = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        scene.add(topLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.addEventListener('change', render);
        const transformControls = new TransformControls(camera, renderer.domElement);
        scene.add(transformControls);
        transformControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        })
        transformControls.attach(cube);

        const axesHelper = new THREE.AxesHelper(500);
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(400);
        scene.add(gridHelper);
        const stats = new Stats();
        document.body.appendChild(stats.dom);

        const options = {
            wireframe: false,
            width: 100,
        }
        // const gui = new GUI();


        // Load a 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/face.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // transformControls.attach(loadedModel);

            // const newMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true,  });
            // loadedModel.traverse((child) => {
            //     if (child instanceof THREE.Mesh) {
            //         // Assign the new material to each mesh in the model
            //         child.material = newMaterial;
            //     }
            // })
            // loadedModel.position.set(0, -330, 0);
            scene.add(loadedModel);
            render();
        }, undefined, (error) => {
            console.log('error', error)
        })

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        };
        window.addEventListener('resize', handleResize);

        // Keyboard controls 
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 87: // W
                    transformControls.setMode('translate')
                    break;
                case 69: // E
                    transformControls.setMode('rotate')
                    break;
                case 82: // R
                    transformControls.setMode('scale')
                    break;
                case 187:
                case 107: // +, =, num+
                    transformControls.setSize(transformControls.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    transformControls.setSize(Math.max(transformControls.size - 0.1, 0.1))
                    break;
                case 88: // X
                    transformControls.showX = !transformControls.showX;
                    break;

                case 89: // Y
                    transformControls.showY = !transformControls.showY;
                    break;

                case 90: // Z
                    transformControls.showZ = !transformControls.showZ;
                    break;
                case 32: // Spacebar
                    transformControls.enabled = !transformControls.enabled;
                    break;
            }
        })

        const cubeWorldPosition = new THREE.Vector3();
        cube.getWorldPosition(cubeWorldPosition);

        function animate() {
            requestAnimationFrame(animate);

            if (debug) {
                debug.innerText = 'Cube\n' +
                    'Local Pos X: ' + cube.position.x.toFixed(4) +
                    '\n' +
                    'World Pos X: ' + cubeWorldPosition.x.toFixed(4) +
                    '\nCube\n' +
                    'Local Pos Y: ' + cube.position.y.toFixed(4) +
                    '\n' +
                    'World Pos Y: ' + cubeWorldPosition.z.toFixed(4) +
                    '\nCube\n' +
                    'Local Pos Z: ' + cube.position.z.toFixed(4) +
                    '\n' +
                    'World Pos Z: ' + cubeWorldPosition.z.toFixed(4) +
                    '\nCube\n'
            }
            controls.update();
            stats.update();
        }
        animate();

        function render() {
            renderer.render(scene, camera);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (modelRef.current) {
                scene.remove(modelRef.current);
                render();
            }
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])


    return <div ref={sceneRef} />

}

export default LoadModel;