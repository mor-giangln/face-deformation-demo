import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import landmarks from './landmarksJ.json';
import { GUI } from 'dat.gui';

const modelToRender = 'dentist'

const LoadModel = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        // ________________________________________________________________________
        // [Scene]
        const scene: THREE.Scene = new THREE.Scene();
        scene.background = new THREE.Color('darkgray');
        const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
        // [Background]
        const textureLoader = new THREE.TextureLoader();
        const panoramaTexture = textureLoader.load('./assets/dentist/panorama.jpg')
        const sphereMaterial = new THREE.MeshBasicMaterial({ map: panoramaTexture, side: THREE.BackSide })
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        // scene.add(sphereMesh);

        // [Camera]
        const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        //Set how far the camera will be from the 3D model
        camera.position.z = 180;

        // [Renderer]
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneRef.current?.appendChild(renderer.domElement);

        // [Light]
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5); // (color, intensity)
        topLight.position.set(1000, 1000, 2000) //top-left-ish
        // topLight.castShadow = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);
        scene.add(topLight);

        // Load a 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/untitled.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            console.log('loadmodel =>', loadedModel)
            modelRef.current = loadedModel;
            // Create a wireframe material
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff, wireframe: true,
            });

            // Traverse through all the children of the loaded object
            loadedModel.traverse(function (child) {
                if (child instanceof THREE.Mesh && child.name !== 'teeth') {
                    console.log('child =>', child.name)
                    // Apply the wireframe material to each mesh
                    child.material = wireframeMaterial;
                }
            });
            // transformControls.attach(loadedModel);
            scene.add(loadedModel);
        }, undefined, (error) => {
            console.log('error', error)
        })

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
        // const axesHelper = new THREE.AxesHelper(500);
        // scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(400);
        scene.add(gridHelper);
        const stats = new Stats();
        document.body.appendChild(stats.dom);
        // const gui = new GUI();

        // [FFD] ===========================================================================================
        let ctrl_pt_mesh_selected: any = null;
        const ctrl_pt_meshes: THREE.Mesh[] = [];
        const mTotalCtrlPtCount: THREE.Vector3[] = [];

        // [FFD - Control Points]
        landmarks.landmarks.map((landmark) => {
            const ctrlPoint = landmark.worldPt;
            return mTotalCtrlPtCount.push(new THREE.Vector3(ctrlPoint[0], ctrlPoint[1], ctrlPoint[2]));
        })
        const ctrl_pt_geom = new THREE.SphereGeometry(1, 8, 8);
        const ctrl_pt_material = new THREE.MeshLambertMaterial({ color: 0x4d4dff });
        const ctrl_pt_mesh = new THREE.Mesh(ctrl_pt_geom, ctrl_pt_material);
        ctrl_pt_mesh.position.set(-0.934, -75.393, 102.583);
        scene.add(ctrl_pt_mesh);

        // for (var i = 0; i < mTotalCtrlPtCount.length; i++) {
        //     ctrl_pt_mesh.position.copy(mTotalCtrlPtCount[i]);
        //     ctrl_pt_meshes.push(ctrl_pt_mesh);
        //     scene.add(ctrl_pt_mesh);
        // }

        // [FFD - Lines]
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial(({ color: 0x0000ff }));
        setMyControlPoints();

        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('dblclick', onDocumentMouseDown, false);
        const raycaster = new THREE.Raycaster();

        function onDocumentMouseMove(event: any) {
            event.preventDefault();
            const mouse = {
                x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
                y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
            } as THREE.Vector2
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If the mouse cursor is hovering over a new control point...


            if (intersects.length > 0 && ctrl_pt_mesh_selected != intersects[0].object) {
                // Temporarily change the cursor shape to a fingering cursor.
                if (sceneRef.current) {
                    sceneRef.current.style.cursor = 'pointer'
                }
            }
            else {
                if (sceneRef.current) {
                    sceneRef.current.style.cursor = 'auto'
                }
            }
        }

        function onDocumentMouseDown(event: MouseEvent) {
            event.preventDefault();
            const mouse = {
                x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
                y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
            } as THREE.Vector2
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If a new control point is selected...
            if (intersects.length > 0 && ctrl_pt_mesh_selected !== intersects[0].object) {
                // orbitControls.enabled = false;
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
                transformControls.detach();
            }
        }

        // [FFD] ===========================================================================================


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

        function setMyControlPoints() {
            lineGeometry.setFromPoints([
                mTotalCtrlPtCount[18],
                mTotalCtrlPtCount[0],
                mTotalCtrlPtCount[1],
                mTotalCtrlPtCount[7],
                mTotalCtrlPtCount[1],
                mTotalCtrlPtCount[2],
                mTotalCtrlPtCount[8],
                mTotalCtrlPtCount[2],
                mTotalCtrlPtCount[3],
                mTotalCtrlPtCount[9],
                mTotalCtrlPtCount[3],
                mTotalCtrlPtCount[4],
                mTotalCtrlPtCount[10],
                mTotalCtrlPtCount[4],
                mTotalCtrlPtCount[5],
                mTotalCtrlPtCount[11],
                mTotalCtrlPtCount[5],
                mTotalCtrlPtCount[6],
                mTotalCtrlPtCount[17],
                mTotalCtrlPtCount[11],
                mTotalCtrlPtCount[10],
                mTotalCtrlPtCount[9],
                mTotalCtrlPtCount[8],
                mTotalCtrlPtCount[7],
                mTotalCtrlPtCount[18],
                mTotalCtrlPtCount[16],
                mTotalCtrlPtCount[7],
                mTotalCtrlPtCount[16],
                mTotalCtrlPtCount[15],
                mTotalCtrlPtCount[8],
                mTotalCtrlPtCount[15],
                mTotalCtrlPtCount[14],
                mTotalCtrlPtCount[9],
                mTotalCtrlPtCount[14],
                mTotalCtrlPtCount[13],
                mTotalCtrlPtCount[10],
                mTotalCtrlPtCount[13],
                mTotalCtrlPtCount[12],
                mTotalCtrlPtCount[11],
                mTotalCtrlPtCount[12],
                mTotalCtrlPtCount[17],
                mTotalCtrlPtCount[23],
                mTotalCtrlPtCount[24],
                mTotalCtrlPtCount[23],
                mTotalCtrlPtCount[22],
                mTotalCtrlPtCount[25],
                mTotalCtrlPtCount[22],
                mTotalCtrlPtCount[21],
                mTotalCtrlPtCount[26],
                mTotalCtrlPtCount[21],
                mTotalCtrlPtCount[20],
                mTotalCtrlPtCount[27],
                mTotalCtrlPtCount[20],
                mTotalCtrlPtCount[19],
                mTotalCtrlPtCount[18],
                mTotalCtrlPtCount[28],
                mTotalCtrlPtCount[19],
                mTotalCtrlPtCount[28],
                mTotalCtrlPtCount[27],
                mTotalCtrlPtCount[26],
                mTotalCtrlPtCount[25],
                mTotalCtrlPtCount[24],
                mTotalCtrlPtCount[17],
                mTotalCtrlPtCount[36],
                mTotalCtrlPtCount[35],
                mTotalCtrlPtCount[34],
                mTotalCtrlPtCount[30],
                mTotalCtrlPtCount[33],
                mTotalCtrlPtCount[32],
                mTotalCtrlPtCount[31],
                mTotalCtrlPtCount[0],
                mTotalCtrlPtCount[31],
                mTotalCtrlPtCount[18],
                mTotalCtrlPtCount[28],
                mTotalCtrlPtCount[32],
                mTotalCtrlPtCount[33],
                mTotalCtrlPtCount[27],
                mTotalCtrlPtCount[29],
                mTotalCtrlPtCount[33],
                mTotalCtrlPtCount[29],
                mTotalCtrlPtCount[26],
                mTotalCtrlPtCount[29],
                mTotalCtrlPtCount[30],
                mTotalCtrlPtCount[29],
                mTotalCtrlPtCount[25],
                mTotalCtrlPtCount[29],
                mTotalCtrlPtCount[34],
                mTotalCtrlPtCount[25],
                mTotalCtrlPtCount[24],
                mTotalCtrlPtCount[35],
                mTotalCtrlPtCount[36],
                mTotalCtrlPtCount[6],
            ]);
        }

        function animate() {
            requestAnimationFrame(animate);
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
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])


    return <div ref={sceneRef} />

}

export default LoadModel;