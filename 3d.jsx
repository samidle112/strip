import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function GoldenRing() {
  const ringRef = useRef();
  const materialRef = useRef();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(true);
  const startTimeRef = useRef(Date.now());
  
  // Create elliptical ring geometry
  useEffect(() => {
    if (!ringRef.current) return;
    
    // Create elliptical torus
    const curve = new THREE.EllipseCurve(
      0, 0,              // center x, y
      2.5, 1.8,          // x radius, y radius (creates ellipse)
      0, 2 * Math.PI,    // start angle, end angle
      false,             // clockwise
      0                  // rotation
    );
    
    const points = curve.getPoints(200);
    const path = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(p.x, p.y, 0))
    );
    
    // Create tube geometry along the elliptical path
    const geometry = new THREE.TubeGeometry(
      path,
      200,      // tubular segments
      0.02,     // radius (thin strip)
      8,        // radial segments
      true      // closed
    );
    
    ringRef.current.geometry = geometry;
  }, []);
  
  // Animation loop
  useFrame((state) => {
    if (!ringRef.current) return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    if (isDrawing) {
      // Drawing phase: 0 to 2.5 seconds
      const drawDuration = 2.5;
      const progress = Math.min(elapsed / drawDuration, 1);
      setAnimationProgress(progress);
      
      // Update geometry to show progressive drawing
      if (ringRef.current.geometry) {
        const totalVertices = ringRef.current.geometry.attributes.position.count;
        ringRef.current.geometry.setDrawRange(0, Math.floor(totalVertices * progress));
      }
      
      if (progress >= 1) {
        setIsDrawing(false);
        startTimeRef.current = Date.now(); // Reset for rotation phase
      }
    } else {
      // Rotation phase: slow 3D rotation to show depth
      ringRef.current.rotation.y += 0.005; // Slow Y-axis rotation
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2; // Subtle X-axis tilt
      ringRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.2) * 0.1; // Subtle Z-axis tilt
    }
  });
  
  return (
    <mesh ref={ringRef}>
      <meshStandardMaterial
        ref={materialRef}
        color="#FFD700"
        metalness={0.9}
        roughness={0.2}
        emissive="#CC9900"
        emissiveIntensity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting for metallic effect */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />
        <spotLight 
          position={[5, 5, 5]} 
          angle={0.3} 
          penumbra={1} 
          intensity={1.5}
          castShadow
        />
        
        {/* The golden ring */}
        <GoldenRing />
        
        {/* Optional: Remove or comment out OrbitControls for production */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
      
      {/* Loading indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#FFD700',
        fontSize: '14px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        opacity: 0.5
      }}>
        3D Golden Ring Animation
      </div>
    </div>
  );
}

export default Scene;