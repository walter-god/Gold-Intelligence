import * as THREE from 'three';

/**
 * Generates high-resolution procedural textures for the investment-grade Gold Bar:
 * - Hallmark seal ("AUREX BULLION RESERVE • LONDON")
 * - Purity stamp ("999.9 FINE GOLD")
 * - Weight certification ("1 KILO / 32.15 OZ")
 * - Individual assay serial number ("AU-889421-DMA")
 * - Brushed metal micro-anisotropy and surface bump
 */
export function generateGoldStampTextures(): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  envMap: THREE.DataTexture;
} {
  // 1. High-Res Canvas for Ingot Markings Bump Map (2048x1024)
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base neutral height (128 = 0 displacement)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle micro-surface noise and rolling marks
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 6;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // Fine brushed horizontal streaks (ingot cast cooling grain)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() - 0.5) * 2);
    ctx.lineTo(canvas.width, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
  }

  // Deep engraved stamps are darker (recessed bump)
  ctx.save();
  ctx.fillStyle = '#1c1c1c';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Outer Hallmark Seal Ring
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#222222';
  ctx.beginPath();
  ctx.arc(cx, cy - 180, 110, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy - 180, 96, 0, Math.PI * 2);
  ctx.stroke();

  // Seal Icon / Crest inside circle
  ctx.font = 'bold 36px "IBM Plex Mono", monospace';
  ctx.fillText('AUREX', cx, cy - 200);

  ctx.font = '600 20px "IBM Plex Sans", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('BULLION VAULT', cx, cy - 165);

  ctx.font = 'bold 16px "IBM Plex Mono", monospace';
  ctx.fillText('★ LONDON ★', cx, cy - 135);

  // Main Purity Markings
  ctx.font = '900 130px "IBM Plex Mono", sans-serif';
  ctx.letterSpacing = '12px';
  ctx.fillText('999.9', cx, cy + 20);

  ctx.font = 'bold 44px "IBM Plex Sans", sans-serif';
  ctx.letterSpacing = '18px';
  ctx.fillText('FINE GOLD', cx, cy + 120);

  ctx.font = '600 32px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '8px';
  ctx.fillText('NET WT 1000g', cx, cy + 210);

  // Certification & Serial ID at base
  ctx.font = '500 24px "IBM Plex Sans", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('LBMA GOOD DELIVERY ACCREDITED', cx, cy + 280);

  ctx.font = 'bold 36px "IBM Plex Mono", monospace';
  ctx.letterSpacing = '14px';
  ctx.fillText('AU • 884192 • DMA', cx, cy + 350);

  ctx.restore();

  const bumpMap = new THREE.CanvasTexture(canvas);
  bumpMap.wrapS = THREE.ClampToEdgeWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.needsUpdate = true;

  // 2. Roughness Map (stamps and edges have slightly higher roughness to catch light softly)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 1024;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  rCtx.fillStyle = '#282828'; // Base polished gold roughness (~0.16)
  rCtx.fillRect(0, 0, rCanvas.width, rCanvas.height);

  // Draw stamp locations with slightly higher roughness
  rCtx.drawImage(canvas, 0, 0, rCanvas.width, rCanvas.height);

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.needsUpdate = true;

  // 3. Procedural Studio High-Dynamic Light Rig Environment Map
  // Generates warm metallic studio reflections without requiring external heavy HDR files
  const envWidth = 256;
  const envHeight = 128;
  const envData = new Float32Array(envWidth * envHeight * 4);

  for (let y = 0; y < envHeight; y++) {
    const v = y / envHeight;
    for (let x = 0; x < envWidth; x++) {
      const u = x / envWidth;
      const idx = (y * envWidth + x) * 4;

      // Dark atmospheric studio background
      let r = 0.03;
      let g = 0.03;
      let b = 0.04;

      // Soft overhead softbox reflection
      if (v > 0.1 && v < 0.45 && u > 0.25 && u < 0.75) {
        const factor = Math.sin(((v - 0.1) / 0.35) * Math.PI) * Math.sin(((u - 0.25) / 0.5) * Math.PI);
        r += factor * 2.8;
        g += factor * 2.5;
        b += factor * 1.8;
      }

      // Warm lateral rim light reflection (left)
      if (v > 0.2 && v < 0.8 && u > 0.05 && u < 0.2) {
        const factor = Math.sin(((v - 0.2) / 0.6) * Math.PI) * Math.sin(((u - 0.05) / 0.15) * Math.PI);
        r += factor * 2.2;
        g += factor * 1.8;
        b += factor * 0.9;
      }

      // Cool accent rim light reflection (right)
      if (v > 0.3 && v < 0.7 && u > 0.82 && u < 0.95) {
        const factor = Math.sin(((v - 0.3) / 0.4) * Math.PI) * Math.sin(((u - 0.82) / 0.13) * Math.PI);
        r += factor * 1.2;
        g += factor * 1.3;
        b += factor * 1.6;
      }

      envData[idx] = r;
      envData[idx + 1] = g;
      envData[idx + 2] = b;
      envData[idx + 3] = 1.0;
    }
  }

  const envMap = new THREE.DataTexture(
    envData,
    envWidth,
    envHeight,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  envMap.needsUpdate = true;

  return { bumpMap, roughnessMap, envMap };
}
