var ECDSA = require('./ecdsa');
var Key = require('./key');
var Privkey = require('./privkey');
var Pubkey = require('./pubkey');
var BufferWriter = require('./bufferwriter');
var Hash = require('./hash');
var Address = require('./address');
var Signature = require('./signature');

var Message = function Message(messagebuf, key, sig, address, verified) {
  if (!(this instanceof Message))
    return new Message(messagebuf, key, sig);
  this.messagebuf = messagebuf;
  this.key = key;
  this.sig = sig;
  this.address = address;
  this.verified = verified;
};

Message.magicBytes = new Buffer('Bitcoin Signed Message:\n');

Message.magicHash = function(messagebuf) {
  if (!Buffer.isBuffer(messagebuf))
    throw new Error('messagebuf must be a buffer');
  var bw = new BufferWriter();
  bw.writeVarInt(Message.magicBytes.length);
  bw.write(Message.magicBytes);
  bw.writeVarInt(messagebuf.length);
  bw.write(messagebuf);
  var buf = bw.concat();

  var hashbuf = Hash.sha256sha256(buf);

  return hashbuf;
};

Message.prototype.sign = function() {
  var hashbuf = Message.magicHash(this.messagebuf);
  var ecdsa = ECDSA(hashbuf, this.key);
  ecdsa.signRandomK();
  ecdsa.calci();
  this.sig = ecdsa.sig;
  return this;
};

Message.sign = function(messagebuf, key) {
  var m = Message(messagebuf, key);
  m.sign();
  var sigbuf = m.sig.toCompressed();
  var sigstr = sigbuf.toString('base64');
  return sigstr;
};

Message.prototype.verify = function() {
  var hashbuf = Message.magicHash(this.messagebuf);

  var ecdsa = new ECDSA();
  ecdsa.hashbuf = hashbuf;
  ecdsa.sig = this.sig;
  ecdsa.key = new Key();
  ecdsa.key.pubkey = ecdsa.sig2pubkey();

  if (!ecdsa.verify()) {
    this.verified = false;
    return this;
  }

  var address = Address().fromPubkey(ecdsa.key.pubkey);
  //TODO: what if livenet/testnet mismatch?
  if (address.hashbuf.toString('hex') === this.address.hashbuf.toString('hex'))
    this.verified = true;
  else
    this.verified = false;

  return this;
};

Message.verify = function(messagebuf, sigstr, address) {
  var sigbuf = new Buffer(sigstr, 'base64');
  var message = new Message();
  message.messagebuf = messagebuf;
  message.sig = Signature().fromCompressed(sigbuf);
  message.address = address;

  return message.verify().verified;
};

module.exports = Message;