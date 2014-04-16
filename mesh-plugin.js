'use strict';

var createVoxelMesh = require('./mesh-buffer.js');

module.exports = function(game, opts) {
  return new MesherPlugin(game, opts);
};
module.exports.pluginInfo = {
  clientOnly: true,
  loadAfter: ['voxel-stitch']
};

function MesherPlugin(game, opts) {
  this.shell = game.shell;

  this.stitcher = game.plugins.get('voxel-stitch');
  if (!this.stitcher) throw new Error('voxel-mesher requires voxel-stitch plugin');

  this.voxelArrays = []; // raw voxel data TODO: ~ voxel module chunks or TODO integrate with shama's chunker mentioned in https://github.com/voxel/issues/issues/4#issuecomment-39644684
  this.meshes = []; // meshed for rendering TODO: ~ voxels.meshes, 'voxel' module

  this.enable();
};

MesherPlugin.prototype.enable = function() {
  // when ready stitcher.voxelSideTextureIDs and stitcher.voxelSideTextureSizes are ready,
  // the mesh can be created (requires texture IDs due to opacity and texturing)
  this.stitcher.on('updatedSides', this.onUpdatedSides = this.createMeshes.bind(this));
};

MesherPlugin.prototype.disable = function() {
  this.stitcher.removeListener('updatedSides', this.onUpdatedSides);
};

MesherPlugin.prototype.addVoxelArray = function(voxelArray) {
  this.voxelArrays.push(voxelArray);
};

MesherPlugin.prototype.createMeshes = function() {
  this.meshes.length = 0;

  for (var i = 0; i < this.voxelArrays.length; ++i) {
    var voxelArray = this.voxelArrays[i];

    var mesh = createVoxelMesh(this.shell.gl, voxelArray, this.stitcher.voxelSideTextureIDs, this.stitcher.voxelSideTextureSizes);
    this.meshes.push(mesh);
  }

  /* TODO: camera?
  var c = mesh.center
  camera.lookAt([c[0]+mesh.radius*2, c[1], c[2]], c, [0,1,0])
  */
};
