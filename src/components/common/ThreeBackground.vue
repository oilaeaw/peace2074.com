<template>
  <canvas ref="canvasRef" class="three-background"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let animationFrameId: number;
let removePointerListener: (() => void) | null = null;
let removeDoubleClickListener: (() => void) | null = null;

const ENABLE_MOON = false;
// Raycaster for moon hit testing
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const MOON_HIDDEN_KEY = "moon-hidden";
let moonHidden = false;

const meteorDirection = new THREE.Vector3(1, -0.35, 0);
const meteorDirectionTarget = meteorDirection.clone();
const moonBasePosition = new THREE.Vector3(-2.8, 1.6, -6);

type ShootingStar = {
  group: THREE.Group;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  headMaterial: THREE.MeshBasicMaterial;
  tailMaterial: THREE.MeshBasicMaterial;
};

const shootingStars: ShootingStar[] = [];
let shootingStarTimer = 0;
let meteorShowerTimer = 14;

type SkySettings = {
  background: THREE.ColorRepresentation;
  backgroundAlpha: number;
  ambientIntensity: number;
  moonKeyIntensity: number;
  rimIntensity: number;
  moonEmissive: number;
  glowOpacity: number;
  starOpacity: number;
  shootingInterval: [number, number];
};

const getSkySettings = (): SkySettings => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) {
    // Dawn
    return {
      background: 0x112033,
      backgroundAlpha: 0,
      ambientIntensity: 0.36,
      moonKeyIntensity: 0.55,
      rimIntensity: 0.28,
      moonEmissive: 0.22,
      glowOpacity: 0.32,
      starOpacity: 0.25,
      shootingInterval: [4.5, 7],
    };
  }
  if (hour >= 8 && hour < 17) {
    // Day
    return {
      background: 0x1b2a40,
      backgroundAlpha: 0,
      ambientIntensity: 0.42,
      moonKeyIntensity: 0.48,
      rimIntensity: 0.22,
      moonEmissive: 0.16,
      glowOpacity: 0.22,
      starOpacity: 0.12,
      shootingInterval: [6.5, 10],
    };
  }
  if (hour >= 17 && hour < 20) {
    // Dusk
    return {
      background: 0x0b1020,
      backgroundAlpha: 0,
      ambientIntensity: 0.34,
      moonKeyIntensity: 0.68,
      rimIntensity: 0.32,
      moonEmissive: 0.28,
      glowOpacity: 0.36,
      starOpacity: 0.55,
      shootingInterval: [3.2, 6],
    };
  }
  // Night
  return {
    background: 0x050814,
    backgroundAlpha: 0,
    ambientIntensity: 0.38,
    moonKeyIntensity: 0.95,
    rimIntensity: 0.38,
    moonEmissive: 0.36,
    glowOpacity: 0.42,
    starOpacity: 0.78,
    shootingInterval: [2.6, 4.8],
  };
};

onMounted(() => {
  if (!canvasRef.value) return;

  const sky = getSkySettings();

  // Scene
  const scene = new THREE.Scene();

  // Subtle ambient light and a cool directional light to sculpt the moon
  const ambientLight = new THREE.AmbientLight(0x8899bb, sky.ambientIntensity);
  const moonLight = new THREE.DirectionalLight(0xcad8ff, sky.moonKeyIntensity);
  moonLight.position.set(5, 6, 8);

  const rimLight = new THREE.DirectionalLight(0x7aa5ff, sky.rimIntensity);
  rimLight.position.set(-6, 4, -4);

  scene.add(ambientLight, moonLight, rimLight);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true, // Keep alpha, but we'll tint based on time of day
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(new THREE.Color(sky.background), sky.backgroundAlpha);

  // Stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 2200;
  const posArray = new Float32Array(starsCount * 3);

  for (let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * (Math.random() * 80);
  }

  starsGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  const starsMaterial = new THREE.PointsMaterial({
    size: 0.012,
    color: 0xffffff,
    opacity: sky.starOpacity,
    transparent: true,
  });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  // Moon texture helpers
  const generateNoise = (size: number, octaves = 4, persistence = 0.55) => {
    const data = new Float32Array(size * size);
    const random = () => Math.random() * 2 - 1;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let amplitude = 1;
        let frequency = 1;
        let value = 0;
        for (let o = 0; o < octaves; o++) {
          const sampleX = (x / size) * frequency * size;
          const sampleY = (y / size) * frequency * size;
          const xi = Math.floor(sampleX) % size;
          const yi = Math.floor(sampleY) % size;
          const xf = sampleX - xi;
          const yf = sampleY - yi;
          const idx = (yi * size + xi) % data.length;
          const v1 = random();
          const v2 = random();
          const v3 = random();
          const v4 = random();
          const i1 = v1 * (1 - xf) + v2 * xf;
          const i2 = v3 * (1 - xf) + v4 * xf;
          value += ((i1 * (1 - yf) + i2 * yf) * amplitude) / octaves;
          amplitude *= persistence;
          frequency *= 2;
        }
        data[y * size + x] = value;
      }
    }
    return data;
  };

  const createMoonTexture = (size = 512) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const noise = generateNoise(size, 5, 0.58);
    const maria = generateNoise(size, 3, 0.65);

    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const n = noise[y * size + x];
        const m = maria[y * size + x];
        const base = 225 + n * 14;
        const dark = 180 + m * 30;
        const mix = 0.35 + Math.max(0, m) * 0.25;
        const v = base * (1 - mix) + dark * mix;
        image.data[i] = v;
        image.data[i + 1] = v * 0.98;
        image.data[i + 2] = v * 0.95;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);

    // Sparse larger craters for readable “club” impact marks
    const craterCount = 18;
    for (let i = 0; i < craterCount; i += 1) {
      const radius = (Math.random() * 0.09 + 0.04) * size;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const crater = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
      crater.addColorStop(0, "rgba(90, 98, 120, 0.75)");
      crater.addColorStop(0.55, "rgba(70, 78, 100, 0.45)");
      crater.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = crater;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft limb-darkening
    const gradient = ctx.createRadialGradient(
      size * 0.46,
      size * 0.44,
      size * 0.2,
      size * 0.5,
      size * 0.5,
      size * 0.58
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.16)");
    gradient.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  };

  const moonColorTexture = createMoonTexture();
  const moonBumpTexture = createMoonTexture(256);
  moonBumpTexture.needsUpdate = true;

  // A textured moon: cratered surface with gentle rotation
  const moonGeometry = new THREE.SphereGeometry(1.9, 64, 64);
  const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonColorTexture,
    bumpMap: moonBumpTexture,
    bumpScale: 0.28,
    roughness: 0.82,
    metalness: 0.12,
    emissive: 0x1a2235,
    emissiveIntensity: sky.moonEmissive + 0.06,
    transparent: true,
    alphaTest: 0.001,
  });

  // Crescent silhouette via shader: keep it 3D, lit by the same light direction
  const crescentDir = moonLight.position.clone().sub(moonBasePosition).normalize();
  moonMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.crescentDir = { value: crescentDir.clone() };
    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",
      `uniform vec3 crescentDir;
       void main() {`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <output_fragment>",
      `#include <output_fragment>
       float ndotl = dot(normalize(vNormal), normalize(crescentDir));
       float cres = smoothstep(-0.05, 0.18, ndotl);
       gl_FragColor.a *= cres;
       gl_FragColor.rgb *= mix(0.5, 1.0, cres);
      `
    );
  };
  moonMaterial.needsUpdate = true;
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.copy(moonBasePosition);
  if (ENABLE_MOON) {
    scene.add(moon);
  }

  // Luna glow (soft halo around the moon)
  const createGlowTexture = (): THREE.CanvasTexture => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.55)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const moonGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: 0xbad4ff,
      transparent: true,
      opacity: sky.glowOpacity,
      depthWrite: false,
    })
  );
  moonGlow.scale.set(5, 5, 1);
  moonGlow.position.copy(moon.position);
  if (ENABLE_MOON) {
    scene.add(moonGlow);
  }

  // Helpers to apply and persist moon visibility
  const applyMoonVisibility = () => {
    const hidden = !ENABLE_MOON || moonHidden;
    moon.material.transparent = true;
    (moon.material as THREE.MeshStandardMaterial).opacity = hidden ? 0 : 1;
    moon.visible = !hidden;
    moonGlow.visible = !hidden;
  };

  if (typeof window !== "undefined") {
    moonHidden = window.localStorage.getItem(MOON_HIDDEN_KEY) === "1";
    applyMoonVisibility();
  } else {
    applyMoonVisibility();
  }

  // Double-click directly on the moon to toggle persistent visibility
  const handleDoubleClick = (event: MouseEvent) => {
    if (!canvasRef.value || !ENABLE_MOON) return;
    const rect = canvasRef.value.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(moon, true);
    if (intersects.length) {
      moonHidden = !moonHidden;
      applyMoonVisibility();
      if (typeof window !== "undefined") {
        if (moonHidden) window.localStorage.setItem(MOON_HIDDEN_KEY, "1");
        else window.localStorage.removeItem(MOON_HIDDEN_KEY);
      }
    }
  };
  canvasRef.value.addEventListener("dblclick", handleDoubleClick);
  removeDoubleClickListener = () => canvasRef.value?.removeEventListener("dblclick", handleDoubleClick);

  // Pointer-driven moon parallax
  const moonTarget = moonBasePosition.clone();
  const updateMoonTargetFromPointer = (event: PointerEvent) => {
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    const rangeX = 1.1;
    const rangeY = 0.9;
    moonTarget.x = moonBasePosition.x + nx * rangeX;
    moonTarget.y = moonBasePosition.y - ny * rangeY;

    // Steer meteor direction toward cursor (parallax-friendly)
    meteorDirectionTarget.set(0.7 + nx * 0.8, -0.25 - ny * 1.1, 0).normalize();
  };

  window.addEventListener("pointermove", updateMoonTargetFromPointer);
  removePointerListener = () => window.removeEventListener("pointermove", updateMoonTargetFromPointer);

  const spawnShootingStar = () => {
    const dir = meteorDirection.clone().normalize();

    const group = new THREE.Group();

    const headMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const tailMaterial = new THREE.MeshBasicMaterial({
      color: 0x89c8ff,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), headMaterial);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9, 14, 1, true), tailMaterial);

    tail.position.y = -0.42;
    tail.rotation.x = Math.PI;

    group.add(tail);
    group.add(head);

    const fromLeft = dir.x >= 0;
    group.position.set(
      fromLeft ? -8 + Math.random() * 3 : 5 + Math.random() * 3,
      2.8 + Math.random() * 2.5,
      -4.5 - Math.random() * 2.5
    );

    const speed = 4.5 + Math.random() * 2.5;
    const jitter = new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 0);
    const velocity = dir.clone().multiplyScalar(speed).add(jitter);

    group.rotation.z = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;

    const maxLife = 2.2 + Math.random() * 1.3;

    shootingStars.push({
      group,
      velocity,
      life: maxLife,
      maxLife,
      headMaterial,
      tailMaterial,
    });

    scene.add(group);
  };

  // Animation
  const clock = new THREE.Clock();
  const animate = () => {
    const delta = clock.getDelta();
    const elapsedTime = clock.elapsedTime;

    starField.rotation.y = elapsedTime / 10;
    if (ENABLE_MOON) {
      moon.position.lerp(moonTarget, 0.08);
      moonGlow.position.copy(moon.position);
      moon.rotation.y += 0.0008;
      moon.rotation.x = Math.sin(elapsedTime * 0.08) * 0.02;
      const baseGlow = sky.glowOpacity;
      moonGlow.material.opacity = baseGlow + Math.sin(elapsedTime * 0.35) * 0.05;
    }

    meteorDirection.lerp(meteorDirectionTarget, 0.08);

    shootingStarTimer -= delta;
    if (shootingStarTimer <= 0) {
      spawnShootingStar();
      const [min, max] = sky.shootingInterval;
      shootingStarTimer = min + Math.random() * (max - min);
    }

    meteorShowerTimer -= delta;
    if (meteorShowerTimer <= 0) {
      const burstCount = 3 + Math.floor(Math.random() * 2);
      for (let i = 0; i < burstCount; i += 1) {
        spawnShootingStar();
      }
      meteorShowerTimer = 12 + Math.random() * 14;
    }

    for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
      const star = shootingStars[i];
      star.group.position.addScaledVector(star.velocity, delta);
      star.life -= delta;

      const fade = Math.max(star.life / star.maxLife, 0);
      star.headMaterial.opacity = 0.35 + 0.75 * fade;
      star.tailMaterial.opacity = 0.22 + 0.4 * fade;

      if (star.life <= 0) {
        scene.remove(star.group);
        shootingStars.splice(i, 1);
      }
    }

    renderer?.render(scene, camera);
    animationFrameId = window.requestAnimationFrame(animate);
  };
  animate();

  // Handle window resize
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer?.setSize(window.innerWidth, window.innerHeight);
    renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  window.addEventListener("resize", handleResize);

  onUnmounted(() => {
    window.removeEventListener("resize", handleResize);
    removePointerListener?.();
    removeDoubleClickListener?.();
    window.cancelAnimationFrame(animationFrameId);
    renderer?.dispose();
  });
});
</script>

<style scoped>
.three-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Sit behind all other content */
  outline: none;
}
</style>
