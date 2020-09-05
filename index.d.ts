import * as React from 'react'

export interface ImageDepthMap {
    originalImg: string
    depthImg: string
    verticalThreshold?: number
    horizontalThreshold?: number
    respondTo?: string
    reverseMotion?: boolean
    className?: string
    style?: Object
}

export interface Sketch {
    container: any
    imageOriginal: string
    imageDepth: string
    vth?: number
    hth?: number
    useGravity?: boolean
    multiplier?: number
    respondTo: string
    reverseMotion: boolean
}