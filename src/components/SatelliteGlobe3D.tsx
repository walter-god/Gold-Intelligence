import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CountryGoldProfile, GoldCorridor } from '../types';
import {
  Play,
  Pause,
  RotateCw,
  Compass,
  ZoomIn,
  ZoomOut,
  Eye,
  Sparkles,
  Cloud,
  Moon,
  Layers,
} from 'lucide-react';

interface SatelliteGlobe3DProps {
  countries: CountryGoldProfile[];
  trades: GoldCorridor[];
  selectedCountry: CountryGoldProfile | null;
  onSelectCountry: (country: CountryGoldProfile) => void;
  activeFilter: string;
  currentPrice: number;
}

// Convert Lat/Lon to 3D Cartesian Vector on sphere of given radius
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Compute rotation target angles (Euler) to bring given lat/lon to face camera (towards +Z)
function getTargetRotationForLatLon(lat: number, lon: number): { x: number; y: number } {
  const targetY = -((lon + 90) * (Math.PI / 180));
  const targetX = (lat) * (Math.PI / 180);
  return { x: targetX, y: targetY };
}

// Math helper for shortest angular difference in [-PI, PI] without modulo sign flip glitches
function shortestAngleDiff(target: number, current: number): number {
  let diff = (target - current) % (Math.PI * 2);
  if (diff < -Math.PI) diff += Math.PI * 2;
  if (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}

// Fast procedural placeholder texture while high-res NASA assets stream in
function createProceduralBaseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#030814');
  oceanGrad.addColorStop(0.5, '#051428');
  oceanGrad.addColorStop(1, '#030814');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Continental approximations
  ctx.fillStyle = '#1e331c';
  // North America
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.22, canvas.height * 0.32, 180, 110, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.32, canvas.height * 0.68, 90, 140, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.65, canvas.height * 0.30, 260, 120, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.fillStyle = '#423820';
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.52, canvas.height * 0.55, 120, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(canvas.width * 0.84, canvas.height * 0.72, 90, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export const SatelliteGlobe3D: React.FC<SatelliteGlobe3DProps> = ({
  countries,
  trades,
  selectedCountry,
  onSelectCountry,
  activeFilter,
  currentPrice: _currentPrice,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tiltGroupRef = useRef<THREE.Group | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const earthMaterialRef = useRef<THREE.MeshPhongMaterial | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const haloMeshRef = useRef<THREE.Mesh | null>(null);
  const pinGroupRef = useRef<THREE.Group | null>(null);
  const arcGroupRef = useRef<THREE.Group | null>(null);
  const countryHitSpheresRef = useRef<{ mesh: THREE.Mesh; country: CountryGoldProfile }[]>([]);
  const photonPoolRef = useRef<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; offset: number; speed: number }[]>([]);

  // Interactive UI State
  const [hoveredCountry, setHoveredCountry] = useState<CountryGoldProfile | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [rotationSpeedMultiplier, setRotationSpeedMultiplier] = useState<number>(1.0);
  const [currentHeadingDeg, setCurrentHeadingDeg] = useState<number>(0);
  const [isTourMode, setIsTourMode] = useState<boolean>(false);
  const [isCloudsActive, setIsCloudsActive] = useState<boolean>(true);
  const [isNightLightsActive, setIsNightLightsActive] = useState<boolean>(true);
  const [isAxialTilt, setIsAxialTilt] = useState<boolean>(true);
  const [isTextureLoaded, setIsTextureLoaded] = useState<boolean>(false);

  // Synchronized refs for 60fps animation loop
  const isRotatingRef = useRef(true);
  const rotationSpeedRef = useRef(1.0);
  const isTourModeRef = useRef(false);
  const isCloudsActiveRef = useRef(true);
  const isNightLightsActiveRef = useRef(true);
  const isAxialTiltRef = useRef(true);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);
  const isAutoTargetingRef = useRef(false);

  // Dragging and interaction state
  const isDraggingRef = useRef(false);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const dragVelocityRef = useRef({ x: 0, y: 0 });
  const hoverPinRef = useRef<CountryGoldProfile | null>(null);
  const onSelectCountryRef = useRef(onSelectCountry);
  onSelectCountryRef.current = onSelectCountry;

  // Keep animation refs in sync with React state
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    rotationSpeedRef.current = rotationSpeedMultiplier;
  }, [rotationSpeedMultiplier]);

  useEffect(() => {
    isTourModeRef.current = isTourMode;
  }, [isTourMode]);

  useEffect(() => {
    isCloudsActiveRef.current = isCloudsActive;
    if (cloudsMeshRef.current) {
      cloudsMeshRef.current.visible = isCloudsActive;
    }
  }, [isCloudsActive]);

  useEffect(() => {
    isNightLightsActiveRef.current = isNightLightsActive;
    if (earthMaterialRef.current) {
      earthMaterialRef.current.emissiveIntensity = isNightLightsActive ? 0.85 : 0.0;
      earthMaterialRef.current.needsUpdate = true;
    }
  }, [isNightLightsActive]);

  useEffect(() => {
    isAxialTiltRef.current = isAxialTilt;
  }, [isAxialTilt]);

  // Smooth target navigation when country is selected
  useEffect(() => {
    if (!selectedCountry) return;
    const target = getTargetRotationForLatLon(selectedCountry.lat, selectedCountry.lon);
    targetRotationRef.current = target;
    isAutoTargetingRef.current = true;
    setIsTourMode(false);
  }, [selectedCountry]);

  // 1. Primary Three.js Lifecycle: Mount Once with Photorealistic Earth Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2500);
    camera.position.set(0, 0, 225);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // B. Celestial Deep-Space Starfield
    const starsCount = 1600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 1800;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 1800;
      starPositions[i * 3 + 2] = -350 - Math.random() * 950;

      const starKind = Math.random();
      if (starKind > 0.85) {
        // Warm gold star
        starColors[i * 3] = 0.98;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.55;
      } else if (starKind > 0.65) {
        // Sapphire blue star
        starColors[i * 3] = 0.65;
        starColors[i * 3 + 1] = 0.82;
        starColors[i * 3 + 2] = 1.0;
      } else {
        // Bright white star
        starColors[i * 3] = 0.92;
        starColors[i * 3 + 1] = 0.94;
        starColors[i * 3 + 2] = 0.98;
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // C. Tilt Group (Astronomical Obliquity of 23.44°)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
    scene.add(tiltGroup);
    tiltGroupRef.current = tiltGroup;

    // D. Master Globe Group (Rotates along Earth's polar axis)
    const globeGroup = new THREE.Group();
    // Initialize facing London LBMA / European meridian
    globeGroup.rotation.y = -Math.PI * 0.5;
    tiltGroup.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 68;

    // E. Photorealistic Earth Sphere Material with NASA Maps
    const placeholderTex = createProceduralBaseTexture();
    const earthGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: placeholderTex,
      bumpScale: 0.1,
      specular: new THREE.Color(0x446688),
      shininess: 28,
      emissive: new THREE.Color(0xffd580),
      emissiveIntensity: 0.85,
    });
    earthMaterialRef.current = earthMaterial;

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // Stream Authentic High-Resolution NASA Satellite Maps
    const texLoader = new THREE.TextureLoader();

    // 1. True-Color Blue Marble Satellite Imagery
    texLoader.load('/earth-blue-marble.jpg', tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      earthMaterial.map = tex;
      earthMaterial.needsUpdate = true;
      setIsTextureLoaded(true);
    });

    // 2. High-Definition Topographical Elevation & Mountain Bump Map
    texLoader.load('/earth-topology.png', tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      earthMaterial.bumpMap = tex;
      earthMaterial.bumpScale = 0.12;
      earthMaterial.needsUpdate = true;
    });

    // 3. Liquid Ocean Specular Mask (High gloss over oceans, matte over landmasses)
    texLoader.load('/earth-water.png', tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      earthMaterial.specularMap = tex;
      earthMaterial.specular = new THREE.Color(0x6688aa);
      earthMaterial.shininess = 32;
      earthMaterial.needsUpdate = true;
    });

    // 4. Real NASA Black Marble City Night Lights
    texLoader.load('/earth-night.jpg', tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      earthMaterial.emissiveMap = tex;
      earthMaterial.emissive = new THREE.Color(0xffd988);
      earthMaterial.emissiveIntensity = 0.85;
      earthMaterial.needsUpdate = true;
    });

    // F. Dynamic 3D Cloud Layer with Coriolis Flow
    const cloudsGeometry = new THREE.SphereGeometry(globeRadius * 1.008, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.52,
      blending: THREE.NormalBlending,
      depthWrite: false,
      roughness: 0.95,
      metalness: 0.0,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    texLoader.load('/earth-clouds.png', tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      cloudsMaterial.map = tex;
      cloudsMaterial.needsUpdate = true;
    });

    // G. Realistic Rayleigh Atmospheric Scattering Rim Glow
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.022, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 color;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float intensity = pow(0.70 - dot(vNormal, viewDir), 2.6);
          gl_FragColor = vec4(color, min(1.0, intensity * 1.6));
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(0x3ea8ff) }, // Rayleigh sky cyan-blue
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);
    atmosphereMeshRef.current = atmosphereMesh;

    // H. Outer Celestial Atmospheric Halo
    const haloGeometry = new THREE.SphereGeometry(globeRadius * 1.09, 64, 64);
    const haloMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(0.18, 0.55, 1.0, intensity * 0.75);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    globeGroup.add(haloMesh);
    haloMeshRef.current = haloMesh;

    // I. Subtle Holographic Institutional Equator Grid
    const equatorGeom = new THREE.RingGeometry(globeRadius * 1.132, globeRadius * 1.138, 96);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0xe5c45a,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const equatorRing = new THREE.Mesh(equatorGeom, equatorMat);
    equatorRing.rotation.x = Math.PI / 2;
    globeGroup.add(equatorRing);

    // J. Lighting Setup (Natural Solar Radiation)
    const ambientLight = new THREE.AmbientLight(0x0a1426, 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.7);
    sunLight.position.set(220, 80, 170);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x3e80cc, 0.4);
    rimLight.position.set(-200, -50, -120);
    scene.add(rimLight);

    // K. Sub-groups for Pins & Trade Arcs
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);
    pinGroupRef.current = pinGroup;

    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);
    arcGroupRef.current = arcGroup;

    // L. Raycaster for Hover & Click Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const checkCountryIntersection = (clientX: number, clientY: number): CountryGoldProfile | null => {
      if (!rendererRef.current || !cameraRef.current) return null;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const hitMeshes = countryHitSpheresRef.current.map(c => c.mesh);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        const found = countryHitSpheresRef.current.find(c => c.mesh === intersects[0].object);
        return found ? found.country : null;
      }
      return null;
    };

    // M. Pointer Handlers with Smooth Dragging
    const handlePointerDown = (clientX: number, clientY: number) => {
      isDraggingRef.current = true;
      isAutoTargetingRef.current = false;
      dragVelocityRef.current = { x: 0, y: 0 };
      previousPointerPosRef.current = { x: clientX, y: clientY };
      if (renderer.domElement) renderer.domElement.style.cursor = 'grabbing';
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (isDraggingRef.current && globeGroupRef.current) {
        const deltaX = clientX - previousPointerPosRef.current.x;
        const deltaY = clientY - previousPointerPosRef.current.y;

        const moveSpeed = 0.0055;
        globeGroupRef.current.rotation.y += deltaX * moveSpeed;
        globeGroupRef.current.rotation.x += deltaY * moveSpeed;

        // Clamp vertical pitch to prevent tumbling upside down
        globeGroupRef.current.rotation.x = Math.max(
          -Math.PI * 0.42,
          Math.min(Math.PI * 0.42, globeGroupRef.current.rotation.x)
        );

        dragVelocityRef.current = {
          x: deltaX * moveSpeed,
          y: deltaY * moveSpeed,
        };

        previousPointerPosRef.current = { x: clientX, y: clientY };
      } else {
        const country = checkCountryIntersection(clientX, clientY);
        if (country !== hoverPinRef.current) {
          hoverPinRef.current = country;
          setHoveredCountry(country);
          if (renderer.domElement) {
            renderer.domElement.style.cursor = country ? 'pointer' : 'grab';
          }
        }
      }
    };

    const handlePointerUp = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';

      const deltaDist = Math.hypot(
        clientX - previousPointerPosRef.current.x,
        clientY - previousPointerPosRef.current.y
      );

      if (deltaDist < 5) {
        const clicked = checkCountryIntersection(clientX, clientY);
        if (clicked) {
          onSelectCountryRef.current(clicked);
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => handlePointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = (e: MouseEvent) => handlePointerUp(e.clientX, e.clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        handlePointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(
        130,
        Math.min(360, cameraRef.current.position.z + e.deltaY * 0.18)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    dom.addEventListener('wheel', onWheel, { passive: false });

    // N. 60fps Animation Loop with 360-degree Continuous Orbit & Atmospheric Flow
    let animId: number;
    const clock = new THREE.Clock();
    let lastHeadingUpdate = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Axial Tilt Transition (23.44° astronomical tilt)
      if (tiltGroupRef.current) {
        const targetTilt = isAxialTiltRef.current ? THREE.MathUtils.degToRad(23.44) : 0;
        tiltGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          tiltGroupRef.current.rotation.z,
          targetTilt,
          0.05
        );
      }

      if (globeGroupRef.current) {
        const globe = globeGroupRef.current;

        // 1. Auto-target camera glide to selected country
        if (isAutoTargetingRef.current && targetRotationRef.current) {
          const target = targetRotationRef.current;
          const diffY = shortestAngleDiff(target.y, globe.rotation.y);
          const diffX = target.x - globe.rotation.x;

          globe.rotation.y += diffY * 0.08;
          globe.rotation.x += diffX * 0.08;

          if (Math.abs(diffY) < 0.003 && Math.abs(diffX) < 0.003) {
            globe.rotation.y = target.y;
            globe.rotation.x = target.x;
            isAutoTargetingRef.current = false;
          }
        }
        // 2. Dragging inertia damping
        else if (isDraggingRef.current) {
          // Processed in handlePointerMove
        } else if (
          Math.abs(dragVelocityRef.current.x) > 0.0001 ||
          Math.abs(dragVelocityRef.current.y) > 0.0001
        ) {
          globe.rotation.y += dragVelocityRef.current.x;
          globe.rotation.x += dragVelocityRef.current.y;
          dragVelocityRef.current.x *= 0.91;
          dragVelocityRef.current.y *= 0.91;
          globe.rotation.x = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, globe.rotation.x));
        }
        // 3. Continuous 360-Degree Orbit (Seamless, Glitch-Free)
        else if (isRotatingRef.current) {
          const orbitSpeedMultiplier = isTourModeRef.current ? 2.5 : rotationSpeedRef.current;
          const orbitAngularVelocity = 0.16 * orbitSpeedMultiplier;
          globe.rotation.y += orbitAngularVelocity * delta;

          // Normalized modulo wrapping in [0, 2PI)
          globe.rotation.y = ((globe.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

          // Restores stable natural equator pitch
          globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, 0.0, 0.02);
        }

        // 4. Coriolis Atmospheric Cloud Drift (Clouds float dynamically over Earth)
        if (cloudsMeshRef.current && isCloudsActiveRef.current && isRotatingRef.current) {
          const orbitSpeedMultiplier = isTourModeRef.current ? 2.5 : rotationSpeedRef.current;
          const cloudAngularVelocity = 0.185 * orbitSpeedMultiplier;
          cloudsMeshRef.current.rotation.y += cloudAngularVelocity * delta;
        }

        // 5. Update real-time 360° heading display
        if (elapsedTime - lastHeadingUpdate > 0.1) {
          lastHeadingUpdate = elapsedTime;
          const normY = ((globe.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const deg = Math.round((normY * 180) / Math.PI);
          setCurrentHeadingDeg(deg);
        }
      }

      // Move photons along active gold corridors
      if (photonPoolRef.current.length > 0) {
        photonPoolRef.current.forEach(p => {
          const progress = (elapsedTime * p.speed + p.offset) % 1;
          const pos = p.curve.getPoint(progress);
          p.mesh.position.copy(pos);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // O. ResizeObserver
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth === 0 || newHeight === 0) return;

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // P. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      renderer.dispose();
      if (dom.parentElement) dom.parentElement.removeChild(dom);
    };
  }, []); // Run ONCE on mount

  // 2. Dynamic Update: Country Pins & Beacons
  useEffect(() => {
    const pinGroup = pinGroupRef.current;
    if (!pinGroup) return;

    while (pinGroup.children.length > 0) {
      const obj = pinGroup.children[0];
      pinGroup.remove(obj);
    }
    countryHitSpheresRef.current = [];

    const globeRadius = 68;

    countries.forEach(country => {
      const pos = latLonToVector3(country.lat, country.lon, globeRadius + 0.6);
      const isSelected = selectedCountry?.code === country.code;
      const isTopHolder = country.reservesRank <= 5;

      // Pin Head (Golden Beacon Node)
      const pinHeadGeom = new THREE.SphereGeometry(
        isSelected ? 2.3 : isTopHolder ? 1.7 : 1.25,
        16,
        16
      );
      const pinHeadMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : isTopHolder ? 0xe5c45a : 0xc9a227,
      });
      const pinHead = new THREE.Mesh(pinHeadGeom, pinHeadMat);
      pinHead.position.copy(pos);
      pinGroup.add(pinHead);

      // Elevated Light Beacon Line
      const normal = pos.clone().normalize();
      const beaconHeight = isSelected ? 12.5 : isTopHolder ? 8.5 : 5.0;
      const beaconGeom = new THREE.CylinderGeometry(0.2, 0.5, beaconHeight, 8);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : 0xe5c45a,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.65,
      });
      const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
      const midPoint = pos.clone().add(normal.clone().multiplyScalar(beaconHeight / 2));
      beaconMesh.position.copy(midPoint);
      beaconMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      pinGroup.add(beaconMesh);

      // Raycast Collider (invisible outer hit sphere)
      const hitGeom = new THREE.SphereGeometry(3.6, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeom, hitMat);
      hitMesh.position.copy(pos);
      pinGroup.add(hitMesh);
      countryHitSpheresRef.current.push({ mesh: hitMesh, country });
    });
  }, [countries, selectedCountry]);

  // 3. Dynamic Update: Trade Arcs & Photons
  useEffect(() => {
    const arcGroup = arcGroupRef.current;
    if (!arcGroup) return;

    while (arcGroup.children.length > 0) {
      const obj = arcGroup.children[0];
      arcGroup.remove(obj);
    }
    photonPoolRef.current = [];

    const globeRadius = 68;

    const filteredTrades = trades.filter(t => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'PHYSICAL' && t.category === 'PHYSICAL_BULLION') return true;
      if (activeFilter === 'OTC' && t.category === 'OTC_CLEARING') return true;
      if (activeFilter === 'CENTRAL_BANK' && t.category === 'CENTRAL_BANK') return true;
      if (activeFilter === 'REFINERIES' && t.category === 'REFINERY_FLOW') return true;
      return false;
    });

    const photonGeom = new THREE.SphereGeometry(1.2, 10, 10);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    filteredTrades.forEach((trade, idx) => {
      const c1 = countries.find(c => c.code === trade.from);
      const c2 = countries.find(c => c.code === trade.to);
      if (!c1 || !c2) return;

      const v1 = latLonToVector3(c1.lat, c1.lon, globeRadius);
      const v2 = latLonToVector3(c2.lat, c2.lon, globeRadius);

      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const dist = v1.distanceTo(v2);
      const altitude = globeRadius + Math.min(36, dist * 0.38);
      mid.normalize().multiplyScalar(altitude);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const isConnectedToSelected =
        selectedCountry && (trade.from === selectedCountry.code || trade.to === selectedCountry.code);

      const curvePoints = curve.getPoints(45);
      const arcGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: isConnectedToSelected
          ? 0xffffff
          : trade.category === 'OTC_CLEARING'
          ? 0xe5c45a
          : trade.category === 'PHYSICAL_BULLION'
          ? 0xc9a227
          : 0x4ade80,
        transparent: true,
        opacity: isConnectedToSelected ? 0.95 : selectedCountry ? 0.22 : 0.65,
      });
      const arcLine = new THREE.Line(arcGeom, arcMat);
      arcGroup.add(arcLine);

      const photonMesh = new THREE.Mesh(photonGeom, photonMat);
      arcGroup.add(photonMesh);
      photonPoolRef.current.push({
        mesh: photonMesh,
        curve,
        offset: (idx * 0.16) % 1,
        speed: isConnectedToSelected ? 0.55 : 0.32,
      });
    });
  }, [trades, activeFilter, countries, selectedCountry]);

  // Meridian Presets Navigation
  const snapToMeridian = useCallback((lon: number, lat = 20) => {
    const target = getTargetRotationForLatLon(lat, lon);
    targetRotationRef.current = target;
    isAutoTargetingRef.current = true;
    setIsTourMode(false);
  }, []);

  const handleResetToPrimeMeridian = useCallback(() => {
    snapToMeridian(0, 25);
  }, [snapToMeridian]);

  const handleToggleTour = useCallback(() => {
    setIsTourMode(prev => {
      const next = !prev;
      if (next) {
        setIsRotating(true);
      }
      return next;
    });
  }, []);

  const handleZoom = useCallback((direction: 'IN' | 'OUT') => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const step = 28;
    cameraRef.current.position.z =
      direction === 'IN'
        ? Math.max(130, currentZ - step)
        : Math.min(360, currentZ + step);
  }, []);

  return (
    <div className="relative w-full h-full bg-[#03060c] select-none overflow-hidden">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: 360° Continuous Orbit Master HUD */}
      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-[#080808]/92 backdrop-blur-md border border-[#242424] rounded-sm p-2 pointer-events-auto flex flex-wrap items-center gap-2 shadow-2xl">
          {/* Live 360° Orbit Status Indicator */}
          <div className="flex items-center gap-1.5 px-1.5 py-1 bg-[#111] rounded-xs border border-[#222]">
            <span
              className={`w-2 h-2 rounded-full ${
                isRotating
                  ? isTourMode
                    ? 'bg-[#E5C45A] animate-ping'
                    : 'bg-[#22c55e] animate-pulse'
                  : 'bg-[#eab308]'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5C45A] font-bold">
              {isTourMode ? '360° TOUR' : '360° ORBIT'}
            </span>
            {isTextureLoaded && (
              <span className="text-[8px] font-mono uppercase px-1 py-0.2 bg-[#22c55e]/15 text-[#22c55e] rounded-2xs border border-[#22c55e]/30">
                NASA HD
              </span>
            )}
          </div>

          {/* Heading Coordinates & Meridian Degrees */}
          <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-[#aaa] px-1.5 py-1 bg-[#111] rounded-xs border border-[#222]">
            <Compass className="w-3 h-3 text-[#E5C45A]" />
            <span className="tabular-nums font-bold text-[#F5F5F5]">{currentHeadingDeg.toString().padStart(3, '0')}°</span>
            <span className="text-[8px] text-[#777]">
              {currentHeadingDeg >= 340 || currentHeadingDeg <= 20
                ? 'LONDON (0°)'
                : currentHeadingDeg >= 50 && currentHeadingDeg <= 80
                ? 'DUBAI (55°E)'
                : currentHeadingDeg >= 95 && currentHeadingDeg <= 130
                ? 'ASIA PACIFIC'
                : currentHeadingDeg >= 260 && currentHeadingDeg <= 300
                ? 'NEW YORK (74°W)'
                : 'GLOBAL'}
            </span>
          </div>

          {/* Play / Pause Toggle */}
          <button
            onClick={() => {
              setIsRotating(!isRotating);
              setIsTourMode(false);
            }}
            title={isRotating ? 'Pause Orbit' : 'Resume Continuous 360° Orbit'}
            className="flex items-center gap-1 px-2 py-1 rounded-xs bg-[#161616] hover:bg-[#222] border border-[#333] text-[10px] font-mono text-[#E5C45A] font-bold cursor-pointer transition-colors"
          >
            {isRotating ? (
              <>
                <Pause className="w-3 h-3 text-[#E5C45A]" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#22c55e]" />
                <span>ORBIT</span>
              </>
            )}
          </button>

          {/* 360° Tour Acceleration Button */}
          <button
            onClick={handleToggleTour}
            title="Accelerate continuous 360 degree panoramic orbit around the globe"
            className={`flex items-center gap-1 px-2 py-1 rounded-xs border text-[10px] font-mono font-bold cursor-pointer transition-all ${
              isTourMode
                ? 'bg-[#E5C45A] text-black border-[#E5C45A] shadow-[0_0_12px_rgba(229,196,90,0.3)]'
                : 'bg-[#161616] hover:bg-[#222] text-[#E5C45A] border-[#333]'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>360° TOUR</span>
          </button>

          {/* Speed Selection Pills */}
          <div className="hidden sm:flex items-center gap-0.5 border-l border-[#242424] pl-1.5">
            {[
              { label: '0.5x', value: 0.5 },
              { label: '1x', value: 1.0 },
              { label: '2x', value: 2.0 },
              { label: '4x', value: 4.0 },
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  setRotationSpeedMultiplier(s.value);
                  setIsRotating(true);
                  setIsTourMode(false);
                }}
                className={`px-1.5 py-0.5 rounded-xs text-[9px] font-mono cursor-pointer transition-colors ${
                  rotationSpeedMultiplier === s.value && !isTourMode
                    ? 'bg-[#C9A227] text-black font-bold'
                    : 'bg-[#121212] text-[#888] hover:text-white border border-[#222]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Reset to Prime Meridian */}
          <button
            onClick={handleResetToPrimeMeridian}
            title="Re-orient to Prime Meridian (London LBMA)"
            className="p-1 rounded-xs bg-[#161616] hover:bg-[#222] border border-[#333] text-[#aaa] hover:text-[#E5C45A] cursor-pointer transition-colors"
          >
            <RotateCw className="w-3 h-3" />
          </button>
        </div>

        {/* Realistic Earth Atmosphere & Layer Toggles */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#080808]/90 backdrop-blur-sm px-2 py-1 rounded-xs border border-[#202020] pointer-events-auto text-[9px] font-mono text-[#aaa]">
          <span className="text-[#E5C45A] font-bold flex items-center gap-1">
            <Layers className="w-3 h-3" />
            LAYERS:
          </span>

          {/* Clouds Toggle */}
          <button
            onClick={() => setIsCloudsActive(!isCloudsActive)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xs border cursor-pointer transition-colors ${
              isCloudsActive
                ? 'bg-[#1a2e3b] text-[#7dd3fc] border-[#38bdf8]/40'
                : 'bg-[#111] text-[#666] border-[#222]'
            }`}
            title="Toggle Realistic 3D Cloud Layer with Coriolis Flow"
          >
            <Cloud className="w-2.5 h-2.5" />
            <span>CLOUDS</span>
          </button>

          {/* Night Lights Toggle */}
          <button
            onClick={() => setIsNightLightsActive(!isNightLightsActive)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-xs border cursor-pointer transition-colors ${
              isNightLightsActive
                ? 'bg-[#2e2612] text-[#fde047] border-[#eab308]/40'
                : 'bg-[#111] text-[#666] border-[#222]'
            }`}
            title="Toggle Real NASA Black Marble City Night Lights"
          >
            <Moon className="w-2.5 h-2.5" />
            <span>NIGHT LIGHTS</span>
          </button>

          {/* Axial Tilt Toggle */}
          <button
            onClick={() => setIsAxialTilt(!isAxialTilt)}
            className={`px-1.5 py-0.5 rounded-xs border cursor-pointer transition-colors ${
              isAxialTilt
                ? 'bg-[#1f2937] text-[#93c5fd] border-[#60a5fa]/40 font-bold'
                : 'bg-[#111] text-[#666] border-[#222]'
            }`}
            title="Toggle Real 23.44° Earth Axial Tilt"
          >
            <span>TILT 23.4°</span>
          </button>

          {/* Major Financial Hub Snaps */}
          <span className="text-[#444] mx-0.5">|</span>
          <span className="text-[#888]">HUBS:</span>
          <button
            onClick={() => snapToMeridian(0, 48)}
            className="hover:text-[#E5C45A] cursor-pointer"
            title="London LBMA"
          >
            LON
          </button>
          <button
            onClick={() => snapToMeridian(-74, 38)}
            className="hover:text-[#E5C45A] cursor-pointer"
            title="New York COMEX"
          >
            NYC
          </button>
          <button
            onClick={() => snapToMeridian(55, 25)}
            className="hover:text-[#E5C45A] cursor-pointer"
            title="Dubai DGCX"
          >
            DXB
          </button>
          <button
            onClick={() => snapToMeridian(121, 31)}
            className="hover:text-[#E5C45A] cursor-pointer"
            title="Shanghai SGE"
          >
            SHA
          </button>
          <button
            onClick={() => snapToMeridian(139, 35)}
            className="hover:text-[#E5C45A] cursor-pointer"
            title="Tokyo TOCOM"
          >
            TYO
          </button>
        </div>
      </div>

      {/* Top Right: Zoom & Orientation Controls */}
      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 flex flex-col gap-1 pointer-events-auto">
        <button
          onClick={() => handleZoom('IN')}
          title="Zoom In"
          className="p-1.5 rounded-xs bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#E5C45A] cursor-pointer transition-colors shadow-lg"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom('OUT')}
          title="Zoom Out"
          className="p-1.5 rounded-xs bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#E5C45A] cursor-pointer transition-colors shadow-lg"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetToPrimeMeridian}
          title="Align to 0° Meridian"
          className="p-1.5 rounded-xs bg-[#080808]/90 hover:bg-[#181818] border border-[#242424] text-[#aaa] hover:text-[#E5C45A] cursor-pointer transition-colors shadow-lg"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Floating Metadata & Realism Specs */}
      <div className="absolute bottom-2.5 right-2.5 hidden lg:flex items-center gap-2 px-2 py-1 bg-[#080808]/80 backdrop-blur-xs rounded-xs border border-[#1a1a1a] text-[9px] font-mono text-[#666] pointer-events-none">
        <span>NASA BLUE MARBLE 4K</span>
        <span>•</span>
        <span>SPECULAR WATER GLINT</span>
        <span>•</span>
        <span>RAYLEIGH ATMOSPHERE</span>
      </div>

      {/* Hovered Country Instant Preview Card */}
      {hoveredCountry && (
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 pointer-events-none bg-[#080808]/95 backdrop-blur-md border border-[#C9A227]/60 rounded-xs p-3 font-mono text-xs shadow-2xl flex items-center gap-3.5 animate-fadeIn">
          <div className="text-2xl">{hoveredCountry.flagEmoji}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F5F5F5] uppercase tracking-wider text-sm">
                {hoveredCountry.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#C9A227]/20 text-[#E5C45A] font-bold border border-[#C9A227]/30">
                RANK #{hoveredCountry.reservesRank}
              </span>
            </div>
            <div className="text-[10px] text-[#aaa] mt-0.5 flex items-center gap-3">
              <span>
                RESERVES:{' '}
                <strong className="text-[#E5C45A] font-bold">{hoveredCountry.reservesTonnage.toLocaleString()} MT</strong>
              </span>
              <span>•</span>
              <span>
                ANNUAL MINED:{' '}
                <strong className="text-[#22c55e] font-bold">{hoveredCountry.annualMineOutputMT} MT/yr</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
