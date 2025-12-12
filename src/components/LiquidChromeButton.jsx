import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'

export function LiquidChromeButton({ 
  text = "Button", 
  envMap, 
  onClick,
  position = [0, 0, 0] 
}) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)

  // Animação de idle (respiração suave)
  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    
    // Rotação suave para fazer o reflexo "correr" pelo botão
    meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
    meshRef.current.rotation.y = Math.cos(time * 0.3) * 0.1
  })

  // Configurações de estilo
  const springConfig = { scale: hovered ? 1.1 : 1 }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true) }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
        scale={springConfig.scale} // Nota: Para produção, use 'react-spring' ou 'framer-motion-3d' aqui
      >
        {/* Geometria: Formato de Pílula */}
        <RoundedBox args={[3.2, 1.2, 0.25]} radius={0.6} smoothness={8}>
          
          {/* Material: O Cromo Líquido */}
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0}       // Vidro perfeito
            metalness={1}       // Metal total
            clearcoat={1}       // Verniz
            clearcoatRoughness={0}
            envMap={envMap}     // Injeção de dependência da textura
            envMapIntensity={1.2}
          />
        </RoundedBox>
      </mesh>

      {/* Camada de Texto */}
      <Text
        position={[0, 0, 0.16]} // Levemente à frente do botão
        fontSize={0.4}
        color="#1a1a1a"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  )
}