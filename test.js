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
    }).to.throw();
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


  //DO NOT WORKS !!
  //stream do not restart after an error
  //this could be an intersting feature
  it.skip('should flush buffer and restart clean on an error', function(done) {
    var parser = new Parser();
    parser.on('error', function(e) {
      expect(e).to.be.instanceof(Error);
      console.log('error', e);
    });
    var i = 0;
    parser.on('data', function(data) {
      console.log('data', data);
      i++;
      if (i === 1) {
        expect(data.a).to.be.deep.equal(1);
      } else if (i === 2) {
        expect(data.a).to.be.deep.equal(2);
        done();
      }
    });
    parser.write('{"a":1}\r\n');
    parser.write('{not valid json\r\n');
    parser.write('{"a":2}\r\n');
  });

});
