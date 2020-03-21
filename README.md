# React Depth Map Component
React component that implements depth maps, adding a 3D effect to 2D images

Follow the photoshop portion of [This Tutorial](https://redstapler.co/3d-photo-from-image-javascript-tutorial/) to help you make the assets needed for this component. 

![alt text](depth-map-example.gif "Logo Title Text 1")


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

| Prop        | Type           | Value  |
| ------------- |:-------------:| -----:|
| originalImage      | Path | '' |
| depthImg      | Path      |   '' |
| verticalThreshold | Int      |  1 - 25 |
| horizontalThreshold | Int      |  1 - 25 |