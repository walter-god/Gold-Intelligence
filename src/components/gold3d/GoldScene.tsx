import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { GoldBarSceneManager, EXPLODED_LAYERS, ExplodedLayerData } from './GoldBarObject';

interface GoldSceneProps {
  isExploded?: boolean;
  onLayerSelect?: (layer: ExplodedLayerData | null) => void;
  selectedLayerId?: string | null;
  interactive?: boolean;
  cameraDistance?: number;
  lastTickBullish?: boolean | null;
}

export const GoldScene: React.FC<GoldSceneProps> = ({
  isExploded = false,
  onLayerSelect,
  selectedLayerId,
  interactive = true,
  cameraDistance = 7.2,
  lastTickBullish = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const managerRef = useRef<GoldBarSceneManager | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction tracking
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationEulerRef = useRef({ x: 0.45, y: -0.55 });
  const targetRotationRef = useRef({ x: 0.45, y: -0.55 });
  const zoomRef = useRef(cameraDistance);
  const targetZoomRef = useRef(cameraDistance);

  const [hoveredLayer, setHoveredLayer] = useState<ExplodedLayerData | null>(null);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.FogExp2(0x080808, 0.045);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.8, cameraDistance);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-end physically correct lighting & shadows
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lighting Rig
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x282012, 1.2);
    scene.add(ambientLight);

    // Main Overhead Key Spotlight (focused on top gold face)
    const keySpot = new THREE.SpotLight(0xfff3d0, 4.5, 30, Math.PI / 4, 0.45, 1.2);
    keySpot.position.set(2.5, 6.0, 4.0);
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    keySpot.shadow.camera.near = 1;
    keySpot.shadow.camera.far = 15;
    keySpot.shadow.bias = -0.0001;
    scene.add(keySpot);

    // Secondary Warm Rim Light (creates that iconic golden contour edge)
    const rimLightWarm = new THREE.DirectionalLight(0xe5c45a, 2.8);
    rimLightWarm.position.set(-5, 2.5, -3.5);
    scene.add(rimLightWarm);

    // Subtle Cool Fill Light (creates rich high-contrast specular reflections)
    const fillLightCool = new THREE.DirectionalLight(0x8cb8ff, 0.9);
    fillLightCool.position.set(4, -2, -3);
    scene.add(fillLightCool);

    // Bottom soft reflector light
    const floorBounce = new THREE.DirectionalLight(0x423108, 0.7);
    floorBounce.position.set(0, -4, 2);
    scene.add(floorBounce);

    // Subtle Shadow Catching Floor Plane
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.4 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.6;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle Ambient Floating Dust Particles (subtle gold specs catching light)
    const particleCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPositions[i] = (Math.random() - 0.5) * 12;
      pPositions[i + 1] = (Math.random() - 0.5) * 8;
      pPositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe5c45a,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(pGeo, pMat);
    scene.add(dustParticles);

    // 5. Instantiate Photorealistic Gold Bar Scene Manager
    const manager = new GoldBarSceneManager();
    scene.add(manager.group);
    managerRef.current = manager;

    // Initial position
    manager.group.rotation.x = rotationEulerRef.current.x;
    manager.group.rotation.y = rotationEulerRef.current.y;

    // Handle Resize with ResizeObserver
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 6. Animation Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle slow particles drift
      dustParticles.rotation.y = elapsedTime * 0.02;

      // Mouse Parallax & Smooth Damping
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;

      // Subtle resting idle breathing when not dragging
      let idlePitch = 0;
      let idleRoll = 0;
      if (!isDraggingRef.current && !manager.isExploded) {
        idlePitch = Math.sin(elapsedTime * 0.7) * 0.035;
        idleRoll = Math.cos(elapsedTime * 0.5) * 0.04;
      }

      // Smoothly interpolate rotation to target
      rotationEulerRef.current.x += (targetRotationRef.current.x + mousePosRef.current.y * 0.25 + idlePitch - rotationEulerRef.current.x) * 0.08;
      rotationEulerRef.current.y += (targetRotationRef.current.y + mousePosRef.current.x * 0.45 + idleRoll - rotationEulerRef.current.y) * 0.08;

      if (managerRef.current) {
        managerRef.current.group.rotation.x = rotationEulerRef.current.x;
        managerRef.current.group.rotation.y = rotationEulerRef.current.y;

        // Subtle floating elevation
        if (!managerRef.current.isExploded) {
          managerRef.current.group.position.y = Math.sin(elapsedTime * 1.2) * 0.06;
        } else {
          managerRef.current.group.position.y = 0;
        }
      }

      // Smooth Camera Zoom
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.08;
      if (cameraRef.current) {
        cameraRef.current.position.z = zoomRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      manager.dispose();
      renderer.dispose();
    };
  }, [cameraDistance]);

  // Sync Exploded View state
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.toggleExplodedView(isExploded);

      // When exploded, adjust camera zoom slightly to frame all layers
      if (isExploded) {
        targetZoomRef.current = cameraDistance * 1.22;
        targetRotationRef.current = { x: 0.25, y: -0.4 };
      } else {
        targetZoomRef.current = cameraDistance;
      }
    }
  }, [isExploded, cameraDistance]);

  // Tick Pulse flare on price changes
  useEffect(() => {
    if (lastTickBullish !== null && managerRef.current) {
      managerRef.current.triggerTickPulse(lastTickBullish);
    }
  }, [lastTickBullish]);

  // Mouse / Pointer Event Listeners
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  }, [interactive]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!interactive || !containerRef.current) return;

    // Normalized coordinates (-1 to 1) for parallax
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePosRef.current.targetX = nx;
    mousePosRef.current.targetY = ny;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
      // Clamp vertical tilt so it doesn't flip completely upside down
      targetRotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotationRef.current.x));
    }
  }, [interactive]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.004;
    targetZoomRef.current = Math.max(4.5, Math.min(12.0, targetZoomRef.current + zoomDelta));
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Interactive Cursor Hint in the corner */}
      <div className="absolute bottom-4 left-4 pointer-events-none text-[10px] font-mono tracking-widest text-[#858585] uppercase flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E5C45A] animate-pulse" />
        <span>INTERACTIVE 3D BULLION // DRAG TO ROTATE • SCROLL TO ZOOM</span>
      </div>
    </div>
  );
};
