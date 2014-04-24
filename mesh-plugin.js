'use strict';

var createVoxelMesh = require('./mesh-buffer.js');

module.exports = function(game, opts) {
  return new MesherPlugin(game, opts);
};
module.exports.pluginInfo = {
  clientOnly: true
};

function MesherPlugin(game, opts) {
  this.game = game;
};

MesherPlugin.prototype.createVoxelMesh = createVoxelMesh;

