import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. HOOK DA CÂMERA (O Motor do Reflexo) ---
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
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1024, height: 1024 } 
        });
        video.srcObject = stream;
        await video.play();

        const tex = new THREE.VideoTexture(video);
        tex.colorSpace = THREE.SRGBColorSpace; // Importante para cores corretas
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.format = THREE.RGBAFormat;
        
        // O SEGREDO DO VISUAL:
        // Isso força o video retangular a "abraçar" o botão, criando a distorção líquida
        tex.mapping = THREE.EquirectangularReflectionMapping; 
        
        // Espelhar horizontalmente para agir como espelho real
        tex.center.set(0.5, 0.5);
        tex.repeat.set(-1, 1);

        setTexture(tex);
      } catch (e) {
        console.error("Sem câmera", e);
      }
    }
    start();
  }, []);

  return texture;
}

// --- 2. O BOTÃO CROMADO (O Visual) ---
function ChromePill({ envMap }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  // Micro-animação suave (flutuação imperceptível para dar vida)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t * 0.5) * 0.05; // Leve inclinação
    mesh.current.rotation.y = Math.sin(t * 0.3) * 0.05; // Leve rotação
  });

  return (
    <group>
      <mesh
        ref={mesh}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.02 : 1} // Zoom sutil no hover
      >
        {/* Formato Pílula: args=[largura, altura, profundidade] */}
        <RoundedBox args={[3.5, 1.2, 0.4]} radius={0.6} smoothness={10}>
          <meshPhysicalMaterial
            color="#ffffff"        // Base branca
            roughness={0}          // Espelho perfeito
            metalness={1}          // 100% Metal
            envMap={envMap}        // A Câmera é o ambiente
            envMapIntensity={1.3}  // Brilho do reflexo
            clearcoat={1}          // Camada de verniz (efeito vidro)
            clearcoatRoughness={0}
          />
        </RoundedBox>
      </mesh>

      {/* Texto Flat e Moderno */}
      <Text
        position={[0, 0, 0.22]} // Levemente à frente do botão
        fontSize={0.35}
        color="#222" // Cinza escuro, quase preto
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        anchorX="center"
        anchorY="middle"
      >
        Button
      </Text>

      {/* Sombra suave no chão (Essential para realismo) */}
      <ContactShadows 
        position={[0, -0.8, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2.5} 
        far={4} 
        color="#000000"
      />
    </group>
  );
}

// --- 3. A CENA PRINCIPAL ---
export default function App() {
  const webcam = useWebcamTexture();

  return (
    // Container CSS para centralizar e definir fundo branco
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#f5f5f7', // Branco "Apple" (levemente cinza)
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      
      {/* O Canvas 3D */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
        
        {/* Renderiza apenas se tivermos a câmera, senão o material fica preto */}
        {webcam && <ChromePill envMap={webcam} />}
        
        {/* Luz ambiente suave para o botão não ficar preto nas bordas sem reflexo */}
        <ambientLight intensity={0.5} />
        
      </Canvas>

      {/* Aviso caso o usuário negue a câmera */}
      {!webcam && (
        <div style={{ position: 'absolute', color: '#999', fontFamily: 'sans-serif' }}>
          Permita a câmera para ativar o reflexo...
        </div>
      )}
    </div>
  );
}