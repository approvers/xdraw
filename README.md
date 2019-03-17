# xdraw

The WebGL2 3D engine based on both three.js's math and Unity's system.

## Current goals

- ~~Draw the background color~~
- ~~Play the animation of rotating cube~~
- Load GLB
- Play the MMD
- Optimization

## For contoributors

### Hierarchy

- lib
  - basis - The mathmetical classes
  - components - The implements of usefuls
    - cameras - The frustum of view (incomplete)
    - colliders - The collision to detect raycasts' hits (not implemented)
    - lights - The light source for some materials (not implemented)
    - materials - The shaders' container (implemented only unlits)
    - meshes - The vertexes and others' container (implemented some mesh)
    - physics - The rigidbody and other (not implemented)
    - renderer - The controllers for gl (incomplete)

### To debug

I had set in next.js.

    $ yarn dev
