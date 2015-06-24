var Parent = require('stream').Transform;
var StringDecoder = require('string_decoder').StringDecoder;
var util = require('util');

util.inherits(Parser, Parent);

function Parser() {
  Parent.call(this, {
    readableObjectMode: true
  });
  this._buffer = '';
  this._decoder = new StringDecoder('utf8');
}

Parser.prototype._transform = function(chunk, encoding, callback) {
  this._buffer += this._decoder.write(chunk);
  var lines = this._buffer.split(/\r?\n/);
  this._buffer = lines.pop();
  for (var l = 0; l < lines.length; l++) {
    var line = lines[l];
    var obj;
    try {
      obj = JSON.parse(line);
    } catch (err) {
      this.emit('error', err);
    }
    if (obj) {
      this.push(obj);
    }
  }
  callback();
};

Parser.prototype._flush = function(callback) {
  var rem = this._buffer.trim();
  if (rem) {
    var obj;
    try {
      obj = JSON.parse(rem);
    } catch (err) {
      this.emit('error', err);
    }
    if (obj) {
      this.push(obj);
    }
  }
  callback();
};

module.exports = Parser;
