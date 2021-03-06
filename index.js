var Parent = require('stream').Transform;
var StringDecoder = require('string_decoder').StringDecoder;
var util = require('util');

util.inherits(Parser, Parent);

function JSONStreamParserError(line) {
  Error.call(this);
  this.name = 'JSONStreamParserError';
  this.message = 'JSON parse error';
  this.line = line;
}

util.inherits(JSONStreamParserError, Error);


function Parser(options) {
  this.parse = (options && options.parse === false) ? false : true;
  var _options = {
    readableObjectMode: this.parse
  };
  if(!this.parse){
    _options.encoding = 'utf8';
  }
  Parent.call(this, _options);
  this._buffer = '';
  this._decoder = new StringDecoder('utf8');
}

Parser.prototype._transform = function(chunk, encoding, callback) {
  this._buffer += this._decoder.write(chunk);
  var lines = this._buffer.split(/\r?\n/);
  this._buffer = lines.pop();
  for (var l = 0; l < lines.length; l++) {
    var line = lines[l];
    if (line !== '') {
      if (!this.parse) {
        this.push(line);
      } else {
        var obj;
        try {
          obj = JSON.parse(line);
        } catch (err) {
          this.emit('error', new JSONStreamParserError(line));
          return;
        }
        if (obj) {
          this.push(obj);
        }
      }
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
