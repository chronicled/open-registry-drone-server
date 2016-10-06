/**
 * Utils module
 * @module utils
 */

const crypto = require('crypto');
const _ = require('lodash');
const BigInteger = require('bigi');
const jsrsasign = require('jsrsasign');


/**
 * @constant
 * @alias module:utils.protocols
 * @type {Object}
 * collection of public key protocols recognized by the server
 */
const protocols = {
  PBK_EC_SECP256R1: 'pbk:ec:secp256r1', //ECC public keys
  PBK_RSA_2048: 'pbk:rsa:2048' //RSA public keys
};

/**
 * Returns a hash string based on the original byte buffer, algorith, and outEncoding
 * @param {Node.Byte} byteBuffer byte buffer used for hashing
 * @param {String} algorithm algorithm used to hash (ex. 'sha256')
 * @param {String} outEncoding type of output (ex. 'hex')
 * @return {String} hash
 */
const hash = (byteBuffer, algorithm, outEncoding) => {
  var hash = crypto.createHash(algorithm);
  hash.update(byteBuffer);
  return hash.digest(outEncoding);
};

/**
 * adds padding to a random hex string to output a PKCS #1 padded SHA1 sum (256-byte hex value)
 * @param {String} hexDigest hex string that will be padded
 * @return {String} sha1
 */
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

/**
 * generates a random challenge based on the protocol given
 * @alias module:utils.generateChallenge
 * @param {String} protocol any supported protocol
 * @return {String} challenge
 */
const generateChallenge = protocol => {
  switch (protocol) {
    case protocols.PBK_EC_SECP256R1:
      return hash(crypto.randomBytes(256), 'sha256', 'hex');
    case protocols.PBK_RSA_2048:
      return PKCS1Pad(hash(crypto.randomBytes(256), 'sha256', 'hex'));
    default:
      return "";
  }
};

/**
 * takes a formatted URN and returns an object with fields 'valid' (Bool), 'protocol' (String), and 'value' (String)
 * @alias module:utils.parseURN
 * @param {String} urn a urn of the format protocol:<value>
 * @returns {Object} parsedUrn
 */
const parseURN = urn => {
  const urnChars = (urn || '').split('');
  const isNotColon = c => c !== ':';
  const value = _.takeRightWhile(urnChars, isNotColon).join('');
  const protocol = _.initial(_.dropRightWhile(urnChars, isNotColon)).join('');
  const valid = (value !== '' && protocol !== '');
  return valid ? {value, protocol, valid} : {valid};
};

/**
 * takes a given challenge (hex string) and converts it to Ans1 format
 * @alias module:utils.signatureToAns1
 * @param {String} signature hex string
 * @returns {String} Ans1
 */
const signatureToAns1 = signature => {
  const r = BigInteger.fromHex(signature.slice(0, 64));
  const s = BigInteger.fromHex(signature.slice(64, 128));
  return jsrsasign.ECDSA.biRSSigToASN1Sig(r, s);
};

/** takes a request schema object and returns a piece of express middleware that uses
 * 'express-validator' to ensure the fields in the request body are valid
 * @alias module:utils.validateFields
 * @param {Object} requestSchema An request schema (see 'express-validator')
 * @returns {Function} validateFieldsMiddleware
 */
const validateFields = (requestSchema) => {
  return (req, res, next) => {
    req.checkBody(requestSchema);
    const errors = req.validationErrors();
    if (errors) {
      const invalids = errors.reduce((acc, err) => acc.add(err.param), new Set());
      res.status(400).send({reason: `These field are invalid: ${Array.from(invalids)}`});
    } else {
      next();
    }
  };
};

/** takes a request and response object and returns a function that acts as an
 * error catcher in a promise chain
 * @alias module:utils.makeErrorCatcher
 * @param {Express.Request} req An Express Request Object
 * @param {Express.Response} res An Express Response Object
 * @returns {Function} errorHandler
 */
const makeErrorCatcher = (req, res) => {
  return err => {
    if (typeof err === 'string') {
      res.status(400).send({reason: err});
    } else {
      res.status(500).send({reason: 'Internal Server Error'});
    }
  };
};

module.exports = {protocols, generateChallenge, parseURN, signatureToAns1, validateFields, makeErrorCatcher};

