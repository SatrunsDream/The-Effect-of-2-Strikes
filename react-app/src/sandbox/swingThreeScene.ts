import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SANDBOX_SCENE_BG } from '../theme';

export type SandboxThreeApi = {
  updateAttackAngle: (deg: number) => void;
  updateDirectionAngle: (deg: number) => void;
  updateSwingPathTilt: (deg: number) => void;
  dispose: () => void;
};

const MODEL_URL = '/models/ballandbat.glb';

function createTextLabel(
  text: string,
  x: number,
  y: number,
  z: number,
  color: number,
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = 256;
  canvas.height = 64;
  context.font = 'Bold 40px Arial';
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.fillText(text, 10, 40);
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(0.5, 0.125, 1);
  return sprite;
}

/**
 * Port of `graphs/swingAnimationWithOBJ.js` for the Vite app: same camera, GLB, and update hooks as the static index.
 */
export function mountSandboxSwingThree(
  container: HTMLElement,
  options?: { modelUrl?: string },
): Promise<SandboxThreeApi> {
  return new Promise((resolve, reject) => {
    const modelUrl = options?.modelUrl ?? MODEL_URL;
    const scaleFactor = 2;

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const newWidth = width * scaleFactor;
    const newHeight = height * scaleFactor;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(newWidth, newHeight);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SANDBOX_SCENE_BG);

    const camera = new THREE.PerspectiveCamera(45, newWidth / newHeight, 0.1, 1000);
    camera.position.set(2.5, 0.5, 3.5);
    camera.lookAt(new THREE.Vector3(0.8, 0.5, 0.8));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.target.set(0.8, 0.5, 0.8);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20, 0x2a4a6a, 0x2a4a6a);
    gridHelper.position.y = -1.0;
    scene.add(gridHelper);

    let batMeshObject: THREE.Object3D | null = null;
    let attackAngleGroup: THREE.Group | null = null;
    let directionAngleGroup: THREE.Group | null = null;
    let currentAttackAngle: number | null = null;
    let currentDirectionAngle: number | null = null;

    const angleVisualizationOffset = { x: 0.2, y: 0, z: 1 };

    let raf = 0;
    let started = false;

    function onResize() {
      const w = Math.max(1, container.clientWidth) * scaleFactor;
      const h = Math.max(1, container.clientHeight) * scaleFactor;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', onResize);

    const handleKeyPress = (event: KeyboardEvent) => {
      const moveAmount = 0.1;
      switch (event.key.toLowerCase()) {
        case 'arrowright':
          angleVisualizationOffset.x += moveAmount;
          break;
        case 'arrowleft':
          angleVisualizationOffset.x -= moveAmount;
          break;
        case 'arrowup':
          angleVisualizationOffset.y += moveAmount;
          break;
        case 'arrowdown':
          angleVisualizationOffset.y -= moveAmount;
          break;
        case 'a':
          angleVisualizationOffset.z += moveAmount;
          break;
        case 'd':
          angleVisualizationOffset.z -= moveAmount;
          break;
        case 'p': {
          if (batMeshObject) {
            const params = {
              offset: angleVisualizationOffset,
              batPosition: batMeshObject.position,
              attackAngle: currentAttackAngle,
              directionAngle: currentDirectionAngle,
            };
            void navigator.clipboard.writeText(JSON.stringify(params, null, 2));
          }
          break;
        }
        default:
          return;
      }
      if (currentAttackAngle !== null) {
        createAttackAngle3D(currentAttackAngle);
      }
      if (currentDirectionAngle !== null) {
        createDirectionAngle3D(currentDirectionAngle);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    function createAttackAngle3D(attackAngleDegrees: number) {
      if (attackAngleGroup) {
        scene.remove(attackAngleGroup);
      }
      attackAngleGroup = new THREE.Group();
      attackAngleGroup.position.set(0, 0.2, 0.1);
      scene.add(attackAngleGroup);

      if (!batMeshObject) {
        return;
      }

      const origin = new THREE.Vector3(
        batMeshObject.position.x + angleVisualizationOffset.x,
        batMeshObject.position.y + angleVisualizationOffset.y,
        batMeshObject.position.z + angleVisualizationOffset.z,
      );
      const baselineDir = new THREE.Vector3(1, 0, 0);
      const visualizationSize = 0.5;
      const baselineEnd = origin.clone().add(baselineDir.clone().multiplyScalar(visualizationSize));
      const baselineGeometry = new THREE.BufferGeometry().setFromPoints([origin, baselineEnd]);
      const baselineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const baselineLine = new THREE.Line(baselineGeometry, baselineMaterial);
      attackAngleGroup.add(baselineLine);

      const theta = THREE.MathUtils.degToRad(attackAngleDegrees);
      const attackDir = new THREE.Vector3(
        Math.cos(theta) * visualizationSize,
        Math.sin(theta) * visualizationSize,
        0,
      );
      const attackEnd = origin.clone().add(attackDir);

      const shaftRadius = 0.005;
      const shaftGeometry = new THREE.CylinderGeometry(shaftRadius, shaftRadius, visualizationSize, 8);
      const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
      shaft.position.copy(origin.clone().add(attackDir.clone().multiplyScalar(0.5)));
      const shaftDirection = attackDir.clone().normalize();
      shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), shaftDirection);
      attackAngleGroup.add(shaft);

      const arrowHeadLength = 0.08;
      const arrowHeadWidth = 0.03;
      const arrowHeadGeometry = new THREE.ConeGeometry(arrowHeadWidth, arrowHeadLength, 8);
      const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
      arrowHead.position.copy(attackEnd);
      const arrowDirection = attackDir.clone().normalize();
      arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);
      attackAngleGroup.add(arrowHead);

      const labelPositionAttack = attackEnd.clone().add(attackDir.clone().normalize().multiplyScalar(0.05));
      const labelSprite = createTextLabel(
        `${attackAngleDegrees.toFixed(1)}°`,
        labelPositionAttack.x,
        labelPositionAttack.y,
        labelPositionAttack.z,
        0xff0000,
      );
      attackAngleGroup.add(labelSprite);
    }

    function createDirectionAngle3D(directionAngleDegrees: number) {
      if (directionAngleGroup) {
        scene.remove(directionAngleGroup);
      }
      directionAngleGroup = new THREE.Group();
      directionAngleGroup.position.set(0, 0.2, 0.1);
      scene.add(directionAngleGroup);

      if (!batMeshObject) {
        return;
      }

      const origin = new THREE.Vector3(
        batMeshObject.position.x + angleVisualizationOffset.x,
        batMeshObject.position.y + angleVisualizationOffset.y,
        batMeshObject.position.z + angleVisualizationOffset.z,
      );
      const visualizationSize = 0.5;
      const baselineDir = new THREE.Vector3(1, 0, 0);
      const baselineEnd = origin.clone().add(baselineDir.clone().multiplyScalar(visualizationSize));
      const baselineGeometry = new THREE.BufferGeometry().setFromPoints([origin, baselineEnd]);
      const baselineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
      const directionBaselineLine = new THREE.Line(baselineGeometry, baselineMaterial);
      directionAngleGroup.add(directionBaselineLine);

      const theta = THREE.MathUtils.degToRad(directionAngleDegrees);
      const directionDir = new THREE.Vector3(
        Math.cos(theta) * visualizationSize,
        0,
        Math.sin(theta) * visualizationSize,
      );
      const directionEnd = origin.clone().add(directionDir);
      const arrowLength = visualizationSize;
      const arrowHeadLength = 0.08;
      const arrowHeadWidth = 0.03;
      const shaftRadius = 0.005;

      const shaftGeometry = new THREE.CylinderGeometry(shaftRadius, shaftRadius, arrowLength, 8);
      const shaftMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
      shaft.position.copy(origin.clone().add(directionDir.clone().multiplyScalar(0.5)));
      const shaftDirection = directionDir.clone().normalize();
      shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), shaftDirection);
      directionAngleGroup.add(shaft);

      const arrowHeadGeometry = new THREE.ConeGeometry(arrowHeadWidth, arrowHeadLength, 8);
      const arrowHeadMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, arrowHeadMaterial);
      arrowHead.position.copy(directionEnd);
      const arrowDirection = directionDir.clone().normalize();
      arrowHead.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDirection);
      directionAngleGroup.add(arrowHead);

      const labelPositionDirection = directionEnd.clone().add(directionDir.clone().normalize().multiplyScalar(0.05));
      const labelSprite = createTextLabel(
        `${directionAngleDegrees.toFixed(1)}°`,
        labelPositionDirection.x,
        labelPositionDirection.y,
        labelPositionDirection.z,
        0x00ff00,
      );
      directionAngleGroup.add(labelSprite);
    }

    function createTiltMeter() {
      if (!batMeshObject) {
        return;
      }
      if (batMeshObject.userData.tiltMeter) {
        batMeshObject.remove(batMeshObject.userData.tiltMeter as THREE.Object3D);
      }

      const meterGroup = new THREE.Group();
      const lineLength = 0.3;
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(lineLength, 0, 0),
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
      const meterLine = new THREE.Line(lineGeometry, lineMaterial);
      meterGroup.add(meterLine);

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      context.font = 'Bold 40px Arial';
      context.fillStyle = '#ff0000';
      context.fillText('0°', 10, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const labelSprite = new THREE.Sprite(material);
      labelSprite.position.set(lineLength + 0.1, 0, 0);
      labelSprite.scale.set(0.5, 0.125, 1);
      meterGroup.add(labelSprite);

      meterGroup.position.set(0, -0.8, 0);
      meterGroup.rotation.z = Math.PI / 2;
      batMeshObject.add(meterGroup);
      batMeshObject.userData.tiltMeter = meterGroup;
      batMeshObject.userData.tiltLabel = labelSprite;
    }

    function updateSwingPathTiltVisual(swingTiltDegrees: number) {
      if (batMeshObject && batMeshObject.userData.baseRotationX === undefined) {
        batMeshObject.userData.baseRotationX = batMeshObject.rotation.x;
      }

      const extraRotation = THREE.MathUtils.degToRad(swingTiltDegrees - swingTiltDegrees / 2);
      if (batMeshObject) {
        batMeshObject.rotation.x = THREE.MathUtils.degToRad(90) + extraRotation;

        if (batMeshObject.userData.tiltMeter) {
          (batMeshObject.userData.tiltMeter as THREE.Group).rotation.z = Math.PI / 2 + extraRotation;
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = 256;
          canvas.height = 64;
          context.font = 'Bold 40px Arial';
          context.fillStyle = '#ffff00';
          context.fillText(`${swingTiltDegrees.toFixed(1)}°`, 10, 40);
          const texture = new THREE.CanvasTexture(canvas);
          const tiltLabel = batMeshObject.userData.tiltLabel as THREE.Sprite;
          (tiltLabel.material as THREE.SpriteMaterial).map = texture;
          (tiltLabel.material as THREE.SpriteMaterial).needsUpdate = true;
        }

        if (currentAttackAngle !== null) {
          const yOffset = swingTiltDegrees / 30;
          angleVisualizationOffset.y = 0.0 - yOffset;
          const zOffset = swingTiltDegrees / 60;
          angleVisualizationOffset.z = 2.2 - zOffset;
          createAttackAngle3D(currentAttackAngle);
          if (currentDirectionAngle !== null) {
            createDirectionAngle3D(currentDirectionAngle);
          }
        }
      }
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    function startAnimationLoop() {
      if (started) {
        return;
      }
      started = true;
      animate();
    }

    const api: SandboxThreeApi = {
      updateAttackAngle(attackAngleDegrees) {
        currentAttackAngle = attackAngleDegrees;
        if (batMeshObject) {
          createAttackAngle3D(attackAngleDegrees);
        }
      },
      updateDirectionAngle(directionAngleDegrees) {
        currentDirectionAngle = directionAngleDegrees;
        if (batMeshObject) {
          createDirectionAngle3D(directionAngleDegrees);
        }
      },
      updateSwingPathTilt(deg) {
        updateSwingPathTiltVisual(deg);
      },
      dispose() {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', handleKeyPress);
        controls.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      },
    };

    new GLTFLoader().load(
      modelUrl,
      gltf => {
        const bat = gltf.scene;
        bat.traverse(child => {
          if ('isMesh' in child && child.isMesh) {
            const m = (child as THREE.Mesh).material;
            if (m && typeof m === 'object' && 'onBuild' in m) {
              const mat = m as THREE.Material & { onBuild?: () => void };
              if (typeof mat.onBuild !== 'function') {
                mat.onBuild = () => {};
              }
            }
          }
        });
        bat.scale.set(3, 3, 3);
        bat.position.set(0.7, 0.7, 0.0);
        bat.rotation.x = THREE.MathUtils.degToRad(90);
        bat.rotation.y = THREE.MathUtils.degToRad(180);
        batMeshObject = bat;
        scene.add(batMeshObject);

        startAnimationLoop();
        createTiltMeter();
        if (currentAttackAngle !== null) {
          createAttackAngle3D(currentAttackAngle);
        }
        if (currentDirectionAngle !== null) {
          createDirectionAngle3D(currentDirectionAngle);
        }
        resolve(api);
      },
      undefined,
      err => {
        api.dispose();
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}
