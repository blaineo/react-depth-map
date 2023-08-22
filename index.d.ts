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
}

export default class ImageDepthMap extends React.Component<ImageDepthMapProps, any> {

}