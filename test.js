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

  it('should emit an error', function() {
    var parser = new Parser();
    expect(function() {
      parser.write('{not valid json\r\n');
    }).to.throw('JSON parse error');
  });

  it('should pass in error handler', function(done) {
    var parser = new Parser();
    parser.on('error', function(e) {
      expect(e).to.be.instanceof(Error);
      expect(e.line).to.be.equal('{not valid json');
      done();
    });
    parser.write('{not valid json\r\n');
  });

  it('should parse with multiple break line', function(done) {
    var parser = new Parser();
    parser.write('{"a":1}\r\n\r\n{"a":2}\r\n');
    parser.once('data', function(d1) {
      expect(d1.a).to.be.equal(1);
      parser.once('data', function(d2) {
        expect(d2.a).to.be.equal(2);
        done();
      });
    });
  });

  it('should parse not stop when receive a chunk with break line', function(done) {
    var parser = new Parser();
    parser.write('{"a":1}\r\n');
    parser.write('\r\n');
    parser.write('{"a":2}\r\n');
    parser.once('data', function(d1) {
      expect(d1.a).to.be.equal(1);
      parser.once('data', function(d2) {
        expect(d2.a).to.be.equal(2);
        done();
      });
    });
  });

  it('should not json parse', function(done) {
    var parser = new Parser({
      parse: false
    });
    parser.write('{"a":1}\r\n');
    parser.once('data', function(str) {
      expect(str).to.be.a('string');
      expect(str).to.be.equal('{"a":1}');
      done();
    });
  });

});
