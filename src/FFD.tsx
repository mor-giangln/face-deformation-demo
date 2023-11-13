import { GUI } from 'dat.gui';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { computeMorphedAttributes } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { meshOptions, morphOptions, sphereOptions } from './Constant';
import landmarksIndex from './landmarksIndex.json';

const modelToRender = 'dentist';

export default function FFD() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    let faceMesh: THREE.Mesh;
    let ffdRadius: number = meshOptions.radius;

    // [Scene]
    const scene: THREE.Scene = new THREE.Scene();
    scene.background = new THREE.Color('darkgray');

    // [Background]
    const textureLoader = new THREE.TextureLoader();
    const panoramaTexture = textureLoader.load('./assets/dentist/panorama2.jpg');
    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: panoramaTexture, side: THREE.BackSide });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.rotateY(-250);
    scene.add(sphereMesh);

    // [Camera]
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300; //Set how far the camera will be from the 3D model

    // [Renderer]
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // [Light]
    const topLight = new THREE.DirectionalLight(0xffffff, 3);
    topLight.position.set(0, 0, 400) //top-left-ish
    topLight.castShadow = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    scene.add(topLight);

    // [Controls]
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.addEventListener('change', render);

    // [Helper]
    // const axesHelper = new THREE.AxesHelper(500);
    // scene.add(axesHelper);
    // const gridHelper = new THREE.GridHelper(400);
    // scene.add(gridHelper);
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // [GUI]
    const gui = new GUI();
    gui.width = 450;

    const meshGUI = gui.addFolder('Face Mesh');
    const ctrlPointGUI = gui.addFolder('Control Point');
    meshGUI.open();
    meshGUI
        .add(meshOptions, 'wireframe')
        .onChange((e) => {
            if (e) {
                (faceMesh.material as THREE.MeshBasicMaterial).wireframe = true;
            } else {
                (faceMesh.material as THREE.MeshBasicMaterial).wireframe = false;
            }
        })
    meshGUI
        .addColor(meshOptions, 'color')
        .onChange((value) => {
            (faceMesh.material as THREE.MeshBasicMaterial).color = new THREE.Color(value);
        })
    meshGUI
        .add(meshOptions, 'radius', 10, 2000, 1)
        .onChange((value) => {
            ffdRadius = value;
        })
    ctrlPointGUI
        .addColor(meshOptions, 'color')
        .onChange((e) => {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: e
            });
            faceMesh.traverse((item) => {
                if (item instanceof THREE.Mesh && item.parent?.name === 'controlPoints') {
                    item.material = wireframeMaterial
                }
            })
        })
    ctrlPointGUI
        .add(sphereOptions, 'width', 0.5, 10)
        .onChange(regenerateSphere)
    ctrlPointGUI
        .add(sphereOptions, 'height', 32, 64)
        .onChange(regenerateSphere)
    ctrlPointGUI
        .add(sphereOptions, 'depth', 32, 64)
        .onChange(regenerateSphere)
    ctrlPointGUI
        .add(sphereOptions, 'widthSegments', 1, 10)
        .onChange(regenerateSphere)
    ctrlPointGUI
        .add(sphereOptions, 'heightSegments', 1, 10)
        .onChange(regenerateSphere)
    ctrlPointGUI
        .add(sphereOptions, 'depthSegments', 1, 10)
        .onChange(regenerateSphere)

    function regenerateSphere() {
        const newGeometry = new THREE.SphereGeometry(
            sphereOptions.width,
            sphereOptions.height,
            sphereOptions.depth,
            sphereOptions.widthSegments,
            sphereOptions.heightSegments,
            sphereOptions.depthSegments,
        );
        faceMesh.traverse((item) => {
            if (item instanceof THREE.Mesh && item.parent?.name === 'controlPoints') {
                item.geometry.dispose();
                item.geometry = newGeometry;
            }
        })
    }

    function render() {
        renderer.render(scene, camera);
    }

    useEffect(() => {
        sceneRef.current?.appendChild(renderer.domElement);
        let points: THREE.Vector3[] = []; // Points of mesh (faceMesh)
        let vertices: THREE.Vector3[] = []; // Vertices of mesh (faceMesh)

        // Load 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/faceShapeKeysWithReset.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // Traverse through all the children of the loaded object
            loadedModel.traverse(function (child) {
                if (child instanceof THREE.Mesh && child.name === 'face') {
                    faceMesh = child; // Save face Mesh
                    // (faceMesh.material as THREE.MeshBasicMaterial).wireframe = true;
                    generatePoints(); // Generate Control Points
                }
            });
            // transformControls.attach(loadedModel);
            scene.add(loadedModel);
        }, undefined, (error) => {
            console.log('error', error)
        })

        const transformControls = new TransformControls(camera, renderer.domElement);
        transformControls.size = 0.5;
        scene.add(transformControls);
        transformControls.addEventListener('dragging-changed', function (event) {
            orbitControls.enabled = !event.value;
        });
        transformControls.addEventListener('objectChange', function (event) {
            transformMesh(event.target);
        });

        // ============================================== [MORPH] ==============================================
        let morphChange = (type: number, value: number) => {
            removePoints(); // Remove old control points
            if (faceMesh.morphTargetInfluences) {
                faceMesh.morphTargetInfluences[type] = value;
            }
        };
        meshGUI.add(morphOptions, 'upperLips', 0, 1, 0.01)
            .onChange((value) => morphChange(0, value))
            .onFinishChange(async (finishvalue) => {
                let morphed: any = computeMorphedAttributes(faceMesh);

                await updateMorphedMesh(morphed);
                generatePoints(morphed);
            });
        meshGUI.add(morphOptions, 'lowerLips', 0, 1, 0.01)
            .onChange((value) => morphChange(1, value))
            .onFinishChange(async (finishvalue) => {
                let morphed: any = computeMorphedAttributes(faceMesh);

                await updateMorphedMesh(morphed);
                generatePoints(morphed);
            });

        async function updateMorphedMesh(morphAttributes: any) {
            faceMesh.geometry.setAttribute('position', morphAttributes.morphedPositionAttribute);
            faceMesh.geometry.attributes.position.needsUpdate = true;
            faceMesh.geometry.computeBoundingSphere();
            faceMesh.geometry.computeBoundingBox();
            faceMesh.geometry.computeVertexNormals();
            faceMesh.updateMorphTargets();
        }
        // ============================================== [FFD] ==============================================

        let selectedControlPoint: any = null; // Selected control point
        const controlPoints: THREE.Mesh[] = []; // Control points meshes
        const ctrlPointCoordinates: THREE.Vector3[] = []; // Control points coordinates
        let nearbyVerticesIndex: any[] = [];
        let comparePos: any = null;

        function removePoints() {
            const controlPointsGroup: any = faceMesh.getObjectByName('controlPoints');
            faceMesh.remove(controlPointsGroup);
            points = [];
        }

        function generatePoints(morphedAttributes?: any) {
            points = getPoints(faceMesh, morphedAttributes);
            addSphereToVertexes(faceMesh, vertices);
        }

        // Change points Float32Array[] into Vector3[] (X, Y, Z in Blender = X, -Z, Y in ThreeJS)
        function getPoints(faceMesh: THREE.Mesh, morphedAttributes?: any) {
            // Flat array to Vector3 array
            // If model is morphed, use morphedAttributes to generate point
            let pointsArray = !morphedAttributes ? faceMesh.geometry.attributes.position.array : morphedAttributes.morphedPositionAttribute.array;
            let itemSize = !morphedAttributes ? faceMesh.geometry.attributes.position.itemSize : morphedAttributes.morphedPositionAttribute.itemSize;

            let points: THREE.Vector3[] = [];
            for (let i = 0; i < pointsArray.length; i += itemSize) {
                points.push(new THREE.Vector3(pointsArray[i], pointsArray[i + 1], pointsArray[i + 2]))
            }
            return points;
        }

        // [FFD - Control Points]
        function addSphereToVertexes(faceMesh: THREE.Mesh, vertices: THREE.Vector3[]) {
            const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x4d4dff });

            let group = new THREE.Group();
            group.name = 'controlPoints';
            // ----------- Generate by index (get index using Blender) ----------------

            points.map((vertex, vertexIndex) => {
                landmarksIndex.landmarks.forEach((landmark) => {
                    if (vertexIndex == landmark.index) {
                        const ctrlPointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
                        ctrlPointMesh.name = landmark.name;
                        ctrlPointMesh.userData.vertexNumber = `${vertexIndex}`;
                        ctrlPointMesh.position.set(vertex.x, vertex.y, vertex.z);
                        controlPoints.push(ctrlPointMesh);
                        ctrlPointCoordinates.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z))
                        group.add(ctrlPointMesh);
                    }
                })
            })
            faceMesh.add(group);
        }

        function transformMesh(editHelper: TransformControls) {
            moveVertex(
                editHelper.object?.userData.vertexNumber,
                editHelper.object?.position as THREE.Vector3
            )
        }

        function moveVertex(vertexNumber: any, position: THREE.Vector3) {
            console.log('nearbyVerticesIndex =>', nearbyVerticesIndex)
            console.log('position =>', position)
            console.log('comparePos =>', comparePos)

            // let object: any = faceMesh;
            // object.geometry.parameters = null;

            points[+vertexNumber] = position; // Set new position to vertex
            let positions: any = []; // New flat array of position to mapping with the mesh
            points.map((item: THREE.Vector3, index) => {
                positions.push(item.x);
                positions.push(item.y);
                positions.push(item.z);
            });

            let arrayAttr = faceMesh.geometry.attributes.position.array; // Mesh's vertices flat array

            arrayAttr.map((arrIt: any, index) => arrayAttr[index] = positions[index]); // Re-mapping the mesh's points with new points

            faceMesh.geometry.attributes.position.needsUpdate = true;
            faceMesh.geometry.computeBoundingSphere();
            faceMesh.geometry.computeBoundingBox();
            faceMesh.geometry.computeVertexNormals();
        }

        function getNearbyVertices(selectedVertex: any) {
            nearbyVerticesIndex = [];
            const vecA: THREE.Vector3 = selectedVertex.position;
            points.forEach((item, index) => {
                if (vecA.distanceToSquared(item) < ffdRadius) {
                    nearbyVerticesIndex.push(index);
                }
            })
        }

        renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
        renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        renderer.domElement.addEventListener('dblclick', onDocumentMouseDbClick, false);
        const raycaster = new THREE.Raycaster();

        ctrlPointGUI
            .add(sphereOptions, 'showCtrlPoint')
            .onChange((e) => {
                if (e) {
                    generatePoints();
                } else {
                    const controlPointsGroup: any = faceMesh.getObjectByName('controlPoints');
                    faceMesh.remove(controlPointsGroup);
                }
            })

        function onDocumentMouseMove(event: any) {
            event.preventDefault();
            const mouse = {
                x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
                y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
            } as THREE.Vector2
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(controlPoints);
            // If the mouse cursor is hovering over a new control point...
            if (intersects.length > 0 && selectedControlPoint != intersects[0].object) {
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
            var intersects = raycaster.intersectObjects(controlPoints);
            // If a new control point is selected...
            if (intersects.length > 0 && selectedControlPoint !== intersects[0].object) {
                orbitControls.enabled = false;
                // If a control point was selected before, detach it from the transform control.
                if (selectedControlPoint)
                    transformControls.detach();
                // Remember the new selection to avoid reselecting the same one.
                selectedControlPoint = intersects[0].object;
                // Attach the newly selected control point to the transform control.
                transformControls.attach(selectedControlPoint);
                getNearbyVertices(selectedControlPoint);
                comparePos = selectedControlPoint.position.clone();
            }
        }

        function onDocumentMouseDbClick(event: MouseEvent) {
            event.preventDefault();
            transformControls.detach();
            selectedControlPoint = null;
            orbitControls.enabled = true;

        }

        // ============================================== [FFD] ==============================================

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

        function animate() {
            requestAnimationFrame(animate);
            orbitControls.update();
            stats.update();
            render();
        }
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])

    return <div ref={sceneRef} />
}
