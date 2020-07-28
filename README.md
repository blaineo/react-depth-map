# React Depth Map Component
React component that implements depth maps, adding a 3D effect to 2D images

This component was adapted and abstracted from an older repo developed by Yuri Artiukh [here](https://github.com/akella/fake3d)

The gyroscopic functionality was removed because Apple now requires a user-activated approval. ( too many steps for a good user experience )

Follow the photoshop portion of [This Tutorial](https://redstapler.co/3d-photo-from-image-javascript-tutorial/) to help you make the assets needed for this component. 

![alt text](https://blaine-assets.s3-us-west-1.amazonaws.com/depth-map-example.gif "3D Basketball")


### To Use
```
npm install react-depth-component
```

```javascript
import ImageDepthMap from 'react-depth-map'
```

```html
    <ImageDepthMap
      originalImg={'./ball.jpg'}
      depthImg={'./ball-map.jpg'}
      verticalThreshold={25}
      horizontalThreshold={15}
    />
```
## Notes
* The component grows to the size of it's container ( or the natural size of the images )
* The images are loaded into a canvas, beware of cross-domain issues. Load either relative local paths or from domains that have the proper CORS policy



| Prop        | Type           | Value  | Default  |
| ------------- |:-------------:| -----:| -----:|
| originalImage      | Path | '' | NA |
| depthImg      | Path  |   '' | NA |
| verticalThreshold | Int |  1 - 25 |
| horizontalThreshold | Int |  1 - 25 |
| reverseMotion | Boolean      |  true, false | false |
| respondTo | String  | mouseMove, scrollOnX, scrollOnY, scrollOnBoth | mouseMove |

