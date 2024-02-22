import React from 'react'

export interface ImageDepthMapProps {
    originalImg: string
    depthImg: string
    verticalThreshold?: number
    horizontalThreshold?: number
    respondTo?: string
    reverseMotion?: boolean
    className?: string
    style?: Object
    useGravity?: boolean
    multiplier?: number
    rotationCoefX?: number
    rotationCoefY?: number
    rotationAmountX?: number
    rotationAmountY?: number
}

export default class ImageDepthMap extends React.Component<ImageDepthMapProps, any> {

}