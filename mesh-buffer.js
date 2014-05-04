"use strict"

var ndarray = require("ndarray")
var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var createAOMesh = require("./mesh.js")
var ops = require("ndarray-ops")
var glm = require("gl-matrix")
var mat4 = glm.mat4

//Creates a mesh from a set of voxels
function createVoxelMesh(gl, voxels, voxelSideTextureIDs, voxelSideTextureSizes, position) {
  //Create mesh
  var vert_data = createAOMesh(voxels, voxelSideTextureIDs, voxelSideTextureSizes)
  var triangleVertexCount, triangleVAO

  if (vert_data === null) {
    // no vertices allocated
    triangleVertexCount = 0
    triangleVAO = null
  } else {
    //Upload triangle mesh to WebGL
    var vert_buf = createBuffer(gl, vert_data)
    triangleVAO = createVAO(gl, [
      { "buffer": vert_buf,
        "type": gl.UNSIGNED_BYTE,
        "size": 4,
        "offset": 0,
        "stride": 8,
        "normalized": false
      },
      { "buffer": vert_buf,
        "type": gl.UNSIGNED_BYTE,
        "size": 4,
        "offset": 4,
        "stride": 8,
        "normalized": false
      }
    ])
    triangleVAO.length = Math.floor(vert_data.length/8)
  }

  // move the chunk into place
  var modelMatrix = mat4.create()
  var translateVector = [
    position[2] * (voxels.shape[2] - 2),
    position[1] * (voxels.shape[1] - 2),
    position[0] * (voxels.shape[0] - 2)]

  mat4.translate(modelMatrix, modelMatrix, translateVector)

  //Bundle result and return
  var result = {
    triangleVAO: triangleVAO,
    center: [voxels.shape[0]>>1, voxels.shape[1]>>1, voxels.shape[2]>>1],
    radius: voxels.shape[2],
    modelMatrix: modelMatrix
  }

  if (this) this.emit('meshed', result, gl, vert_data, voxels)

  return result
}

module.exports = createVoxelMesh
