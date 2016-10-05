const registrants = {
  "0xdc3a9db694bcdd55ebae4a89b22ac6d12b3f0c24": {
    name: "Chronicled Community",
    access: true
  },
  "0x0000000000000000000000000000000000000001": {
    name: "Amazon",
    access: false
  },
  "0x0000000000000000000000000000000000000002": {
    name: "Dominos",
    access: false
  },
  "0x0000000000000000000000000000000000000003": {
    name:"7Eleven",
    access: false
  },
  "0x0000000000000000000000000000000000000004": {
    name: "DHL",
    access: false
  }
};

const hasRegistrant = address => !!registrants[address];

const checkAccess = address => hasRegistrant(address) && registrants[address].access;

const setAccess = (address, access) => hasRegistrant(address) && (registrants[address].access = !!access);

const getAll = () => registrants;

module.exports = {setAccess, checkAccess, getAll, hasRegistrant};
