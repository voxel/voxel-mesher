"use strict"

var ndarray = require("ndarray")
var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var createAOMesh = require("./mesh.js")
var ops = require("ndarray-ops")
var mat4 = require("gl-mat4")

//Creates a mesh from a set of voxels
function createVoxelMesh(gl, voxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad, that) {
  //Create mesh
  var vert_data = createAOMesh(voxels, voxelSideTextureIDs, voxelSideTextureSizes)
  var vertexArrayObjects = {}

  if (vert_data === null) {
    // no vertices allocated
  } else {
    //Upload triangle mesh to WebGL
    var vert_buf = createBuffer(gl, vert_data)
    var triangleVAO = createVAO(gl, [
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

    vertexArrayObjects.surface = triangleVAO
  }

  // move the chunk into place
  var modelMatrix = mat4.create()
  var w = voxels.shape[2] - pad  // =[1]=[0]=game.chunkSize
  var translateVector = [
    position[0] * w,
    position[1] * w,
    position[2] * w]

  mat4.translate(modelMatrix, modelMatrix, translateVector)

  //Bundle result and return
  var result = {
    vertexArrayObjects: vertexArrayObjects, // other plugins can add their own VAOs
    center: [w>>1, w>>1, w>>1],
    radius: w,
    modelMatrix: modelMatrix
  }

  if (that) that.emit('meshed', result, gl, vert_data, voxels)

  return result
}

module.exports = createVoxelMesh
