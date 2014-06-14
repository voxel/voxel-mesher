'use strict';

var createVoxelMesh = require('./mesh-buffer.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var ndarray = require('ndarray');
var ops = require('ndarray-ops');
var parseBlockModel = require("block-models");
var createBuffer = require("gl-buffer");
var createVAO = require("gl-vao");

module.exports = function(game, opts) {
  return new MesherPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-stitch'],
  clientOnly: true
};

function MesherPlugin(game, opts) {
  this.game = game;
  this.shell = game.shell;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-mesher requires voxel-registry plugin');

  this.stitcher = game.plugins.get('voxel-stitch');
  if (!this.stitcher) throw new Error('voxel-mesher requires voxel-stitch plugin');

  this.isTransparent = undefined;
  this.hasBlockModel = undefined;

  var s = game.chunkSize + (game.chunkPad|0)
  this.solidVoxels = ndarray(new game.arrayType(s*s*s), [s,s,s]);
};
inherits(MesherPlugin, EventEmitter);

MesherPlugin.prototype.createVoxelMesh = function(gl, voxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad) {
  var porousMesh = this.splitVoxelArray(voxels);

  var mesh = createVoxelMesh(gl, this.solidVoxels, voxelSideTextureIDs, voxelSideTextureSizes, position, pad, this);

  mesh.vertexArrayObjects.porous = porousMesh;

  return mesh;
}

// mesh custom voxel
MesherPlugin.prototype.meshCustomBlock = function(value,x,y,z) {
  var modelDefn = this.registry.blockProps[value].blockModel;
  var stitcher = this.stitcher;

  // parse JSON to vertices and UV
  var model = parseBlockModel(
    modelDefn,
    //getTextureUV:
    function(name) {
      return stitcher.getTextureUV(name); // only available when textures are ready
    },
    x,y,z
  );

  return model;
};

// populates solidVoxels array, returns porousMesh
MesherPlugin.prototype.splitVoxelArray = function(voxels) {
  if (!this.isTransparent) {
    // cache list of transparent voxels TODO: refresh cache when changes
    this.isTransparent = this.registry.getBlockPropsAll('transparent');
    this.isTransparent.unshift(true); // air (0) is transparent
  }
  if (!this.hasBlockModel) {
    this.hasBlockModel = this.registry.getBlockPropsAll('blockModel');
    this.hasBlockModel.unshift(undefined);
  }

  // phase 1: solid voxels = opaque, transparent (terrain blocks, glass, greedily meshed)
  var solidVoxels = this.solidVoxels;
  var isTransparent = this.isTransparent;
  ops.assign(solidVoxels, voxels);

  // phase 2: porous voxels = translucent, custom block models (stained glass, slabs, stairs)
  var hasBlockModel = this.hasBlockModel;
  var porousMeshes = this.porousMeshes = [];

  var length = solidVoxels.data.length;
  var vertices = [];
  var uv = [];
  for (var i = 0; i < length; ++i) {
    var value = solidVoxels.data[i];
    if (hasBlockModel[value]) {
      solidVoxels.data[i] = 0;

      // extract coordinate from ndarray index (sorry)
      var o = i;
      var z = (o % 36)-2; o = Math.floor(o / 36);
      var y = (o % 36)-2; o = Math.floor(o / 36);
      var x = o-2;

      // accumulate mesh vertices and uv
      var model = this.meshCustomBlock(value,x,y,z);
      vertices = vertices.concat(model.vertices);
      uv = uv.concat(model.uv);
    } else if (!isTransparent[value]) {
      solidVoxels.data[i] = value | (1<<15); // opaque bit
    }
  }

  // load combined porous mesh into GL
  var gl = this.shell.gl;
  var verticesBuf = createBuffer(gl, new Float32Array(vertices));
  var uvBuf = createBuffer(gl, new Float32Array(uv));
  var porousMesh = createVAO(gl, [
      { buffer: verticesBuf,
        size: 3
      },
      {
        buffer: uvBuf,
        size: 2
      }
      ]);
  porousMesh.length = vertices.length/3;

  return porousMesh;
};

