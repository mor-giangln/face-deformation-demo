import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import landmarks from './landmarks.json';

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
        camera.position.z = 350;
        // camera.position.y = 700;

        // [Renderer]
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneRef.current?.appendChild(renderer.domElement);
        // renderer.setSize(window.innerWidth/2, window.innerHeight/2, false); Keep the size of the app but render it at a lower resolution

        // Cube
        // const cube: THREE.Mesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(5, 5, 5, 3),
        //     new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
        // );
        // cube.position.set(0.10191834484203222, -17.518704193074587, 104.21923445137645)
        // scene.add(cube);

        // [Light]
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5); // (color, intensity)
        topLight.position.set(10, 500, 500) //top-left-ish
        topLight.castShadow = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.add(topLight);

        // [Controls]
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.addEventListener('change', render);

        const transformControls = new TransformControls(camera, renderer.domElement);
        scene.add(transformControls);
        transformControls.addEventListener('dragging-changed', function (event) {
            orbitControls.enabled = !event.value;
        })

        // [Helper]
        const axesHelper = new THREE.AxesHelper(500);
        scene.add(axesHelper);
        // const gridHelper = new THREE.GridHelper(400);
        // scene.add(gridHelper);
        const stats = new Stats();
        document.body.appendChild(stats.dom);
        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Load a 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/face.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // transformControls.attach(loadedModel);
            scene.add(loadedModel);
        }, undefined, (error) => {
            console.log('error', error)
        })

        // [FFD]
        let ctrl_pt_mesh_selected: any = null;
        const ctrl_pt_meshes: THREE.Mesh[] = [];

        const mTotalCtrlPtCount: THREE.Vector3[] = [];
        landmarks.landmarks.map((landmark) => {
            const ctrlPoint = landmark.worldPt;
            return mTotalCtrlPtCount.push(new THREE.Vector3(ctrlPoint[0], ctrlPoint[1], ctrlPoint[2]));
        })
        const ctrl_pt_geom = new THREE.SphereGeometry(1.25, 32, 32);
        const ctrl_pt_material = new THREE.MeshLambertMaterial({ color: 0x4d4dff });
        for (var i = 0; i < mTotalCtrlPtCount.length; i++) {
            const ctrl_pt_mesh = new THREE.Mesh(ctrl_pt_geom, ctrl_pt_material);
            ctrl_pt_mesh.position.copy(mTotalCtrlPtCount[i]);
            ctrl_pt_meshes.push(ctrl_pt_mesh);
            scene.add(ctrl_pt_mesh);
        }
        const lattice_line_material = new THREE.LineBasicMaterial({ color: 0x4d4dff });
        const lattice_line_geom = new THREE.SphereGeometry(1, 1, 1, 1, 1, 1).setFromPoints(mTotalCtrlPtCount);
        const line = new THREE.Line(lattice_line_geom, lattice_line_material);
        scene.add(line);

        function onDocumentMouseMove(event: any) {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If the mouse cursor is hovering over a new control point...


            if (intersects.length > 0 && ctrl_pt_mesh_selected != intersects[0].object) {
                // Temporarily change the cursor shape to a fingering cursor.
                // if(sceneRef.current){
                //     sceneRef.current.style.cursor = 'pointer'
                // }
            }
            else {
                // if (sceneRef.current) {
                //     sceneRef.current.style.cursor = 'auto'
                // }
            }
        }

        function onDocumentMouseDown(event: any) {
            console.log('down')
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If a new control point is selected...
            if (intersects.length > 0 && ctrl_pt_mesh_selected != intersects[0].object) {
                orbitControls.enabled = false;
                // If a control point was selected before, detach it from the transform control.
                if (ctrl_pt_mesh_selected)
                    transformControls.detach();
                // Remember the new selection to avoid reselecting the same one.
                ctrl_pt_mesh_selected = intersects[0].object;
                // Attach the newly selected control point to the transform control.
                transformControls.attach(ctrl_pt_mesh_selected);
            }
            else {
                // Enable the orbit control so that the user can pan/rotate/zoom. 
                orbitControls.enabled = true;
            }
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

        // const cubeWorldPosition = new THREE.Vector3();
        // cube.getWorldPosition(cubeWorldPosition);

        function animate() {
            requestAnimationFrame(animate);

            // if (debug) {
            //     debug.innerText = 'Cube\n' +
            //         'Local Pos X: ' + cube.position.x.toFixed(4) +
            //         '\n' +
            //         'World Pos X: ' + cubeWorldPosition.x.toFixed(4) +
            //         '\nCube\n' +
            //         'Local Pos Y: ' + cube.position.y.toFixed(4) +
            //         '\n' +
            //         'World Pos Y: ' + cubeWorldPosition.z.toFixed(4) +
            //         '\nCube\n' +
            //         'Local Pos Z: ' + cube.position.z.toFixed(4) +
            //         '\n' +
            //         'World Pos Z: ' + cubeWorldPosition.z.toFixed(4)
            // }
            orbitControls.update();
            stats.update();
            render();
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