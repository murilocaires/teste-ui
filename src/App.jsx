import React from 'react'
import { Canvas } from '@react-three/fiber'
import { useWebcamTexture } from './hooks/useWebcamTexture'
import { LiquidChromeButton } from './components/LiquidChromeButton'

export default function App() {
  // 1. Instancia a câmera no nível superior
  const webcamReflex = useWebcamTexture()

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 40 }}>
        {/* Iluminação Auxiliar (O reflexo faz 90% do trabalho, isso é só fill light) */}
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1} />
        
        {/* Renderização Condicional: Só mostra o botão se a câmera carregou */}
        {webcamReflex && (
          <>
            <LiquidChromeButton 
              text="Entrar" 
              envMap={webcamReflex} 
              position={[0, 1, 0]}
              onClick={() => alert('Login!')} 
            />
            
            <LiquidChromeButton 
              text="Sobre" 
              envMap={webcamReflex} 
              position={[0, -1, 0]}
              onClick={() => alert('Sobre nós')} 
            />
          </>
        )}
        
      </Canvas>

      {/* Feedback para o usuário caso a câmera não esteja ativa */}
      {!webcamReflex && (
        <div style={styles.loadingOverlay}>
          <p>Aguardando câmera para gerar reflexos...</p>
        </div>
      )}
    </div>
  )
}

// Estilos CSS simples (CSS-in-JS para brevidade)
const styles = {
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontFamily: 'sans-serif',
    pointerEvents: 'none'
  }
}