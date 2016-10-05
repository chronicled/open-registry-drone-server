const crypto = require('crypto');
const _ = require('lodash');
const BigInteger = require('bigi');
const jsrsasign = require('jsrsasign');

const protocols = {
  PBK_EC_SECP256R1: 'pbk:ec:secp256r1', //ECC public keys
  PBK_RSA_2048: 'pbk:rsa:2048' //RSA public keys
};

const hash = (byteBuffer, algorithm, outEncoding) => {
  var hash = crypto.createHash(algorithm);
  hash.update(byteBuffer);
  return hash.digest(outEncoding);
};

//PKCS #1 padded SHA1 sum of 256 random bytes, output as a hex value (output is 256-byte hex value)
const PKCS1Pad = hexDigest => {
  const pkcs1Header = ['00', '01', 'ff'].join('');
  // 30 31 30 0d 06 09 60 86 48 01 65 03 04 02 01 05 00 04 20
  // SHA256 header, see http://www.di-mgt.com.au/rsa_alg.html#signpkcs1
  const shaHeader = ['30', '31', '30', '0d', '06', '09', '60', '86', '48', '01', '65', '03', '04', '02', '01', '05', '00', '04', '20'].join('');
  const footer = '00';
  const padding = _.times(201).map(() => 'ff').join('');
  const paddingWithHeaderAndFooter = `${pkcs1Header}${padding}${footer}`;
  const value = `${shaHeader}${hexDigest}`;
  return `${paddingWithHeaderAndFooter}${value}`;
};

const generateChallenge = protocol => {
  switch (protocol) {
    case protocols.PBK_EC_SECP256R1:
      return hash(crypto.randomBytes(256), 'sha256', 'hex');
    case protocols.PBK_RSA_2048:
      return PKCS1Pad(hash(crypto.randomBytes(256), 'sha256', 'hex'));
    default:
      return null;
  }
};

const parseURN = urn => {
  const urnChars = (urn || '').split('');
  const isNotColon = c => c !== ':';
  const value = _.takeRightWhile(urnChars, isNotColon).join('');
  const protocol = _.initial(_.dropRightWhile(urnChars, isNotColon)).join('');
  const valid = (value !== '' && protocol !== '');
  return valid ? {value, protocol, valid} : {valid};
};

const signatureToAns1 = signature => {
  const r = BigInteger.fromHex(signature.slice(0, 64));
  const s = BigInteger.fromHex(signature.slice(64, 128));
  return jsrsasign.ECDSA.biRSSigToASN1Sig(r, s);
};


const validateFields = (...fields) => {
  return (req, res, next) => {
    const missingFields = fields.filter(field => !(field in req.body));
    if (missingFields.length === 0) {
      next();
    } else {
      res.status(400).send({reason: `The Following Fields are missing: ${missingFields.toString()}`});
    }
  };
};

const makeErrorCatcher = (req, res) => {
  return err => {
    if (typeof err === 'string') {
      res.status(400).send({reason: err});
    } else {
      res.status(500).send({reason: "Internal Server Error"});
    }
  };
};

module.exports = {protocols, generateChallenge, parseURN, signatureToAns1, validateFields, makeErrorCatcher};

