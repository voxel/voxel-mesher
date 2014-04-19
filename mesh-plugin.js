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
  //moved to voxel-engine
  // when ready stitcher.voxelSideTextureIDs and stitcher.voxelSideTextureSizes are ready,
  // the mesh can be created (requires texture IDs due to opacity and texturing)
  //this.stitcher.on('updatedSides', this.onUpdatedSides = this.createMeshes.bind(this));
};

MesherPlugin.prototype.disable = function() {
  //this.stitcher.removeListener('updatedSides', this.onUpdatedSides);
};

MesherPlugin.prototype.createMesh = function(voxelArray, position) {
  this.meshes.length = 0;

  if (!this.stitcher.voxelSideTextureIDs || !this.stitcher.voxelSideTextureSizes)
    throw new Error('voxel-mesher createMesh() called before stitcher was ready (updatedSides event)');

  if (!this.shell.gl)
    throw new Error('voxel-mesher createMesh() called before this.shell.gl was ready');

  var mesh = createVoxelMesh(this.shell.gl, voxelArray, this.stitcher.voxelSideTextureIDs, this.stitcher.voxelSideTextureSizes, position);
  if (!mesh) return null; // no vertices

  this.meshes.push(mesh); // TODO: remove; let voxel-engine hold the meshes (but then need to update voxel-shader)

  return mesh;
};
