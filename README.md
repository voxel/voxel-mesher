voxel-mesher
============
A voxel mesher for ndarrays that handles ambient occlusion and transparency.

Based on @mikolalysenko's [ao-mesher](https://github.com/mikolalysenko/ao-mesher)

## Install

    npm install voxel-mesher

### `require("voxel-mesher")(array, [voxelSideTextureIDs, [voxelSideTextureSizes]])`
Constructs a mesh for `array`. 

* `array` is a 3D ndarray of voxels
* `voxelSideTextureIDs` is a 2D ndarray (15-bit voxel ID, side 0-6) to 16-bit texture ID, defaults to voxel ID
* `voxelSideTextureSizes` is a 2D ndarray (15-bit voxel ID, side 0-6) to log2(texture size), defaults to 4 (2^4=16)

**Returns** A `Uint8Array` encoding the mesh, or else null if there were no facets.  This is in the same format that [voxel-shader](https://github.com/deathcap/voxel-shader) expects.


# Credits
(c) 2013 Mikola Lysenko. MIT License
