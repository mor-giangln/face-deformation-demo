import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

const DemoScene: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null);

    // Create scene
    const scene: THREE.Scene = new THREE.Scene();
    scene.background = new THREE.Color('darkgray');
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Create camera
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 30);

    // Create renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Add a geometry for testing
    // BOX
    const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(5, 5, 5);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const cube: THREE.Mesh = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // SPHERE
    const sphereGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(4, 10, 10);
    const sphereMaterial: THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
        color: 0x0000FF,
        wireframe: false
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    let step = 0;
    sphere.position.set(-10, 10, 0);
    scene.add(sphere);

    // PLANE (ground)
    const planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(30, 30);
    const planeMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF,
        side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
    plane.rotation.x = -0.5 * Math.PI;


    new OrbitControls(camera, renderer.domElement);
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    const gridHelper = new THREE.GridHelper(30);
    scene.add(gridHelper);
    const gui = new dat.GUI();
    const options = {
        sphereColor: '#ffea00',
        wireframe: false,
        speed: 0.01
    };
    gui.addColor(options, 'sphereColor').onChange(function (e) {
        sphere.material.color.set(e);
    })
    gui.add(options, 'wireframe').onChange(function(e) {
        sphere.material.wireframe = e;
    })
    gui.add(options, 'speed', 0, 0.01);

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
        const animate = (time: number) => {
            // requestAnimationFrame(animate);
            // Auto rotate
            cube.rotation.x = time / 1500;
            cube.rotation.y = time / 1500;

            step += options.speed;
            sphere.position.y = 10 * Math.abs(Math.sin(step));

            renderer.render(scene, camera);
        }
        renderer.setAnimationLoop(animate)

        // animate();
    }, [])


    return <div ref={sceneRef} />
}

export default DemoScene;