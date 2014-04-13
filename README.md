voxel-mesher
============
A voxel mesher for ndarrays that handles ambient occlusion and transparency.

Based on @mikolalysenko's [ao-mesher](https://github.com/mikolalysenko/ao-mesher)

## Install

    npm install voxel-mesher

### `require("voxel-mesher")(array)`
Constructs a mesh for `array`. 

* `array` is a 3D ndarray of voxels

**Returns** A uint8array encoding the mesh, or else null if there were no facets.  This is in the same format that `voxel-shader` expects.


# Credits
(c) 2013 Mikola Lysenko. MIT License
