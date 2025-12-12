import { useEffect, useState } from 'react'
import * as THREE from 'three'

export function useWebcamTexture() {
  const [texture, setTexture] = useState(null)

  useEffect(() => {
    let videoElement = null

    async function initCamera() {
      try {
        // 1. Configura o elemento de vídeo (off-screen)
        videoElement = document.createElement('video')
        videoElement.autoplay = true
        videoElement.playsInline = true
        videoElement.muted = true
        videoElement.crossOrigin = "Anonymous"

        // 2. Solicita o stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1024, height: 1024, facingMode: 'user' } 
        })
        
        videoElement.srcObject = stream
        await videoElement.play()

        // 3. Cria e configura a textura Three.js
        const videoTexture = new THREE.VideoTexture(videoElement)
        
        // LinearFilter é mais leve e suave para vídeo
        videoTexture.minFilter = THREE.LinearFilter
        videoTexture.magFilter = THREE.LinearFilter
        videoTexture.format = THREE.RGBAFormat
        
        // O Segredo do efeito líquido: Mapeamento esférico forçado
        videoTexture.mapping = THREE.EquirectangularReflectionMapping 
        
        // Correção de espelhamento (opcional, para parecer um espelho real)
        videoTexture.center.set(0.5, 0.5)
        videoTexture.repeat.set(-1, 1)

        setTexture(videoTexture)
      } catch (error) {
        console.error("Erro ao acessar webcam:", error)
      }
    }

    initCamera()

    // Cleanup: Para a câmera quando o componente desmontar
    return () => {
      if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
      if (texture) texture.dispose()
    }
  }, [])

  return texture
}