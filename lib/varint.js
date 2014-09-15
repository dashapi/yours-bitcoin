var BufferWriter = require('./bufferwriter');
var BufferReader = require('./bufferreader');
var BN = require('./bn');

var Varint = function Varint(buf) {
  if (!(this instanceof Varint))
    return new Varint(buf);
  if (Buffer.isBuffer(buf)) {
    this.buf = buf;
  } else if (typeof buf === 'number') {
    var num = buf;
    this.fromNumber(num);
  } else if (buf) {
    var obj = buf;
    this.set(obj);
  }
};

Varint.prototype.set = function(obj) {
  this.buf = obj.buf || this.buf;
  return this;
};

Varint.prototype.fromBuffer = function(buf) {
  this.buf = buf;
  return this;
};

Varint.prototype.fromBufferReader = function(br) {
  this.buf = br.readVarintBuf();
  return this;
};

Varint.prototype.fromNumber = function(num) {
  this.buf = BufferWriter().writeVarintNum(num).concat();
  return this;
};

Varint.prototype.toBuffer = function() {
  return this.buf;
};

Varint.prototype.toNumber = function() {
  return BufferReader(this.buf).readVarintNum();
};

module.exports = Varint;