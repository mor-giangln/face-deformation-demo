import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import React, { useRef } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Define a functional component for the 3D scene
const Angelica: React.FC = () => {
    // Create a ref to hold the loaded 3D model
    const modelRef = useRef<any>();
    const gltf = useLoader(GLTFLoader, './assets/angelica/scene.gltf');

    // Load the 3D model using useGLTF hook
    // const { scene } = useGLTF('./assets/angelica/scene.gltf');

    return (
        <Canvas>
            {/* Set up lights, camera, and controls as needed */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />

            {/* Add the loaded 3D model to the scene */}
            <primitive object={gltf.scene} ref={modelRef} />
        </Canvas>
    );
};

export default Angelica;