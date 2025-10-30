"use client";

import React, { useRef, useEffect } from 'react';

// It's better practice to install three.js as a dependency, but for this conversion we'll keep the window check.
declare global {
    interface Window {
        THREE: any;
    }
}

const ThreeCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;
    
    const THREE = window.THREE;
    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0A0A0A, 60, 90);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
    camera.position.set(0, 5, 55); // Pulled camera back
    camera.lookAt(0, 2, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // --- Enhanced Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x505060, 0x101010, 2);
    scene.add(hemisphereLight);

    const movingLight = new THREE.PointLight(0xadb9d4, 6, 60);
    movingLight.position.set(0, 5, 5);
    scene.add(movingLight);
    
    // --- Refined Materials ---
    const darkMatteMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x222222,
        metalness: 0.6,
        roughness: 0.7,
        clearcoat: 0.1,
        clearcoatRoughness: 0.4,
    });

    const brushedMetalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.4,
    });

    const polishedMetalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x999999,
        metalness: 1.0,
        roughness: 0.15,
    });
    
    const platterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcccccc,
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });

    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.8,
    });

    // --- Detailed 3D Object Creation Functions ---
    const createGPU = () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 0.7), darkMatteMaterial);
        
        const shroud = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.25, 0.72), darkMatteMaterial);
        
        const ioPlate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.7), polishedMetalMaterial);
        ioPlate.position.x = -0.6;
        
        const fanGroup = new THREE.Group();
        const fanBlade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.1), brushedMetalMaterial);
        for(let i = 0; i < 8; i++) {
            const blade = fanBlade.clone();
            blade.position.z = 0.15;
            blade.rotation.x = -0.2;
            const pivot = new THREE.Group();
            pivot.add(blade);
            pivot.rotation.y = (i/8) * Math.PI * 2;
            fanGroup.add(pivot);
        }
        fanGroup.position.y = 0.05;

        const fan1 = fanGroup.clone();
        fan1.position.x = -0.3;
        const fan2 = fanGroup.clone();
        fan2.position.x = 0.3;

        group.add(body, shroud, ioPlate, fan1, fan2);
        return group;
    };
    const createCPU = () => {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), darkMatteMaterial);
        const heatspreader = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), brushedMetalMaterial);
        heatspreader.position.y = 0.05;
        
        const pinGeom = new THREE.BoxGeometry(0.02, 0.02, 0.02);
        const pinCount = 100;
        const pins = new THREE.InstancedMesh(pinGeom, polishedMetalMaterial, pinCount);
        const dummy = new THREE.Object3D();
        for(let i=0; i<pinCount; i++) {
            dummy.position.set(
                (Math.random() - 0.5) * 0.5, 
                -0.06, 
                (Math.random() - 0.5) * 0.5
            );
            dummy.updateMatrix();
            pins.setMatrixAt(i, dummy.matrix);
        }
        
        group.add(base, heatspreader, pins);
        return group;
    };
    const createGear = () => {
        const group = new THREE.Group();
        const shape = new THREE.Shape();
        const outerRadius = 0.4;
        const innerRadius = 0.3;
        const teeth = 10;
        const toothHeight = 0.1;
        
        shape.moveTo(outerRadius, 0);
        for (let i = 0; i <= teeth; i++) {
            const t = i / teeth;
            const angle = t * Math.PI * 2;
            const nextAngle = (i + 0.5) / teeth * Math.PI * 2;
            shape.absarc(0, 0, outerRadius, angle, angle, false);
            shape.absarc(0, 0, outerRadius + toothHeight, angle, nextAngle, false);
            shape.absarc(0, 0, outerRadius, nextAngle, nextAngle, false);
        }

        const holePath = new THREE.Path();
        holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
        shape.holes.push(holePath);

        const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.01, bevelSegments: 2 };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        const gearMesh = new THREE.Mesh(geometry, brushedMetalMaterial);
        
        for(let i=0; i<4; i++){
            const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), darkMatteMaterial);
            spoke.rotation.z = i * Math.PI/2;
            group.add(spoke);
        }
        
        group.add(gearMesh);
        return group;
    };
    const createHammer = () => {
        const group = new THREE.Group();
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.2, 12), darkMatteMaterial);
        const head = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 12), brushedMetalMaterial);
        head.rotation.z = Math.PI / 2;
        head.position.y = 0.6;
        const clawShape = new THREE.Shape();
        clawShape.moveTo(-0.1, 0);
        clawShape.bezierCurveTo(0, 0.2, 0.2, 0.3, 0.3, 0.3);
        clawShape.lineTo(0.25, 0.3);
        clawShape.bezierCurveTo(0.15, 0.25, 0, 0.1, -0.1, 0);
        const clawGeom = new THREE.ExtrudeGeometry(clawShape, { depth: 0.08, bevelEnabled: false });
        const claw1 = new THREE.Mesh(clawGeom, brushedMetalMaterial);
        claw1.position.set(0.2, 0.6, 0.02);
        const claw2 = claw1.clone();
        claw2.position.z = -0.1;
        group.add(handle, head, claw1, claw2);
        return group;
    };
    const createHardDrive = () => {
        const group = new THREE.Group();
        const caseHdd = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 0.7), darkMatteMaterial);
        
        const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.01, 0.02, 0.71), brushedMetalMaterial);
        topPlate.position.y = 0.1;

        const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32), platterMaterial);
        platter.position.set(-0.15, 0.05, 0);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.05), brushedMetalMaterial);
        arm.position.set(0.15, 0.06, 0.1);
        group.add(caseHdd, topPlate, platter, arm);
        return group;
    };
     const createMaterialStack = () => {
        const group = new THREE.Group();
        for(let i = 0; i < 4; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.4), woodMaterial);
            plank.position.y = i * 0.12 - 0.2;
            plank.position.x += (Math.random() - 0.5) * 0.1;
            plank.rotation.y = (Math.random() - 0.5) * 0.05;
            group.add(plank);
        }
        return group;
    };

    const objectCreators = [createGPU, createCPU, createGear, createHammer, createHardDrive, createMaterialStack];

    const mainSceneGroup = new THREE.Group();
    const floatingObjects: any[] = [];
    
    const numObjects = 50;
    const innerRadius = 12.0; // The "hole" in the middle
    const outerRadius = 30.0; // Pushed out towards the edges
    const spawnHeight = 10.0;

    for (let i = 0; i < numObjects; i++) {
      const randomCreator = objectCreators[Math.floor(Math.random() * objectCreators.length)];
      const floatingObject = randomCreator();
      
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      
      floatingObject.position.set(
        Math.cos(angle) * radius,
        (Math.random() * spawnHeight) - (spawnHeight / 2),
        Math.sin(angle) * radius
      );

      floatingObject.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const scale = Math.random() * 0.5 + 0.7;
      floatingObject.scale.set(scale, scale, scale);
      
      floatingObject.userData = {
        seed: Math.random() * 100,
        rotSpeed: new THREE.Vector3((Math.random()-0.5) * 0.4, (Math.random()-0.5) * 0.4, (Math.random()-0.5) * 0.4)
      };
      floatingObjects.push(floatingObject);
      mainSceneGroup.add(floatingObject);
    }

    scene.add(mainSceneGroup);

    // Handle Resize
    const handleResize = () => {
      if(!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    const clock = new THREE.Clock();
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      movingLight.position.x = Math.sin(elapsedTime * 0.25) * 15;
      movingLight.position.z = Math.cos(elapsedTime * 0.35) * 15;
      movingLight.position.y = 3 + Math.sin(elapsedTime * 0.5) * 4;

      mainSceneGroup.rotation.y = elapsedTime * 0.03;

      floatingObjects.forEach(obj => {
        obj.rotation.y += obj.userData.rotSpeed.y * 0.01;
        obj.rotation.x += obj.userData.rotSpeed.x * 0.01;
        obj.rotation.z += obj.userData.rotSpeed.z * 0.01;
        obj.position.y += Math.sin(elapsedTime * 0.8 + obj.userData.seed) * 0.005;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if(currentMount && renderer.domElement){
         currentMount.removeChild(renderer.domElement);
      }
      // Dispose of new materials
      darkMatteMaterial.dispose();
      brushedMetalMaterial.dispose();
      polishedMetalMaterial.dispose();
      platterMaterial.dispose();
      woodMaterial.dispose();
      
      mainSceneGroup.children.forEach(group => {
          if (group instanceof THREE.Group || group instanceof THREE.InstancedMesh) {
             (group as any).children?.forEach((mesh: any) => {
                if (mesh.geometry) mesh.geometry.dispose();
            });
          }
          if((group as any).geometry) (group as any).geometry.dispose();
      });
      scene.remove(mainSceneGroup);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default ThreeCanvas;
