var expect = require('chai').expect;
var Parser = require('./');

describe('json-stream-parser', function() {

  it('should parse an object', function(done) {
    var parser = new Parser();
    parser.on('data', function(t) {
      expect(t).to.be.deep.equal({
        a: 1
      });
      done();
    });
    parser.write('{"a":1}\r\n');
  });

  it('should parse 2 object in one chunk', function(done) {
    var parser = new Parser();
    var times = 0;
    parser.on('data', function(t) {
      times++;
      if (times === 1) {
        expect(t).to.be.deep.equal({
          a: 1
        });
      }
      if (times === 2) {
        expect(t).to.be.deep.equal({
          b: 2
        });
        done();
      }
    });
    parser.write('{"a":1}\r\n{"b":2}\r\n');
  });

  it('should parse 1 object in 2 chunk', function(done) {
    var parser = new Parser();
    parser.on('data', function(t) {
      expect(t).to.be.deep.equal({
        a: 1
      });
      done();
    });
    parser.write('{"a"');
    parser.write(':1}\r\n');
  });


  it('should parse 2 object in 2 chunk', function(done) {
    var parser = new Parser();
    var times = 0;
    parser.on('data', function(t) {
      times++;
      if (times === 1) {
        expect(t).to.be.deep.equal({
          a: 1
        });
      }
      if (times === 2) {
        expect(t).to.be.deep.equal({
          b: 2
        });
        done();
      }
    });
    parser.write('{"a":');
    parser.write('1}\r\n{"b":2}\r\n');
  });

});
