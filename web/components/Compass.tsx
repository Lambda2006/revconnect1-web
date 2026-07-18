"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * 3D compass for the marketing hero.
 * The compass body stays fixed, facing the viewer. Only the needle swings so
 * that NORTH points toward the user's cursor, wherever it is on the page.
 * Sized to be noticeable but not dominating.
 */
export default function Compass() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

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
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 5, 4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 1.1);
    fill.position.set(-4, -1, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.4);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    // Static body holder (never rotates)
    const body = new THREE.Group();
    scene.add(body);

    // --- Cursor tracking: NORTH points at the cursor ---
    // Needle rotation about the dial-normal axis. Derived so that:
    //   cursor above centre -> north up; cursor right -> north right; etc.
    let needleTarget = 0; // desired angle (radians)
    let needleAngle = 0; // current angle
    let needleVel = 0; // angular velocity (rad/s)

    // Spring-damper feel of a real compass needle.
    //  omega  -> how quick/comfortable the swing is (higher = snappier)
    //  zeta   -> damping ratio; < 1 is underdamped, so it overshoots & bounces
    const OMEGA = 9;
    const ZETA = 0.28;

    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      needleTarget = Math.atan2(-dx, -dy);
    };
    window.addEventListener("mousemove", onMove);

    // --- Load model ---
    let root: THREE.Object3D | null = null;
    let needlePivot: THREE.Group | null = null;
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

        // Orient so the dial faces the camera (thinnest axis toward +Z)
        const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
        if (size.y <= size.x && size.y <= size.z) {
          obj.rotation.x = Math.PI / 2; // lying flat, dial up -> face camera
        } else if (size.x <= size.y && size.x <= size.z) {
          obj.rotation.y = -Math.PI / 2;
        }
        obj.updateWorldMatrix(true, true);

        // Recenter on the housing (the visible dial), not the bail/foot,
        // so the compass sits centred in the frame.
        let housing: THREE.Object3D | null = null;
        obj.traverse((c) => {
          if (!housing && /housing|bezel|dial/i.test(c.name) && (c as THREE.Mesh).isMesh) {
            housing = c;
          }
        });
        const centerBox = new THREE.Box3().setFromObject(housing ?? obj);
        obj.position.sub(centerBox.getCenter(new THREE.Vector3()));
        obj.updateWorldMatrix(true, true);

        // Reparent the needle meshes under a pivot at the compass axis so we
        // can spin them independently of the fixed body.
        needlePivot = new THREE.Group();
        obj.add(needlePivot);
        const needles: THREE.Object3D[] = [];
        obj.traverse((c) => {
          if (c !== needlePivot && /^needle/i.test(c.name)) needles.push(c);
        });
        needles.forEach((n) => needlePivot!.attach(n));

        // Scale whole thing to fit with margin
        const maxDim = Math.max(size.x, size.y, size.z);
        const wrap = new THREE.Group();
        wrap.add(obj);
        wrap.scale.setScalar(2.2 / maxDim);

        root = wrap;
        body.add(wrap);
      },
      undefined,
      (err) => console.error("Compass model failed to load:", err)
    );

    // --- Render loop ---
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);

      if (needlePivot) {
        const dt = Math.min(clock.getDelta(), 1 / 30); // clamp for stability
        // shortest signed arc from current angle to the cursor target
        const error = Math.atan2(
          Math.sin(needleTarget - needleAngle),
          Math.cos(needleTarget - needleAngle)
        );
        // damped spring: a = w^2*error - 2*zeta*w*velocity
        const accel = OMEGA * OMEGA * error - 2 * ZETA * OMEGA * needleVel;
        needleVel += accel * dt;
        needleAngle += needleVel * dt;
        needlePivot.rotation.y = needleAngle;
      }

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
