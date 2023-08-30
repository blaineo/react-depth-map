import React, {useEffect} from 'react'
import {isMobile} from 'react-device-detect'
import fragment from 'raw-loader!glslify-loader!./shaders/fragment.glsl'
import vertex from 'raw-loader!glslify-loader!./shaders/vertex.glsl'
import GyroNorm from './lib/gyronorm';

const gn = new GyroNorm.GyroNorm();

const Sketch = ({
    container,
    imageOriginal,
    imageDepth,
    vth,
    hth,
    respondTo,
    reverseMotion,
    useGravity,
    rotationCoefX,
    rotationCoefY,
    rotationAmountX,
    rotationAmountY
}) => {
    const imageURLs = [
        imageOriginal,
        imageDepth
    ]

    let imageAspect = 1
    let mouseX = 0
    let mouseY = 0
    let mouseTargetX = 0
    let mouseTargetY = 0
    let canvas, gl, startTime, ratio, windowHeight, windowWidth
    let program
    let uResolution
    let uMouse
    let uTime
    let uRatio
    let uThreshold
    let billboard

    useEffect(() => {
        canvas = document.createElement('canvas')
        container.appendChild(canvas)
        gl = canvas.getContext('webgl')
        startTime = new Date().getTime() // Get start time for animating
        ratio = window.devicePixelRatio
        createScene()
        addTexture()
        gyro()

        return () => {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
    }, [])

    useEffect(() => {
        let timeoutId = null
        const resizeListener = () => {
            clearTimeout(timeoutId)

            timeoutId = setTimeout(() => {
                resizeHandler()
            }, 150)
        }
        window.addEventListener('resize', resizeListener)
        return () => {
            window.removeEventListener('resize', resizeListener)
        }
    }, [])

    useEffect(() => {
        if (respondTo === 'mouseMove') {
            if (isMobile) {
                if (typeof DeviceMotionEvent.requestPermission === 'function') {
                    container.addEventListener('touchstart', getPermission)
                } else {
                    window.addEventListener('devicemotion', deviceMove)
                }
            } else {
                window.addEventListener('mousemove', mouseMove)
            }
        } else {
            window.addEventListener('scroll', scrollMove)
        }
        return () => {
            if (respondTo === 'mouseMove') {
                if (isMobile) {
                    window.removeEventListener('devicemotion', deviceMove)
                } else {
                    window.removeEventListener('mousemove', mouseMove)
                }
            } else {
                window.removeEventListener('scroll', scrollMove)
            }
        }
    }, [])

    const addShader = (source, type) => {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        const isCompiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        if (!isCompiled) {
            throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader))
        }
        gl.attachShader(program, shader)
    }

    const resizeHandler = () => {
        windowWidth = window.innerWidth
        windowHeight = window.innerHeight
        const width = container.offsetWidth
        const height = width * imageAspect //container.offsetHeight
        const a1 = (height / width < imageAspect) ? 1 : (width / height) * imageAspect
        const a2 = (height / width < imageAspect) ? (height / width) / imageAspect : 1

        canvas.width = width * ratio
        canvas.height = height * ratio
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'

        uResolution.set(width, height, a1, a2)
        uRatio.set(1 / ratio)
        uThreshold.set(hth, vth)
        gl.viewport(0, 0, width * ratio, height * ratio)
    }

    const createScene = () => {
        program = gl.createProgram()
        addShader(vertex, gl.VERTEX_SHADER)
        addShader(fragment, gl.FRAGMENT_SHADER)
        gl.linkProgram(program)
        gl.useProgram(program)
        uResolution = new Uniform('resolution', '4f', program, gl)
        uMouse = new Uniform('mouse', '2f', program, gl)
        uTime = new Uniform('time', '1f', program, gl)
        uRatio = new Uniform('pixelRatio', '1f', program, gl)
        uThreshold = new Uniform('threshold', '2f', program, gl)
        // create position attrib
        billboard = new Rect(gl)
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    const addTexture = () => {
        loadImages(imageURLs, start)
    }

    const start = images => {
        container.classList.add('loaded')
        imageAspect = images[0].naturalHeight / images[0].naturalWidth
        let textures = []
        for (let i = 0; i < images.length; i++) {
            const texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture)
            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

            // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i])
            textures.push(texture)
        }

        // lookup the sampler locations.
        let u_image0Location = gl.getUniformLocation(program, 'image0')
        let u_image1Location = gl.getUniformLocation(program, 'image1')

        // set which texture units to render with.
        gl.uniform1i(u_image0Location, 0) // texture unit 0
        gl.uniform1i(u_image1Location, 1) // texture unit 1

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, textures[0])
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, textures[1])
        // start application
        resizeHandler()
        render()
    }

    const getPermission = e => {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', deviceMove)
                }
            })
            .catch(e => {
                console.error('no dice')
                window.addEventListener('mousemove', mouseMove)
            })
        container.removeEventListener('touchstart', getPermission)
    }

    const gyro = () => {
        const maxTiltX = rotationAmountX
        const maxTiltY = rotationAmountY

        gn.init({gravityNormalized: useGravity}).then(() => {
            gn.start(data => {
                const y = data.do.gamma * rotationCoefY
                const x = data.do.beta * rotationCoefX
                mouseTargetY = clamp(x, -maxTiltX, maxTiltX) / maxTiltX
                mouseTargetX = -clamp(y, -maxTiltY, maxTiltY) / maxTiltY

            })
        }).catch(e => {
            console.log('not supported')
        })
    }

    const deviceMove = e => {
        const maxTiltX = rotationAmountX
        const maxTiltY = rotationAmountY
        const rotation = e.rotationRate || null

        const y = rotation.gamma * rotationCoefY
        const x = rotation.beta * rotationCoefX
        mouseTargetY = clamp(x, -maxTiltX, maxTiltX) / maxTiltX
        mouseTargetX = -clamp(y, -maxTiltY, maxTiltY) / maxTiltY
    }

    const mouseMove = e => {
        const halfX = windowWidth / 2
        const halfY = windowHeight / 2
        const targetX = (halfX - e.clientX) / halfX
        const targetY = (halfY - e.clientY) / halfY
        mouseTargetX = reverseMotion ? targetX * -1 : targetX
        mouseTargetY = reverseMotion ? targetY * -1 : targetY
    }

    const scrollMove = e => {
        const boundingBox = container.getBoundingClientRect()
        const height = boundingBox.height
        const y = boundingBox.y
        const onScreen = y < (windowHeight - height) && y > 0

        if (onScreen) {
            const scrollPercent = (y / (windowHeight - height)).toFixed(2)
            let targetX = 0
            let targetY = 0

            switch (respondTo) {
                case 'scrollOnX':
                    targetX = (2 * scrollPercent) - 1
                    break
                case 'scrollOnY':
                    targetY = (2 * scrollPercent) - 1
                    break
                case 'scrollOnBoth':
                    targetX = (2 * scrollPercent) - 1
                    targetY = (2 * scrollPercent) - 1
                    break
                default:
                    targetX = (2 * scrollPercent) - 1
                    targetY = (2 * scrollPercent) - 1
                    break
            }
            mouseTargetX = reverseMotion ? targetX * -1 : targetX
            mouseTargetY = reverseMotion ? targetY * -1 : targetY
        }
    }

    const render = () => {
        const now = new Date().getTime()
        const currentTime = (now - startTime) / 1000
        uTime.set(currentTime)
        // inertia
        const nMX = mouseX + ((mouseTargetX - mouseX) * 0.05)
        const nMY = mouseY + ((mouseTargetY - mouseY) * 0.05)
        mouseX = nMX
        mouseY = nMY
        uMouse.set(nMX, nMY)

        // render
        billboard.render(gl)
        requestAnimationFrame(render)
    }

    return null
}

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

function Uniform(name, suffix, program, gl) {
    this.name = name
    this.suffix = suffix
    this.gl = gl
    this.program = program
    this.location = gl.getUniformLocation(program, name)
}

Uniform.prototype.set = function (...values) {
    let method = 'uniform' + this.suffix
    let args = [this.location].concat(values)
    this.gl[method].apply(this.gl, args)
}

function Rect(gl) {
    let buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW)
}

Rect.verts = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1
])

Rect.prototype.render = function (gl) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

const clamp = (number, lower, upper) => {
    if (upper !== undefined) {
        number = Math.min(number, upper);
    }
    if (lower !== undefined) {
        number = Math.max(number, lower);
    }
    return number;
};


export default Sketch
