import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import React, { Suspense, useState, useEffect } from 'react'
import { SpotLight, Text, ScrollControls, Scroll, Html } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import { TextureLoader, Vector3 } from 'three'
import * as THREE from 'three'

// Gothic blackletter font
const GOTHIC_FONT = '/assets/OldeEnglish.ttf'

// Logo texture (nails + crown of thorns)
const LOGO_PATH = '/assets/jad-logo.png'

// Tattoo pieces - JAD's work
const ART_PIECES = [
  { title: 'I', imgPath: '/assets/tattoo-01.webp' },
  { title: 'II', imgPath: '/assets/tattoo-02.webp' },
  { title: 'III', imgPath: '/assets/tattoo-03.webp' },
  { title: 'IV', imgPath: '/assets/tattoo-04.webp' },
  { title: 'V', imgPath: '/assets/tattoo-05.webp' },
  { title: 'VI', imgPath: '/assets/tattoo-06.webp' },
  { title: 'VII', imgPath: '/assets/tattoo-07.webp' },
  { title: 'VIII', imgPath: '/assets/tattoo-08.webp' },
  { title: 'IX', imgPath: '/assets/tattoo-09.webp' },
  { title: 'X', imgPath: '/assets/tattoo-10.webp' },
  { title: 'XI', imgPath: '/assets/tattoo-11.webp' },
]

const WallArt = (props) => {
  const { art, i, startOffset, isMobile } = props
  const { height: h } = useThree((state) => state.viewport);
  const gap = 4;
  const imageWidth = 3;
  const texture = useLoader(TextureLoader, art.imgPath)

  return (
    <group>
      <SpotLight
        position={[startOffset + (i + 1) * (imageWidth + gap) + (i + 1), 2.5, 1]}
        penumbra={1}
        angle={0.6}
        attenuation={1}
        anglePower={5}
        intensity={10}
        distance={10}
        castShadow={!isMobile}
        color={0xffffff}
      />
      <mesh castShadow={!isMobile} position={[startOffset + (i + 1) * (imageWidth + gap) + (i + 1), 0, 0]}>
        <boxGeometry args={[imageWidth, h / 2, 0.07]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  )
}

// Logo component - simple textured plane
const Logo = ({ position, scale }) => {
  const texture = useLoader(TextureLoader, LOGO_PATH)

  return (
    <mesh position={position}>
      <planeGeometry args={[scale, scale * 1.33]} />
      <meshBasicMaterial map={texture} transparent={true} />
    </mesh>
  )
}

const Scene = () => {
  const { width: screenWidth } = useThree((state) => state.viewport);
  const isMobile = screenWidth < 5.5

  // JAD - bigger than tattooer
  const jadScale = isMobile ? 6 : 8
  // TATTOOER - smaller than JAD
  const tattooerScale = isMobile ? 2.2 : 3
  // Logo size - small at top
  const logoScale = isMobile ? 2.5 : 3
  // Bigger subtitles as requested
  const subtitleScale = isMobile ? 2 : 2.8
  const locationScale = isMobile ? 1.4 : 2
  // Offset for artworks
  const startOffset = isMobile ? 6 : 10

  return (
    <Suspense fallback={
      <Html style={{
        fontSize: '6vw',
        whiteSpace: 'nowrap',
        color: 'white',
        fontFamily: 'OldeEnglish, Georgia, serif'
      }} center>
        Loading...
      </Html>
    }>
      <ScrollControls horizontal damping={4} pages={39 * Math.exp(-0.11 * screenWidth)} distance={1}>
        <Scroll>
          {/* Spotlight on hero area */}
          <SpotLight
            position={[0, 4, 3]}
            penumbra={1}
            angle={0.9}
            attenuation={0.8}
            anglePower={2}
            intensity={20}
            distance={15}
            castShadow={!isMobile}
            color={0xffffff}
          />

          {/* Logo at top */}
          <Logo position={[0, isMobile ? 0.3 : 0.6, 0]} scale={logoScale} />

          {/* JAD - directly below logo */}
          <Text
            position={[0, isMobile ? 0.5 : 0.8, 0]}
            anchorX="center"
            anchorY="middle"
            scale={[jadScale, jadScale, jadScale]}
            color="#ffffff"
            font={GOTHIC_FONT}
            castShadow
            letterSpacing={0.02}
          >
            JAD
          </Text>

          {/* TATTOOER - TIGHT below JAD */}
          <Text
            position={[0, isMobile ? 0.05 : 0.25, 0]}
            anchorX="center"
            anchorY="middle"
            scale={[tattooerScale, tattooerScale, tattooerScale]}
            color="#ffffff"
            font={GOTHIC_FONT}
            castShadow
            letterSpacing={0.08}
          >
            TATTOOER
          </Text>

          {/* Blackwork • Traditional */}
          <Text
            position={[0, isMobile ? -0.8 : -1.4, 0.5]}
            anchorX="center"
            anchorY="middle"
            scale={[subtitleScale, subtitleScale, subtitleScale]}
            color="#999999"
            font={GOTHIC_FONT}
            letterSpacing={0.03}
          >
            Blackwork • Traditional
          </Text>

          {/* Melbourne, Australia */}
          <Text
            position={[0, isMobile ? -1.1 : -1.9, 0.5]}
            anchorX="center"
            anchorY="middle"
            scale={[locationScale, locationScale, locationScale]}
            color="#777777"
            font={GOTHIC_FONT}
          >
            Melbourne, Australia
          </Text>

          {/* Tattoo artwork pieces */}
          {ART_PIECES.map((art, i) => (
            <WallArt
              key={i}
              i={i}
              art={art}
              startOffset={startOffset}
              isMobile={isMobile}
            />
          ))}
        </Scroll>
      </ScrollControls>
    </Suspense>
  )
}

const Rig = () => {
  const { camera, mouse } = useThree()
  const vec = new Vector3()
  return useFrame(() => camera.position.lerp(vec.set(mouse.x * 0.5, mouse.y * 0.5, camera.position.z), 0.2))
}

const ScrollHint = () => {
  const [visible, setVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()

    const handleScroll = () => {
      setVisible(false)
    }
    window.addEventListener('wheel', handleScroll)
    window.addEventListener('touchmove', handleScroll)
    window.addEventListener('resize', checkMobile)
    return () => {
      window.removeEventListener('wheel', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '20px' : '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '10px' : '15px',
      color: '#888',
      fontSize: isMobile ? '10px' : '14px',
      fontFamily: 'Georgia, serif',
      letterSpacing: isMobile ? '1px' : '2px',
      zIndex: 1000,
      animation: 'fadeIn 1s ease-in',
      pointerEvents: 'none',
    }}>
      <span style={{ textTransform: 'uppercase' }}>Scroll to Explore</span>
      <div style={{
        animation: 'bounceRight 1.5s ease-in-out infinite',
        fontSize: isMobile ? '16px' : '24px',
      }}>
        →
      </div>
      <style>{`
        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(8px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
    <ScrollHint />
    <Canvas
      shadows={!isMobile}
      camera={{ position: [0, 0, 5] }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !isMobile,
        powerPreference: isMobile ? 'low-power' : 'high-performance',
        preserveDrawingBuffer: true
      }}
    >
      <ambientLight intensity={isMobile ? 0.7 : 0.5} color={0xffffff} />

      {/* Black background wall */}
      <mesh
        position={[0, 0, -0.1]}
        receiveShadow={!isMobile}
      >
        <planeGeometry args={[200, 15]} />
        <meshStandardMaterial color={0x000000} />
      </mesh>

      <Scene />

      {!isMobile && (
        <EffectComposer>
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
        </EffectComposer>
      )}

      <Rig />
    </Canvas>
    </>
  )
}

export default App;
