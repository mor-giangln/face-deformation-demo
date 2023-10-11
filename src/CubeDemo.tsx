import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';


const DemoScene = () => {
    const sceneRef = useRef<HTMLDivElement>(null);

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    useEffect(() => {
        const debug = document.getElementById('debug1') as HTMLDivElement

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
        const cube: THREE.Mesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5, 3),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));

        // [Sphere]
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(4, 15, 10),
            new THREE.MeshBasicMaterial({
                color: 0x0000FF,
                wireframe: false
            }));
        sphere.position.set(-10, 10, 0);
        scene.add(sphere);

        // [Plane] (ground)
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 30),
            new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            }));
        plane.rotation.x = -0.5 * Math.PI;
        // scene.add(plane);


        // [Helper]
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.addEventListener('change', render);

        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.attach(cube);
        scene.add(transformControls);
        scene.add(cube);
        transformControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        window.addEventListener('mousemove', onMouseMove, false);

        function onMouseMove(event: any) {
            // Calculate mouse coordinates in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            // Update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);
        
            // Check for intersections with the cube
            var intersects = raycaster.intersectObjects([cube]);
        
            // Change cube color if mouse is over it
            if (intersects.length > 0) {
                // cube.material.color.set(0xff0000); // Change color on hover
                if(sceneRef.current){
                    sceneRef.current.style.cursor = 'pointer'
                }
            } else {
                // cube.material.color.set(0x00ff00); // Restore original color
            }
        }


        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(30);
        scene.add(gridHelper);


        const sphereOptions = {
            sphereColor: 0x0000FF,
            wireframe: false,
            speed: 0.01,

            // Geometry
            radius: 1,
            widthSegments: 8,
            heightSegments: 6,
            phiStart: 0,
            phiLength: Math.PI * 2,
            thetaStart: 0,
            thetaLength: Math.PI,
        };

        const gui = new GUI();
        // GUI of Sphere
        const sphereGUI = gui.addFolder('Sphere');
        const sphereRotation = sphereGUI.addFolder('Rotation');
        const spherePosition = sphereGUI.addFolder('Position');
        sphereGUI.addColor(sphereOptions, 'sphereColor').onChange(function (e) {
            sphere.material.color.set(e);
        })
        sphereGUI.add(sphereOptions, 'wireframe').onChange(function (e) {
            sphere.material.wireframe = e;
        })
        sphereGUI.add(sphere, 'visible')
        sphereGUI.add(sphereOptions, 'speed', 0, 0.1);
        sphereRotation.open();
        sphereRotation.add(sphere.rotation, 'x', 0, Math.PI * 2);
        sphereRotation.add(sphere.rotation, 'y', 0, Math.PI * 2);
        sphereRotation.add(sphere.rotation, 'z', 0, Math.PI * 2);
        spherePosition.open();
        spherePosition.add(sphere.position, 'x', -10, 10, 0.1);
        spherePosition.add(sphere.position, 'y', -10, 10, 0.1);
        spherePosition.add(sphere.position, 'z', -10, 10, 0.1);

        // GUI of Cube
        const cubeOptions = {
            width: 1,
            height: 1,
            depth: 1,
            widthSegments: 1,
            heightSegments: 1,
            depthSegments: 1,
        }
        const cubeGUI = gui.addFolder('Cube');
        cubeGUI
            .add(cubeOptions, 'width', 1, 30)
            .onChange(regenerateCube)
        cubeGUI
            .add(cubeOptions, 'height', 1, 30)
            .onChange(regenerateCube)
        cubeGUI
            .add(cubeOptions, 'depth', 1, 30)
            .onChange(regenerateCube)
        cubeGUI
            .add(cubeOptions, 'widthSegments', 1, 30)
            .onChange(regenerateCube)
        cubeGUI
            .add(cubeOptions, 'heightSegments', 1, 30)
            .onChange(regenerateCube)
        cubeGUI
            .add(cubeOptions, 'depthSegments', 1, 30)
            .onChange(regenerateCube)

        function regenerateCube() {
            const newGeometry = new THREE.BoxGeometry(
                cubeOptions.width,
                cubeOptions.height,
                cubeOptions.depth,
                cubeOptions.widthSegments,
                cubeOptions.heightSegments,
                cubeOptions.depthSegments
            );
            cube.geometry.dispose();
            cube.geometry = newGeometry;
        }

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

        // Animation
        let step = 0;
        const animate = (time: number) => {
            requestAnimationFrame(animate);
            // Auto rotate
            // cube.rotation.x = time / 1500;
            // cube.rotation.y = time / 1500;

            step += sphereOptions.speed;
            sphere.position.y = 10 * Math.abs(Math.sin(step));
            sphere.rotation.x = time / 1500;

            const cubeWorldPosition = new THREE.Vector3();
            cube.getWorldPosition(cubeWorldPosition);
            const sphereWorldPosition = new THREE.Vector3();
            sphere.getWorldPosition(sphereWorldPosition);

            if (debug) {
                debug.innerText = 'Sphere\n' +
                    'Local Pos X: ' + sphere.position.x.toFixed(2) +
                    '\n' +
                    'World Pos X: ' + sphereWorldPosition.x.toFixed(2) +
                    '\nCube\n' +
                    'Local Pos X: ' + cube.position.x.toFixed(2) +
                    '\n' +
                    'World Pos X: ' + cubeWorldPosition.x.toFixed(2)
            }

            controls.update();
            stats.update();
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