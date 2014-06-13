'use strict';

var createVoxelMesh = require('./mesh-buffer.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var ndarray = require('ndarray');
var ops = require('ndarray-ops');

module.exports = function(game, opts) {
  return new MesherPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry'],
  clientOnly: true
};

function MesherPlugin(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-mesher requires voxel-registry plugin');

  this.transparentMap = undefined;

  var s = game.chunkSize + (game.chunkPad|0)
  this.solidVoxels = ndarray(new game.arrayType(s*s*s), [s,s,s]);
};
inherits(MesherPlugin, EventEmitter);

MesherPlugin.prototype.createVoxelMesh = function(gl, voxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad) {
  this.splitVoxelArray(voxels);

  return createVoxelMesh(gl, this.solidVoxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad);
}

// populates solidVoxels
MesherPlugin.prototype.splitVoxelArray = function(voxels) {
  if (!this.transparentMap) {
    // cache list of transparent voxels TODO: refresh cache when changes
    this.transparentMap = this.registry.getBlockPropsAll('transparent');
    this.transparentMap.unshift(true); // air (0) is transparent
  }

  var begin = Date.now();
  var solidVoxels = this.solidVoxels;
  var transparentMap = this.transparentMap;
  ops.assign(solidVoxels, voxels);

  // add opaque bit as needed
  var length = solidVoxels.data.length;
  for (var i = 0; i < length; ++i) {
    var value = solidVoxels.data[i];
    if (!transparentMap[value]) {
      value |= (1<<15);
      solidVoxels.data[i] = value;
    }
  }
  // TODO: also separate out non-solid voxels for second-phase rendering

  var took = Date.now() - begin;
  if (took > 10) console.log('splitVoxelArray '+took+' ms');
}

