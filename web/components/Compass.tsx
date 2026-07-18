"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 3D compass for the marketing hero.
 * Loads /compass.glb, auto-orients it to face the viewer, and tilts it toward
 * the user's cursor as they move around the page. A subtle idle drift keeps it
 * feeling alive. Sized to be noticeable but not dominating.
 */
export default function Compass() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    // --- Lights (warm key + cool fill so navy + red both read well) ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 1.1);
    fill.position.set(-4, -1, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    // Group we rotate toward the cursor
    const pivot = new THREE.Group();
    scene.add(pivot);

    // --- Cursor tracking ---
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1..1
      targetRot.x = ny * 0.45; // pitch toward cursor
      targetRot.y = nx * 0.6; // yaw toward cursor
    };
    if (!prefersReduced) window.addEventListener("mousemove", onMove);

    // --- Load model ---
    let root: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.load(
      "/compass.glb",
      (gltf) => {
        const obj = gltf.scene;

        obj.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              const mat = m as THREE.MeshStandardMaterial;
              if (mat.opacity < 1) {
                mat.transparent = true;
                mat.depthWrite = false;
              }
            });
          }
        });

        // Recenter
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        obj.position.sub(center);

        // Auto-orient: put the model's thinnest axis (its depth) toward the camera (+Z)
        if (size.y <= size.x && size.y <= size.z) {
          obj.rotation.x = -Math.PI / 2; // lying flat, dial up
        } else if (size.x <= size.y && size.x <= size.z) {
          obj.rotation.y = Math.PI / 2; // facing sideways
        } // else thin axis already ~Z: leave as-is

        // Scale to fit the viewport nicely
        const maxDim = Math.max(size.x, size.y, size.z);
        const wrap = new THREE.Group();
        wrap.add(obj);
        wrap.scale.setScalar(2.7 / maxDim);

        root = wrap;
        pivot.add(wrap);
      },
      undefined,
      (err) => console.error("Compass model failed to load:", err)
    );

    // --- Render loop ---
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      currentRot.x += (targetRot.x - currentRot.x) * 0.06;
      currentRot.y += (targetRot.y - currentRot.y) * 0.06;

      // gentle idle drift so it feels alive even when the cursor is still
      const idle = prefersReduced ? 0 : 1;
      pivot.rotation.x = currentRot.x + Math.sin(t * 0.6) * 0.05 * idle;
      pivot.rotation.y = currentRot.y + Math.sin(t * 0.4) * 0.12 * idle;

      renderer.render(scene, camera);
    };
    animate();

    // --- Resize ---
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
      if (root) {
        root.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => m.dispose());
          }
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="w-full h-full min-h-[340px] select-none pointer-events-none"
    />
  );
}
