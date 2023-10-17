import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import landmarks from './landmarks.json';

const modelToRender = 'dentist'

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
        camera.position.z = 180;
        camera.position.y = -100;

        // [Renderer]
        const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneRef.current?.appendChild(renderer.domElement);
        // renderer.setSize(window.innerWidth/2, window.innerHeight/2, false); Keep the size of the app but render it at a lower resolution

        // [Light]
        const topLight = new THREE.DirectionalLight(0xffffff, 0.5); // (color, intensity)
        topLight.position.set(1000, 1000, 2000) //top-left-ish
        // topLight.castShadow = true;
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
        // scene.add(axesHelper);
        // const gridHelper = new THREE.GridHelper(400);
        // scene.add(gridHelper);
        const stats = new Stats();
        document.body.appendChild(stats.dom);
        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        const raycaster = new THREE.Raycaster();

        // Load a 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/face.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // transformControls.attach(loadedModel);
            // scene.add(loadedModel);
        }, undefined, (error) => {
            console.log('error', error)
        })

        // [FFD]
        let ctrl_pt_mesh_selected: any = null;
        const ctrl_pt_meshes: THREE.Mesh[] = [];

        const mTotalCtrlPtCount: THREE.Vector3[] = [];
        const latticeVertices: any[] = [];

        // [FFD - Control Points]
        landmarks.landmarks.map((landmark) => {
            const ctrlPoint = landmark.worldPt;
            return mTotalCtrlPtCount.push(new THREE.Vector3(ctrlPoint[0], ctrlPoint[1], ctrlPoint[2]));
        })
        const ctrl_pt_geom = new THREE.SphereGeometry(1, 32, 32);
        const ctrl_pt_material = new THREE.MeshLambertMaterial({ color: 0x4d4dff });
        for (var i = 0; i < mTotalCtrlPtCount.length; i++) {
            const ctrl_pt_mesh = new THREE.Mesh(ctrl_pt_geom, ctrl_pt_material);
            ctrl_pt_mesh.position.copy(mTotalCtrlPtCount[i]);
            ctrl_pt_meshes.push(ctrl_pt_mesh);
            scene.add(ctrl_pt_mesh);
        }

        // const latticePoints: THREE.Vector3[] = createLatticePoints(mTotalCtrlPtCount, segments);
        // const lattice_line_geom: THREE.BufferGeometry = new THREE.BufferGeometry();
        // const positions = new Float32Array(latticePoints.length * 3);
        // for (let i = 0; i < latticePoints.length; i++) {
        //     positions[i * 3] = latticePoints[i].x;
        //     positions[i * 3 + 1] = latticePoints[i].y;
        //     positions[i * 3 + 1] = latticePoints[i].z;
        // }

        // lattice_line_geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        // const lattice_line_material = new THREE.LineBasicMaterial({ color: 0x4d4dff });
        // const lattice = new THREE.LineSegments(lattice_line_geom, lattice_line_material);
        // scene.add(lattice);

        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial(({ color: 0x0000ff }))
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
        // lineGeometry.setFromPoints(mTotalCtrlPtCount);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);

        function onDocumentMouseMove(event: any) {
            event.preventDefault();
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If the mouse cursor is hovering over a new control point...


            if (intersects.length > 0 && ctrl_pt_mesh_selected != intersects[0].object) {
                // Temporarily change the cursor shape to a fingering cursor.
                if(sceneRef.current){
                    sceneRef.current.style.cursor = 'pointer'
                }
            }
            else {
                if (sceneRef.current) {
                    sceneRef.current.style.cursor = 'auto'
                }
            }
        }

        function onDocumentMouseDown(event: any) {
            event.preventDefault();
            console.log('down')
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(ctrl_pt_meshes);
            // If a new control point is selected...
            if (intersects.length > 0 && ctrl_pt_mesh_selected != intersects[0].object) {
                console.log('here')
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


    return <div ref={sceneRef} id='debug' />

}

export default LoadModel;