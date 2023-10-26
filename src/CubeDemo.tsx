import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';


const CubeDemo = () => {
    const sceneRef = useRef<HTMLDivElement>(null);

    const stats = new Stats();
    document.body.appendChild(stats.dom);

    useEffect(() => {

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
            new THREE.BoxGeometry(5, 5, 5, 1, 1),
            new THREE.MeshBasicMaterial({ color: 0xFF00EF, wireframe: true }));

        // [STATE]
        let ctrl_pt_meshes: THREE.Mesh[] = [];
        let ctrl_pt_mesh_selected: any = null;
        let points: THREE.Vector3[] = [];
        let vertices: THREE.Vector3[] = [];

        function addPoints() {
            points = getPoints(cube);
            vertices = getVertexes(points);
            addSphereToVertexes(cube, vertices);

            console.log('cube', cube);
        }

        function getPoints(cube: THREE.Mesh) {
            let pointsArray = cube.geometry.attributes.position.array;
            let itemSize = cube.geometry.attributes.position.itemSize;
            let points: THREE.Vector3[] = [];

            for (let i = 0; i < pointsArray.length; i += itemSize) {
                points.push(new THREE.Vector3(pointsArray[i], pointsArray[i + 1], pointsArray[i + 2]))
            }
            console.log('points =>', points);
            return points;
        }

        function getVertexes(points: THREE.Vector3[]) {
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
            console.log('vertices', vertices);
            return vertices;
        }

        function addSphereToVertexes(mesh: THREE.Mesh, vertices: THREE.Vector3[]) {
            const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
            const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'red' });

            let group = new THREE.Group();
            group.name = "spheresForMeshEdit";

            vertices.map((item, index) => {
                let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.name = 'createMeshHelper';
                sphere.userData.vertexNumber = `${index}`;
                group.add(sphere);
                sphere.position.set(item.x, item.y, item.z);
                ctrl_pt_meshes.push(sphere);
            })
            // scene.add(group);
            mesh.add(group);
        }

        addPoints();

        // FFD
        function transformMesh(editHelper: TransformControls) {
            moveVertex(
                editHelper.object?.userData.vertexNumber,
                editHelper.object?.position as THREE.Vector3
            )
        }

        function moveVertex(vertexNumber: any, position: THREE.Vector3) {
            let object: any = cube;
            object.geometry.parameters = null;

            console.log('vertexNumber =>', vertexNumber);
            console.log('position =>', position);
            console.log('vertices =>', vertices);
            console.log('points =>', points);

            let vertexesPointsIndexes = getVertexesPointsIndexes(points, vertices);

            vertices[+vertexNumber] = position;

            let newPoints = vertexesChangePoints(
                points,
                vertices,
                vertexesPointsIndexes);

            pointsChangeAttributesPosition(cube, newPoints);
            cube.geometry.attributes.position.needsUpdate = true;
            cube.geometry.computeBoundingSphere();
            cube.geometry.computeBoundingBox();
        }

        function getVertexesPointsIndexes(points: THREE.Vector3[], vertices: THREE.Vector3[]) {
            let indexesArray: any = [];
            vertices.forEach((itemVertex) => {
                let indexes: any = [];
                points.forEach((itemPoints, index) => {
                    if (itemPoints.equals(itemVertex)) {
                        indexes.push(index);
                    }
                })
                indexesArray.push(indexes);
            })
            console.log('aloha123 =>', indexesArray);
            return indexesArray;
        }

        function vertexesChangePoints(points: THREE.Vector3[], vertices: THREE.Vector3[], vertexesPointsIndexes: any[]) {
            vertices.map((itemVertex, index) => {
                let arrayIndexes = vertexesPointsIndexes[index];
                arrayIndexes.map((item: any) => (points[item] = itemVertex))
            });

            points[0] = vertices[0];
            return points;
        }

        function pointsChangeAttributesPosition(mesh: THREE.Mesh, points: THREE.Vector3[]) {
            let positions: any = [];
            points.map((item: THREE.Vector3) => {
                positions.push(item.x);
                positions.push(item.y);
                positions.push(item.z);
            });

            let arrayAttr = mesh.geometry.attributes.position.array;
            console.log('mesh new', mesh);

            arrayAttr.map((arrIt: any, index) => mesh.geometry.attributes.position.array[index] = positions[index]);
        }









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
        transformControls.addEventListener('objectChange', function (event) {
            // let cubePos = cube.getWorldPosition(new THREE.Vector3());
            // console.log('cube pos =>', cubePos);
            transformMesh(event.target);
        });
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('dblclick', onDocumentMouseDown, false);

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
                if (sceneRef.current) {
                    sceneRef.current.style.cursor = 'pointer'
                }
            } else {
                // cube.material.color.set(0x00ff00); // Restore original color
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
                controls.enabled = true;
                transformControls.detach();
                transformControls.attach(cube);
            }
        }

        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);
        const gridHelper = new THREE.GridHelper(30);
        scene.add(gridHelper);

        const gui = new GUI();
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
        const animate = () => {
            requestAnimationFrame(animate);

            controls.update();
            stats.update();
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }
        animate();


        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            sceneRef.current?.removeChild(renderer.domElement);
        }
    }, [])

    return <div ref={sceneRef} />
}

export default CubeDemo;