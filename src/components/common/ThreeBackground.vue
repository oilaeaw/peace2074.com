<template>
  <canvas ref="canvasRef" class="three-background"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";

const canvasRef = ref<HTMLCanvasElement | null>(null);
let renderer: THREE.WebGLRenderer | null = null;
let animationFrameId: number;

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

onMounted(() => {
  if (!canvasRef.value) return;

  // Scene
  const scene = new THREE.Scene();

  // Subtle ambient light and a cool directional light to sculpt the moon
  const ambientLight = new THREE.AmbientLight(0x8899bb, 0.4);
  const moonLight = new THREE.DirectionalLight(0xcad8ff, 0.9);
  moonLight.position.set(5, 6, 8);

  const rimLight = new THREE.DirectionalLight(0x7aa5ff, 0.35);
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
    alpha: true, // Use alpha for a transparent background
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
    opacity: 0.75,
    transparent: true,
  });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  // Moon texture helpers
  const createMoonTexture = (size = 512) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return new THREE.CanvasTexture(canvas);

    // Base gradient
    const gradient = ctx.createRadialGradient(
      size * 0.45,
      size * 0.4,
      size * 0.15,
      size * 0.5,
      size * 0.5,
      size * 0.55
    );
    gradient.addColorStop(0, "#f5f7fb");
    gradient.addColorStop(1, "#cdd3dd");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Craters
    const craterCount = 90;
    for (let i = 0; i < craterCount; i += 1) {
      const radius = (Math.random() * 0.045 + 0.01) * size;
      const x = Math.random() * size;
      const y = Math.random() * size;
      const craterGradient = ctx.createRadialGradient(x, y, radius * 0.15, x, y, radius);
      craterGradient.addColorStop(0, "rgba(150, 160, 175, 0.55)");
      craterGradient.addColorStop(0.7, "rgba(140, 150, 165, 0.25)");
      craterGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = craterGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Noise overlay
    const noise = ctx.createImageData(size, size);
    for (let i = 0; i < noise.data.length; i += 4) {
      const n = 230 + Math.random() * 25;
      noise.data[i] = n;
      noise.data[i + 1] = n;
      noise.data[i + 2] = n;
      noise.data[i + 3] = 18;
    }
    ctx.putImageData(noise, 0, 0);

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
    bumpScale: 0.14,
    roughness: 0.9,
    metalness: 0.08,
    emissive: 0x151b2a,
    emissiveIntensity: 0.32,
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(-2.8, 1.6, -6);
  scene.add(moon);

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
      opacity: 0.4,
      depthWrite: false,
    })
  );
  moonGlow.scale.set(5, 5, 1);
  moonGlow.position.copy(moon.position);
  scene.add(moonGlow);

  const spawnShootingStar = () => {
    const group = new THREE.Group();

    const headMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });

    const tailMaterial = new THREE.MeshBasicMaterial({
      color: 0x9ad4ff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), headMaterial);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.55, 12, 1, true), tailMaterial);

    tail.position.y = -0.25;
    tail.rotation.x = Math.PI;

    group.add(tail);
    group.add(head);

    group.position.set(
      -6 + Math.random() * 4,
      2.2 + Math.random() * 2.5,
      -4 - Math.random() * 3
    );

    const velocity = new THREE.Vector3(
      3.4 + Math.random() * 2,
      -(1.3 + Math.random() * 0.9),
      0
    );

    group.rotation.z = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;

    const maxLife = 1.8 + Math.random() * 0.9;

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
    moon.rotation.y += 0.0008;
    moon.rotation.x = Math.sin(elapsedTime * 0.08) * 0.02;
    moonGlow.material.opacity = 0.32 + Math.sin(elapsedTime * 0.35) * 0.06;

    shootingStarTimer -= delta;
    if (shootingStarTimer <= 0) {
      spawnShootingStar();
      shootingStarTimer = 2.6 + Math.random() * 3.7;
    }

    for (let i = shootingStars.length - 1; i >= 0; i -= 1) {
      const star = shootingStars[i];
      star.group.position.addScaledVector(star.velocity, delta);
      star.life -= delta;

      const fade = Math.max(star.life / star.maxLife, 0);
      star.headMaterial.opacity = 0.35 + 0.65 * fade;
      star.tailMaterial.opacity = 0.18 + 0.27 * fade;

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
