/**
 * Registrants module
 * @module models/registrants
 */

const registrants = {
  "0xdc3a9db694bcdd55ebae4a89b22ac6d12b3f0c24": {
    name: "Chronicled Community",
    access: true
  },
  "0xc16fdf87ea9999851cf14531c209191ce32599ee": {
    name: "Shoe Surgeon",
    access: false
  },
  "0x0000000000000000000000000000000000000001": {
    name: "Amazon",
    access: false
  },
  "0x0000000000000000000000000000000000000002": {
    name: "Dominos",
    access: false
  },
  "0x0000000000000000000000000000000000000004": {
    name: "DHL",
    access: false
  }
};

/**
 * check to see if the registrant at the given address is present
 * @alias module:models/registrants.hasRegistrant
 * @param {String} address address of Registrant
 * @return {Boolean} hasRegistrant
 */
const hasRegistrant = address => !!registrants[address];

/**
 * checks to see if a registrat at the given address has access
 * @alias module:models/registrants.checkAccess
 * @param {String} address address of Registrant
 * @return {Boolean} hasAccess
 */
const checkAccess = address => hasRegistrant(address) && registrants[address].access;

/**
 * sets the access value for a given registrant at an address to a boolean
 * @alias module:models/registrants.setAccess
 * @param {String} address address of Registrant
 * @param {Boolean} access access permission for Registrant
 */
const setAccess = (address, access) => hasRegistrant(address) && (registrants[address].access = !!access);

/**
 * return collection of registrantAddresses and registrant objects
 * @alias module:models/registrants.getAll
 * @return {Object} registrants
 */
const getAll = () => registrants;

module.exports = {setAccess, checkAccess, getAll, hasRegistrant};
