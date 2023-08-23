import React, { useRef, useState, useEffect } from 'react'
import Sketch from './Sketch'

const ImageDepthMap = ({
  originalImg,
  depthImg,
  verticalThreshold,
  horizontalThreshold,
  respondTo,
  reverseMotion,
  className,
  multiplier = 1,
  useGravity = false,
  rotationCoefX = 0.4,
  rotationCoefY = 0.4,
  rotationAmountX = 18,
  rotationAmountY = 18,
  style
}) => {
  const containerRef = useRef()
  const [domReady, setDomReady] = useState(false)

  useEffect(() => {
    setDomReady(true)
  }, [])

  return (
    <div ref={containerRef} className={`image-DepthMap${className ? ' ' + className : ''}`} style={style ? style : {}}>
      {domReady && <Sketch
        container={containerRef.current}
        imageOriginal={originalImg}
        imageDepth={depthImg}
        vth={verticalThreshold * multiplier}
        hth={horizontalThreshold * multiplier}
        useGravity={useGravity}
        respondTo={respondTo || 'mouseMove'}
        reverseMotion={reverseMotion}
        rotationCoefX={rotationCoefX}
        rotationCoefY={rotationCoefY}
        rotationAmountX={rotationAmountX}
        rotationAmountY={rotationAmountY}
      />}
    </div>
  )
}

export default ImageDepthMap
