import { GUI } from 'dat.gui';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import landmarksIndex from './landmarksIndex.json';

const modelToRender = 'dentist';

const meshOptions = {
    color: 0xffffff,
    wireframe: false
};

const sphereOptions = {
    width: 0.5,
    height: 32,
    depth: 32,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
};

export default function FFD() {
    const sceneRef = useRef<HTMLDivElement>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    let faceMesh: THREE.Mesh;
    let faceMeshMaterial: THREE.MeshStandardMaterial;

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
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 0, 400) //top-left-ish
    topLight.castShadow = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
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
    ctrlPointGUI
        .addColor(meshOptions, 'color')
        .onChange((e) => {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: e
            });
            faceMesh.traverse((item) => {
                if (item instanceof THREE.Mesh && item.name !== 'face02') {
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
            if (item instanceof THREE.Mesh && item.name !== 'face02') {
                item.geometry.dispose();
                item.geometry = newGeometry
            }
        })
        // cube.geometry.dispose();
        // cube.geometry = newGeometry;
    }

    function render() {
        renderer.render(scene, camera);
    }

    useEffect(() => {
        sceneRef.current?.appendChild(renderer.domElement);

        // Load 3D model (GLTF)
        const loader = new GLTFLoader();
        loader.load(`./assets/${modelToRender}/faceShapeKey.glb`, (gltf) => {
            const loadedModel = gltf.scene;
            modelRef.current = loadedModel;
            // Traverse through all the children of the loaded object
            loadedModel.traverse(function (child) {
                if (child instanceof THREE.Mesh && child.name === 'face') {
                    console.log('child =>', child)
                    faceMesh = child;
                    faceMeshMaterial = child.material;
                    generatePoints(false);

                    let options = {
                        upperLips: 0,
                        lowerLips: 0
                    };
                    let morphChange = (type: number) => {
                        removePoints();
                        console.log("child here", child);
                        if (child.morphTargetInfluences && type === 0) {
                            child.morphTargetInfluences[0] = options.upperLips;
                        } else if (child.morphTargetInfluences && type !== 0) {
                            child.morphTargetInfluences[1] = options.lowerLips;
                        }
                        faceMesh = child;
                    };
                    meshGUI.add(options, 'upperLips', 0, 1).onChange(() => morphChange(0)).onFinishChange(() => generatePoints(true));
                    meshGUI.add(options, 'lowerLips', 0, 1).onChange(() => morphChange(1)).onFinishChange(() => generatePoints(true));
                }
            });
            // transformControls.attach(loadedModel);
            scene.add(loadedModel);
        }, undefined, (error) => {
            console.log('error', error)
        })

        const transformControls = new TransformControls(camera, renderer.domElement);
        scene.add(transformControls);
        transformControls.addEventListener('dragging-changed', function (event) {
            orbitControls.enabled = !event.value;
        });
        transformControls.addEventListener('objectChange', function (event) {
            transformMesh(event.target);
        });

        // ============================================== [FFD] ==============================================
        let points: THREE.Vector3[] = []; // Points of mesh (faceMesh)
        let vertices: THREE.Vector3[] = []; // Vertices of mesh (faceMesh)

        let selectedControlPoint: any = null; // Selected control point
        const controlPoints: THREE.Mesh[] = []; // Control points meshes
        const ctrlPointCoordinates: THREE.Vector3[] = []; // Control points coordinates

        function removePoints() {
            const controlPointsGroup: any = faceMesh.getObjectByName('controlPoints');
            faceMesh.remove(controlPointsGroup);
            points = [];
            vertices = [];
        }

        function generatePoints(isRegenerate: boolean) {
            points = getPoints(faceMesh, isRegenerate);
            vertices = getVertices(points);
            addSphereToVertexes(faceMesh, vertices);
        }

        // Change points Float32Array[] into Vector3[] (X, Y, Z in Blender = X, -Z, Y in ThreeJS)
        function getPoints(faceMesh: THREE.Mesh, isRegenerate: boolean) {
            if (isRegenerate) {
                console.log("REGENERATE");
            } else {
                console.log("GENERATE");
            }
            let pointsArray = faceMesh.geometry.attributes.position.array;
            let itemSize = faceMesh.geometry.attributes.position.itemSize;
            let points: THREE.Vector3[] = [];

            for (let i = 0; i < pointsArray.length; i += itemSize) {
                points.push(new THREE.Vector3(pointsArray[i], pointsArray[i + 1], pointsArray[i + 2]))
            }
            console.log("points after morph", points);
            return points;
        }

        function getVertices(points: THREE.Vector3[]) {
            let vertices: THREE.Vector3[] = [];

            points.forEach((indexPoints) => {
                let equal = false;

                vertices.forEach((indexVertex) => {
                    if (indexPoints.equals(indexVertex)) {
                        equal = true;
                        return;
                    }
                })
                if (!equal) {
                    vertices.push(indexPoints);
                }
            })

            return vertices;
        }

        // [FFD - Control Points]
        function addSphereToVertexes(faceMesh: THREE.Mesh, vertices: THREE.Vector3[]) {
            console.log("POINTS => ", points);
            const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x4d4dff });

            let group = new THREE.Group();
            group.name = 'controlPoints';
            // ----------- Generate by coordinates ----------------
            // landmarks.landmarks.map((landmark, index) => {
            //     const ctrlPoint = landmark.worldPt;
            //     const ctrlPointMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            //     ctrlPointMesh.name = 'createMeshHelper';
            //     ctrlPointMesh.userData.vertexNumber = `${index}`;
            //     ctrlPointMesh.position.set(ctrlPoint[0], ctrlPoint[1], ctrlPoint[2]);

            //     controlPoints.push(ctrlPointMesh);
            //     group.add(ctrlPointMesh);
            //     ctrlPointCoordinates.push(new THREE.Vector3(ctrlPoint[0], ctrlPoint[1], ctrlPoint[2]));
            //     return null;
            // });

            // [FFD - Lines]
            // setMyControlPoints();

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
            let object: any = faceMesh;
            object.geometry.parameters = null;

            let falloffDistance = 2.0;
            let influence = 0.5;

            // let vertexesPointsIndexes = getVertexesPointsIndexes(points, vertices);
            // vertices[+vertexNumber] = position;
            // let newPoints = vertexesChangePoints(
            //     points,
            //     vertices,
            //     vertexesPointsIndexes);
            // pointsChangeAttributesPosition(faceMesh, newPoints);

            points[+vertexNumber] = position; // Set new position to vertex
            let positions: any = []; // New flat array of position to mapping with the mesh
            // 
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
                // If a control point was selected before, detach it from the transform control.
                if (selectedControlPoint)
                    transformControls.detach();
                // Remember the new selection to avoid reselecting the same one.
                selectedControlPoint = intersects[0].object;
                // Attach the newly selected control point to the transform control.
                transformControls.attach(selectedControlPoint);
                console.log('selected point', selectedControlPoint);
            }
            else {
                // Enable the orbit control so that the user can pan/rotate/zoom. 
                orbitControls.enabled = true;
                transformControls.detach();
            }
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

        // Lattice draw
        // function setMyControlPoints() {
        //     const lineGeometry = new THREE.BufferGeometry();
        //     const lineMaterial = new THREE.LineBasicMaterial(({ color: 0x0000ff }));
        //     const line = new THREE.Line(lineGeometry, lineMaterial);
        //     lineGeometry.setFromPoints([
        //         ctrlPointCoordinates[18],
        //         ctrlPointCoordinates[0],
        //         ctrlPointCoordinates[1],
        //         ctrlPointCoordinates[7],
        //         ctrlPointCoordinates[1],
        //         ctrlPointCoordinates[2],
        //         ctrlPointCoordinates[8],
        //         ctrlPointCoordinates[2],
        //         ctrlPointCoordinates[3],
        //         ctrlPointCoordinates[9],
        //         ctrlPointCoordinates[3],
        //         ctrlPointCoordinates[4],
        //         ctrlPointCoordinates[10],
        //         ctrlPointCoordinates[4],
        //         ctrlPointCoordinates[5],
        //         ctrlPointCoordinates[11],
        //         ctrlPointCoordinates[5],
        //         ctrlPointCoordinates[6],
        //         ctrlPointCoordinates[17],
        //         ctrlPointCoordinates[11],
        //         ctrlPointCoordinates[10],
        //         ctrlPointCoordinates[9],
        //         ctrlPointCoordinates[8],
        //         ctrlPointCoordinates[7],
        //         ctrlPointCoordinates[18],
        //         ctrlPointCoordinates[16],
        //         ctrlPointCoordinates[7],
        //         ctrlPointCoordinates[16],
        //         ctrlPointCoordinates[15],
        //         ctrlPointCoordinates[8],
        //         ctrlPointCoordinates[15],
        //         ctrlPointCoordinates[14],
        //         ctrlPointCoordinates[9],
        //         ctrlPointCoordinates[14],
        //         ctrlPointCoordinates[13],
        //         ctrlPointCoordinates[10],
        //         ctrlPointCoordinates[13],
        //         ctrlPointCoordinates[12],
        //         ctrlPointCoordinates[11],
        //         ctrlPointCoordinates[12],
        //         ctrlPointCoordinates[17],
        //         ctrlPointCoordinates[23],
        //         ctrlPointCoordinates[24],
        //         ctrlPointCoordinates[23],
        //         ctrlPointCoordinates[22],
        //         ctrlPointCoordinates[25],
        //         ctrlPointCoordinates[22],
        //         ctrlPointCoordinates[21],
        //         ctrlPointCoordinates[26],
        //         ctrlPointCoordinates[21],
        //         ctrlPointCoordinates[20],
        //         ctrlPointCoordinates[27],
        //         ctrlPointCoordinates[20],
        //         ctrlPointCoordinates[19],
        //         ctrlPointCoordinates[18],
        //         ctrlPointCoordinates[28],
        //         ctrlPointCoordinates[19],
        //         ctrlPointCoordinates[28],
        //         ctrlPointCoordinates[27],
        //         ctrlPointCoordinates[26],
        //         ctrlPointCoordinates[25],
        //         ctrlPointCoordinates[24],
        //         ctrlPointCoordinates[17],
        //         ctrlPointCoordinates[36],
        //         ctrlPointCoordinates[35],
        //         ctrlPointCoordinates[34],
        //         ctrlPointCoordinates[30],
        //         ctrlPointCoordinates[33],
        //         ctrlPointCoordinates[32],
        //         ctrlPointCoordinates[31],
        //         ctrlPointCoordinates[0],
        //         ctrlPointCoordinates[31],
        //         ctrlPointCoordinates[18],
        //         ctrlPointCoordinates[28],
        //         ctrlPointCoordinates[32],
        //         ctrlPointCoordinates[33],
        //         ctrlPointCoordinates[27],
        //         ctrlPointCoordinates[29],
        //         ctrlPointCoordinates[33],
        //         ctrlPointCoordinates[29],
        //         ctrlPointCoordinates[26],
        //         ctrlPointCoordinates[29],
        //         ctrlPointCoordinates[30],
        //         ctrlPointCoordinates[29],
        //         ctrlPointCoordinates[25],
        //         ctrlPointCoordinates[29],
        //         ctrlPointCoordinates[34],
        //         ctrlPointCoordinates[25],
        //         ctrlPointCoordinates[24],
        //         ctrlPointCoordinates[35],
        //         ctrlPointCoordinates[36],
        //         ctrlPointCoordinates[6],
        //     ]);
        //     scene.add(line);
        // }

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

    // Testing hooks
    useEffect(() => {

    }, [])

    return <div ref={sceneRef} />
}
