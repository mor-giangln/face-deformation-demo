import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const modelToRender = 'angelica'

const LoadModel = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
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

        // [Light]
        const topLight = new THREE.DirectionalLight(0xffffff, 1.5); // (color, intensity)
        topLight.position.set(10, 500, 500) //top-left-ish
        topLight.castShadow = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        scene.add(topLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);
        const axesHelper = new THREE.AxesHelper(500);
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(400);
        scene.add(gridHelper);

        const options = {
            wireframe: false,
            width: 100,
        }
        const gui = new dat.GUI();
        gui.add(options, 'wireframe').onChange(function (e) {
            console.log(e);
            // const newMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true,  });
            // if(modelRef.current){
            //     modelRef.current.traverse((child) => {
            //         if (child instanceof THREE.Mesh) {
            //             // Assign the new material to each mesh in the model
            //             child.material = newMaterial;
            //             render();
            //         }
            //     })
            // }
        })

        // Load a 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/scene.gltf`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // const newMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true,  });
            // loadedModel.traverse((child) => {
            //     if (child instanceof THREE.Mesh) {
            //         // Assign the new material to each mesh in the model
            //         child.material = newMaterial;
            //     }
            // })
            loadedModel.position.set(0, -330, 0);
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