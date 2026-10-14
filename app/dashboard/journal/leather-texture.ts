
import * as THREE from "three";

export function createLeatherMaps() {
  const size = 1024;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Could not create leather color map");
  }

  let seed = 73241;

  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // A restrained, deep navy-blue leather base.
  ctx.fillStyle = "#172b45";
  ctx.fillRect(0, 0, size, size);

  // Broad, subtle tonal variation prevents a synthetic,
  // perfectly uniform surface.
  for (let i = 0; i < 1000; i++) {
    const x = random() * size;
    const y = random() * size;
    const radius = 12 + random() * 65;

    const gradient = ctx.createRadialGradient(
      x,
      y,
      0,
      x,
      y,
      radius
    );

    const alpha = 0.008 + random() * 0.018;

    gradient.addColorStop(
      0,
      `rgba(100, 127, 157, ${alpha})`
    );
    gradient.addColorStop(1, "rgba(5, 13, 25, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      x - radius,
      y - radius,
      radius * 2,
      radius * 2
    );
  }

  // Fine natural grain: irregular, elongated pores rather
  // than obvious circular spots or a repeating checkerboard.
  for (let i = 0; i < 52000; i++) {
    const x = random() * size;
    const y = random() * size;

    const length = 0.5 + random() * 2.0;
    const width = 0.2 + random() * 0.65;
    const angle = random() * Math.PI;

    const light = random() > 0.56;
    const alpha = 0.018 + random() * 0.045;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.fillStyle = light
      ? `rgba(137, 158, 181, ${alpha})`
      : `rgba(1, 7, 15, ${alpha * 1.2})`;

    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      length,
      width,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  // Tiny, irregular pores add detail without making the
  // material look rough or artificially bumpy.
  for (let i = 0; i < 12000; i++) {
    const x = random() * size;
    const y = random() * size;
    const r = 0.25 + random() * 0.65;

    ctx.fillStyle =
      random() > 0.5
        ? "rgba(2, 8, 17, 0.08)"
        : "rgba(126, 148, 174, 0.045)";

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const colorMap = new THREE.CanvasTexture(canvas);

  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.ClampToEdgeWrapping;
  colorMap.wrapT = THREE.ClampToEdgeWrapping;
  colorMap.anisotropy = 8;
  colorMap.generateMipmaps = true;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.magFilter = THREE.LinearFilter;
  colorMap.needsUpdate = true;

  // Build a low-amplitude height field from fine random noise.
  // Deriving the normal map from this field gives the grain
  // actual surface relief instead of colored speckles alone.
  const height = new Float32Array(size * size);

  for (let i = 0; i < height.length; i++) {
    height[i] = random();
  }

  // Smooth the noise slightly to produce a softer leather grain.
  for (let pass = 0; pass < 2; pass++) {
    const next = new Float32Array(height.length);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let total = 0;
        let weight = 0;

        for (let oy = -1; oy <= 1; oy++) {
          for (let ox = -1; ox <= 1; ox++) {
            const sx = THREE.MathUtils.clamp(x + ox, 0, size - 1);
            const sy = THREE.MathUtils.clamp(y + oy, 0, size - 1);
            const w = ox === 0 && oy === 0 ? 4 : 1;

            total += height[sy * size + sx] * w;
            weight += w;
          }
        }

        next[y * size + x] = total / weight;
      }
    }

    height.set(next);
  }

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = size;
  normalCanvas.height = size;

  const normalCtx = normalCanvas.getContext("2d");

  if (!normalCtx) {
    throw new Error("Could not create leather normal map");
  }

  const normalImage = normalCtx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const left = height[y * size + Math.max(0, x - 1)];
      const right = height[y * size + Math.min(size - 1, x + 1)];

      const up = height[Math.max(0, y - 1) * size + x];
      const down = height[Math.min(size - 1, y + 1) * size + x];

      const dx = (right - left) * 2.0;
      const dy = (down - up) * 2.0;

      let nx = -dx * 0.65;
      let ny = -dy * 0.65;
      let nz = 1;

      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

      nx /= length;
      ny /= length;
      nz /= length;

      const i = (y * size + x) * 4;

      normalImage.data[i] = (nx * 0.5 + 0.5) * 255;
      normalImage.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      normalImage.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      normalImage.data[i + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImage, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);

  normalMap.wrapS = THREE.ClampToEdgeWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;
  normalMap.anisotropy = 8;
  normalMap.generateMipmaps = true;
  normalMap.minFilter = THREE.LinearMipmapLinearFilter;
  normalMap.magFilter = THREE.LinearFilter;
  normalMap.needsUpdate = true;

  return { colorMap, normalMap };
}
