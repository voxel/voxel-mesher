'use strict';

var createVoxelMesh = require('./mesh-buffer.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = function(game, opts) {
  return new MesherPlugin(game, opts);
};
module.exports.pluginInfo = {
  clientOnly: true
};

function MesherPlugin(game, opts) {
  this.game = game;
};
inherits(MesherPlugin, EventEmitter);

MesherPlugin.prototype.createVoxelMesh = createVoxelMesh;

