# xdraw

The WebGL2 3D engine based on both three.js's math and Unity's system.

## Current goals

- [x] Draw the background color
- [x] Play the animation of rotating cube
- [ ] Load GLB
- [ ] Play the MMD
- [ ] Optimization

## For contoributors

### Hierarchy

- lib
  - [x] basis - The mathmetical classes
  - [ ] components - The implements of usefuls
    - [ ] cameras - The frustum of view
    - [ ] colliders - The collision to detect raycasts' hits
    - [ ] lights - The light source for some materials
    - [ ] materials - The shaders' container
    - [ ] meshes - The vertexes and others' container
    - [ ] physics - The rigidbody and other
    - [ ] renderer - The controllers for gl

### To debug

I had set in next.js.

```sh
yarn dev
```
