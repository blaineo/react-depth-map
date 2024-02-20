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
  style,
}) => {
  const containerRef = useRef()
  const [preloadedImages, setPreloadedImages] = useState(false);

  useEffect(() => {
    loadImages([originalImg, depthImg], (images) => {
      setPreloadedImages(images);
    });
  }, [originalImg, depthImg])

  const loadImage = (url, callback) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = url
    image.onload = callback
    return image
  }
  const loadImages = (urls, callback) => {
    let images = []
    let imagesToLoad = urls.length

    // Called each time an image finished loading.
    let onImageLoad = () => {
      --imagesToLoad
      // If all the images are loaded call the callback.
      if (imagesToLoad === 0) {
        callback(images)
      }
    }

    for (let ii = 0; ii < imagesToLoad; ++ii) {
      let image = loadImage(urls[ii], onImageLoad)
      images.push(image)
    }
  }

  return (
    <div ref={containerRef} className={`image-DepthMap${className ? ' ' + className : ''}`} style={style ? style : {}}>
      {preloadedImages ? <Sketch
        container={containerRef.current}
        imageOriginal={preloadedImages[0]}
        imageDepth={preloadedImages[1]}
        vth={verticalThreshold * multiplier}
        hth={horizontalThreshold * multiplier}
        useGravity={useGravity}
        respondTo={respondTo || 'mouseMove'}
        reverseMotion={reverseMotion}
        rotationCoefX={rotationCoefX}
        rotationCoefY={rotationCoefY}
        rotationAmountX={rotationAmountX}
        rotationAmountY={rotationAmountY}
      /> : (
        <Loader />
      )}
    </div>
  )
}

const Loader = () => {
  return (
      <svg viewBox="0 0 100 100" style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        height: "150px",
        width: "150px",
      }}>
        <g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="6">
          <path d="M 21 40 V 59">
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                values="0 21 59; 180 21 59"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <path d="M 79 40 V 59">
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                values="0 79 59; -180 79 59"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <path d="M 50 21 V 40">
            <animate
                attributeName="d"
                values="M 50 21 V 40; M 50 59 V 40"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <path d="M 50 60 V 79">
            <animate
                attributeName="d"
                values="M 50 60 V 79; M 50 98 V 79"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <path d="M 50 21 L 79 40 L 50 60 L 21 40 Z">
            <animate
                attributeName="stroke"
                values="rgba(255,255,255,1); rgba(100,100,100,0)"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <path d="M 50 40 L 79 59 L 50 79 L 21 59 Z"/>
          <path d="M 50 59 L 79 78 L 50 98 L 21 78 Z">
            <animate
                attributeName="stroke"
                values="rgba(100,100,100,0); rgba(255,255,255,1)"
                dur="2s"
                repeatCount="indefinite" />
          </path>
          <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="translate"
              values="0 0; 0 -19"
              dur="2s"
              repeatCount="indefinite" />
        </g>
      </svg>
  );
}

export default ImageDepthMap
