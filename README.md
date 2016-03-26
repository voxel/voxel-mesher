voxel-mesher
============
A voxel mesher for ndarrays that handles ambient occlusion and transparency.

Based on @mikolalysenko's [ao-mesher](https://github.com/mikolalysenko/ao-mesher)

[![Build Status](https://travis-ci.org/voxel/voxel-mesher.png)](https://travis-ci.org/voxel/voxel-mesher)

## Install

    npm install voxel-mesher

Load with [voxel-plugins](https://github.com/voxel/voxel-plugins)

### API

    var mesher = game.plugins.get('voxel-mesher');

    var mesh = mesher.createVoxelMesh(voxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad)

Constructs a mesh for `voxels`.

* `voxels`: 3D ndarray of voxels
* `voxelSideTextureIDs`: 2D ndarray (15-bit voxel ID, side 0-6) to 16-bit texture ID, defaults to voxel ID
* `voxelSideTextureSizes`: 2D ndarray (15-bit voxel ID, side 0-6) to log2(texture size), defaults to 4 (2^4=16)
* `position`: vector `[x,y,z]` of this chunk's position
* `pad`: twice the number of voxels to pad around each edge (4)

Returns a typed array encoding the mesh, or else null if there were no facets.
This is in the same format that [voxel-shader](https://github.com/voxel/voxel-shader) expects:

    {
        vertexArrayObjects: {surface: ..., porous: ...},
        center: [x, y, z],
        radius: w,
        modelMatrix: mat4
    }

Other plugins can add their own VAOs to `vertexArrayObjects`, by listening for the `meshed` event:

    mesher.on('meshed', function(result, gl, vert_data, voxels) {
        result.vertexArrayObjects.myVAO = ...
    });

This event is used by [voxel-wireframe](https://github.com/voxel/voxel-wireframe) and [voxel-chunkborder](https://github.com/voxel/voxel-chunkborder).

### Voxel types

[voxel-registry](https://github.com/voxel/voxel-registry) is used to lookup voxel information for meshing,
the following properties are supported:

* `transparent`: if true, the voxel textures have transparency, otherwise assumed fully opaque
* `blockModel`: if present, passed to [block-models](https://github.com/deathcap/block-models) for custom non-cube models

These properties determines the voxel type and how they are meshed:

* *Solid*: phase 1 rendering pass - included in `surface` VAO
 * *Opaque*: default, bit 15 set (example: dirt)
 * *Transparent*: property `transparent` true, bit 15 clear (example: glass)
* *Porous*: phase 2 rendering pass - included in `porous` VAO
 * `blockModel` property present
 * Allows for translucent (example: stained glass) and custom model (example: slabs) blocks

# Credits
(c) 2013 Mikola Lysenko, (c) 2014-2015 deathcap. MIT License
