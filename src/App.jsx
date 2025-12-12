import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. HOOK DA CÂMERA COM TRATAMENTO DE ERRO ---
function useWebcamTexture() {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    video.crossOrigin = "Anonymous";

    async function start() {
      try {
        // Tenta pegar a câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 640 } 
        });
        
        video.srcObject = stream;
        await video.play();

        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.mapping = THREE.EquirectangularReflectionMapping; // O efeito de distorção
        
        // Espelhar
        tex.center.set(0.5, 0.5);
        tex.repeat.set(-1, 1);

        setTexture(tex);
      } catch (e) {
        console.warn("Câmera não autorizada ou indisponível. Usando fallback.", e);
        // Não faz nada, o componente vai usar o ambiente padrão
      }
    }
    start();
  }, []);

  return texture;
}

// --- 2. O BOTÃO ---
function ChromePill({ envMap }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.05;
    mesh.current.rotation.y = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <group>
      <mesh
        ref={mesh}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.05 : 1}
      >
        {/* Raio ajustado para ficar redondinho nas pontas */}
        <RoundedBox args={[3.5, 1.2, 0.4]} radius={0.6} smoothness={8}>
          <meshPhysicalMaterial
            color={envMap ? "#ffffff" : "#aaaaaa"} // Se não tiver câmera, usa cinza base
            roughness={0.05}       // Pouca rugosidade para brilhar
            metalness={1}          // Metal total
            envMap={envMap}        // Usa a câmera se existir
            envMapIntensity={1.5}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </RoundedBox>
      </mesh>

      <Text
        position={[0, 0, 0.22]}
        fontSize={0.35}
        color="#202020"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        Button
      </Text>

      <ContactShadows position={[0, -0.8, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
    </group>
  );
}

// --- 3. APP PRINCIPAL ---
export default function App() {
  const webcam = useWebcamTexture();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        
        {/* SOLUÇÃO DO QUADRADO PRETO: LUZES! */}
        {/* Essas luzes garantem que o botão apareça mesmo sem câmera */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Se a câmera falhar, carrega um estúdio padrão (City) para dar reflexo */}
        {!webcam && <Environment preset="city" />}

        <ChromePill envMap={webcam} />
        
      </Canvas>

      <div style={{ 
        position: 'absolute', bottom: 30, left: 0, width: '100%', 
        textAlign: 'center', color: '#888', fontFamily: 'sans-serif', pointerEvents: 'none' 
      }}>
        {webcam ? "Modo Reflexo Ativo" : "Permita a câmera para ver o reflexo real"}
      </div>
    </div>
  );
}