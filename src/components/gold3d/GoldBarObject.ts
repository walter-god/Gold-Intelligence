import * as THREE from 'three';
import gsap from 'gsap';
import { generateGoldStampTextures } from './GoldTextureGenerator';

export interface ExplodedLayerData {
  id: string;
  name: string;
  tagline: string;
  metric: string;
  metricLabel: string;
  offsetY: number;
}

export const EXPLODED_LAYERS: ExplodedLayerData[] = [
  {
    id: 'layer-purity',
    name: 'PHYSICAL GOLD',
    tagline: '99.99% PURE INVESTMENT INGOT',
    metric: '999.9 AU',
    metricLabel: 'PURITY GRADE',
    offsetY: 1.8,
  },
  {
    id: 'layer-market',
    name: 'XAUUSD SPOT MARKET',
    tagline: 'GLOBAL OTC BENCHMARK SYNTHESIS',
    metric: 'LBMA DMA',
    metricLabel: 'PRICE DISCOVERY',
    offsetY: 0.9,
  },
  {
    id: 'layer-liquidity',
    name: 'GLOBAL LIQUIDITY',
    tagline: 'DEEP INTERBANK & COMEX FLOWS',
    metric: '$2.4B DEPTH',
    metricLabel: 'TIER-1 LIQUIDITY',
    offsetY: 0.0,
  },
  {
    id: 'layer-structure',
    name: 'MARKET MOMENTUM',
    tagline: 'SMART MONEY ALGORITHMIC BIAS',
    metric: 'BULLISH BOS',
    metricLabel: 'STRUCTURE',
    offsetY: -0.9,
  },
  {
    id: 'layer-execution',
    name: 'EXECUTION GATEWAY',
    tagline: 'SUB-MILLISECOND FIX & BRIDGE ROUTING',
    metric: '< 24ms DMA',
    metricLabel: 'EXECUTION READY',
    offsetY: -1.8,
  },
];

export class GoldBarSceneManager {
  public group: THREE.Group;
  public layers: THREE.Mesh[] = [];
  public laserLinesGroup: THREE.Group;
  public isExploded: boolean = false;
  private timeline: gsap.core.Timeline | null = null;
  private goldMaterial: THREE.MeshPhysicalMaterial;
  private digitalMaterial: THREE.MeshPhysicalMaterial;
  private coreMaterial: THREE.MeshPhysicalMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.laserLinesGroup = new THREE.Group();
    this.laserLinesGroup.visible = false;
    this.group.add(this.laserLinesGroup);

    const { bumpMap, roughnessMap, envMap } = generateGoldStampTextures();

    // 1. Primary Physical Gold Material (Investment-grade polished bullion)
    this.goldMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf6d166),
      emissive: new THREE.Color(0x3a2503),
      emissiveIntensity: 0.12,
      metalness: 0.96,
      roughness: 0.19,
      bumpMap: bumpMap,
      bumpScale: 0.025,
      roughnessMap: roughnessMap,
      envMap: envMap,
      envMapIntensity: 1.8,
      clearcoat: 0.45,
      clearcoatRoughness: 0.1,
      reflectivity: 0.98,
    });

    // 2. Core Bullion Metal Material
    this.coreMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xeec048),
      emissive: new THREE.Color(0x281b04),
      emissiveIntensity: 0.08,
      metalness: 0.94,
      roughness: 0.28,
      envMap: envMap,
      envMapIntensity: 1.4,
      clearcoat: 0.2,
    });

    // 3. Digital Glass / Liquid Gold Layer (representing synthetic DMA spot)
    this.digitalMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffe680),
      emissive: new THREE.Color(0x8a6208),
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.08,
      transmission: 0.6,
      ior: 1.55,
      transparent: true,
      opacity: 0.9,
      envMap: envMap,
      envMapIntensity: 2.2,
    });

    this.buildLayers();
    this.buildLaserConnectors();
  }

  private buildLayers() {
    // Standard investment bar proportions: length 4.4, width 2.2
    const length = 4.4;
    const width = 2.2;

    // Helper to create trapezoidal beveled slab
    const createBeveledSlab = (
      topScale: number,
      bottomScale: number,
      thickness: number,
      material: THREE.Material
    ) => {
      const shape = new THREE.Shape();
      const hw = (width * bottomScale) / 2;
      const hl = (length * bottomScale) / 2;
      const radius = 0.15;

      // Rounded rectangle path for ingot mold realism
      shape.moveTo(-hl + radius, -hw);
      shape.lineTo(hl - radius, -hw);
      shape.quadraticCurveTo(hl, -hw, hl, -hw + radius);
      shape.lineTo(hl, hw - radius);
      shape.quadraticCurveTo(hl, hw, hl - radius, hw);
      shape.lineTo(-hl + radius, hw);
      shape.quadraticCurveTo(-hl, hw, -hl, hw - radius);
      shape.lineTo(-hl, -hw + radius);
      shape.quadraticCurveTo(-hl, -hw, -hl + radius, -hw);

      const extrudeSettings = {
        depth: thickness,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.06,
        bevelThickness: 0.06,
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.center();
      // Orient geometry so Z is Y (flat horizontal bar)
      geometry.rotateX(Math.PI / 2);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Layer 0: Top Embossed Plate (Physical Gold with hallmark engravings)
    const layer0 = createBeveledSlab(0.96, 0.98, 0.12, this.goldMaterial);
    layer0.position.y = 0.32;
    layer0.userData = { originalY: 0.32, layerIndex: 0 };
    this.group.add(layer0);
    this.layers.push(layer0);

    // Layer 1: Bullion Upper Core (Physical Custody)
    const layer1 = createBeveledSlab(0.98, 1.0, 0.16, this.coreMaterial);
    layer1.position.y = 0.16;
    layer1.userData = { originalY: 0.16, layerIndex: 1 };
    this.group.add(layer1);
    this.layers.push(layer1);

    // Layer 2: Spot DMA Matrix (Translucent golden crystal lattice)
    const layer2 = createBeveledSlab(1.0, 1.01, 0.14, this.digitalMaterial);
    layer2.position.y = 0.0;
    layer2.userData = { originalY: 0.0, layerIndex: 2 };
    this.group.add(layer2);
    this.layers.push(layer2);

    // Layer 3: Algorithmic Order Block Core
    const layer3 = createBeveledSlab(1.01, 1.03, 0.16, this.coreMaterial);
    layer3.position.y = -0.16;
    layer3.userData = { originalY: -0.16, layerIndex: 3 };
    this.group.add(layer3);
    this.layers.push(layer3);

    // Layer 4: Foundation Settlement Chassis
    const layer4 = createBeveledSlab(1.03, 1.06, 0.14, this.goldMaterial);
    layer4.position.y = -0.32;
    layer4.userData = { originalY: -0.32, layerIndex: 4 };
    this.group.add(layer4);
    this.layers.push(layer4);
  }

  private buildLaserConnectors() {
    // 4 vertical gold laser indicator guidelines that connect the exploded layers
    const corners = [
      { x: -1.8, z: -0.85 },
      { x: 1.8, z: -0.85 },
      { x: 1.8, z: 0.85 },
      { x: -1.8, z: 0.85 },
    ];

    corners.forEach(pos => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos.x, -2.4, pos.z),
        new THREE.Vector3(pos.x, 2.4, pos.z),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0xe5c45a,
        dashSize: 0.08,
        gapSize: 0.06,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      this.laserLinesGroup.add(line);
    });
  }

  public toggleExplodedView(explode: boolean, duration: number = 1.2) {
    this.isExploded = explode;
    if (this.timeline) {
      this.timeline.kill();
    }

    this.timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut', duration: duration },
    });

    if (explode) {
      this.laserLinesGroup.visible = true;
      gsap.to(this.laserLinesGroup.position, {
        y: 0,
        duration: duration,
        ease: 'power3.out',
      });

      this.layers.forEach((mesh, index) => {
        const targetY = EXPLODED_LAYERS[index].offsetY;
        const targetRotY = (index - 2) * 0.05;

        this.timeline?.to(
          mesh.position,
          {
            y: targetY,
            z: Math.sin(index) * 0.15,
          },
          0
        );

        this.timeline?.to(
          mesh.rotation,
          {
            y: targetRotY,
          },
          0
        );
      });
    } else {
      this.layers.forEach(mesh => {
        const origY = mesh.userData.originalY || 0;
        this.timeline?.to(
          mesh.position,
          {
            y: origY,
            z: 0,
          },
          0
        );
        this.timeline?.to(
          mesh.rotation,
          {
            y: 0,
            x: 0,
          },
          0
        );
      });

      this.timeline.add(() => {
        if (!this.isExploded) {
          this.laserLinesGroup.visible = false;
        }
      });
    }
  }

  public triggerTickPulse(isBullish: boolean) {
    const pulseColor = isBullish ? 0x22c55e : 0xef4444;
    const targetEmissive = isBullish ? 0x3a5518 : 0x551818;

    gsap.to(this.goldMaterial.emissive, {
      r: (pulseColor >> 16 & 255) / 255 * 0.4,
      g: (pulseColor >> 8 & 255) / 255 * 0.4,
      b: (pulseColor & 255) / 255 * 0.4,
      duration: 0.18,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: () => {
        this.goldMaterial.emissive.setHex(0x3a2503);
      },
    });
  }

  public dispose() {
    if (this.timeline) {
      this.timeline.kill();
    }
    this.layers.forEach(m => {
      m.geometry.dispose();
      if (Array.isArray(m.material)) {
        m.material.forEach(mat => mat.dispose());
      } else {
        m.material.dispose();
      }
    });
  }
}
