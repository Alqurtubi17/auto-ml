"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    const coreGeometry = new THREE.IcosahedronGeometry(6, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.15 });
    const neuralCore = new THREE.Mesh(coreGeometry, coreMaterial);
    masterGroup.add(neuralCore);

    const glowGeometry = new THREE.SphereGeometry(5.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x059669, transparent: true, opacity: 0.1 });
    const coreGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    masterGroup.add(coreGlow);

    const ringGeometry = new THREE.TorusGeometry(12, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3 });
    
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    masterGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring2.rotation.y = Math.PI / 3;
    ring2.rotation.x = Math.PI / 8;
    masterGroup.add(ring2);

    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring3.rotation.y = -Math.PI / 3;
    ring3.rotation.x = -Math.PI / 8;
    masterGroup.add(ring3);

    const particleCount = 350;
    const radius = 14;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0x34d399, size: 0.25, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
    const particleCloud = new THREE.Points(particlesGeometry, particleMaterial);
    masterGroup.add(particleCloud);

    camera.position.z = 28;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.0003;
      mouseY = (event.clientY - windowHalfY) * 0.0003;
    };
    window.addEventListener('mousemove', onDocumentMouseMove);

    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) * 0.001;
      targetX = mouseX;
      targetY = mouseY;

      masterGroup.rotation.y += 0.05 * (targetX - masterGroup.rotation.y);
      masterGroup.rotation.x += 0.05 * (targetY - masterGroup.rotation.x);
      neuralCore.rotation.y = t * 0.2;
      neuralCore.rotation.x = t * 0.1;
      ring1.rotation.z = t * 0.1;
      ring2.rotation.z = -t * 0.15;
      ring3.rotation.z = t * 0.08;
      particleCloud.rotation.y = t * 0.05;

      const breathingScale = 1 + Math.sin(t * 2) * 0.04;
      neuralCore.scale.set(breathingScale, breathingScale, breathingScale);
      coreGlow.scale.set(breathingScale, breathingScale, breathingScale);

      camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 5 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      coreGeometry.dispose();
      coreMaterial.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      particlesGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [isMounted]);

  if (!isMounted) return null;
  return <div ref={mountRef} className="fixed inset-0 z-0 opacity-[0.4] pointer-events-none" />;
}