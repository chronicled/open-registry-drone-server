# Open Registry Sever
Server for the Open Registry SDK

# API Endpoints
* [Registrants](#api_registrants)
    * [GET /registrants](#api_registrants/get)
    * [POST /registrants](#api_registrants/post)
* [requestChallenge](#api_requestChallenge)
    * [POST /requestChallenge](#api_requestChallenge/post)
* [verifyChallenge](#api_verifyChallenge)
    * [POST /verifyChallenge](#api_verifyChallenge/post)

# Modules
* [models/registrants](#module_models/registrants)
    * [hasRegistrant(address)](#module_models/registrants.hasRegistrant) ⇒ <code>Boolean</code>
    * [checkAccess(address)](#module_models/registrants.checkAccess) ⇒ <code>Boolean</code>
    * [setAccess(address, access)](#module_models/registrants.setAccess)
    * [getAll()](#module_models/registrants.getAll) ⇒ <code>Object</code>
    
* [models/challenges](#module_models/challenges)
    * [add(challenge)](#module_models/challenges.add)
    * [check(challenge)](#module_models/challenges.check) ⇒ <code>boolean</code>
    
* [utils](#module_utils)
    * [protocols](#module_utils.protocols) : <code>Object</code>
    * [generateChallenge(protocol)](#module_utils.generateChallenge) ⇒ <code>String</code>
    * [parseURN(urn)](#module_utils.parseURN) ⇒ <code>Object</code>
    * [signatureToAns1(signature)](#module_utils.signatureToAns1) ⇒ <code>String</code>
    * [validateFields(requestSchema)](#module_utils.validateFields) ⇒ <code>function</code>
    * [makeErrorCatcher(req, res)](#module_utils.makeErrorCatcher) ⇒ <code>function</code>
    * _inner_
        * [~hash(byteBuffer, algorithm, outEncoding)](#module_utils..hash) ⇒ <code>String</code>
        * [~PKCS1Pad(hexDigest)](#module_utils..PKCS1Pad) ⇒ <code>String</code>

# API Documentation for Open Registry Server

<a name="api_registrants"></a>
# Registrants

## 
<a name="api_registrants/get"></a>

<p>Request All Registrants Info (address, name, access)</p>

	GET /registrants


### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
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
   }
}
```
## 
<a name="api_registrants/post"></a>

<p>Modify access permissions for registrant</p>

	POST /registrants


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| access			| Boolean			|  <p>access boolean for registrant</p>							|
| registrantAddress			| String			|  <p>registrantAddress</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "modified" : 1
}
```
### Error Response

Error-Response:

```
HTTP/1.1 404 Not Found
{
  "reason": "Registrant does not exist"
}
```


<a name="api_requestChallenge"></a>
# Request_Challenge

<a name="api_requestChallenge/post"></a>
## 

<p>Request a challenge based on a Thing's identity</p>

	POST /requestChallenge


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| identity			| String			|  <p>The identifying URN for the thing that will be challenged</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "challenge" : "8b2c583afdcea8f41e59a330181a72a8058490bc1c9cbf3455d632de3db0b1b1"
}
```
### Error Response

Error-Response:

```
HTTP/1.1 400 Not Found
{
  "reason": "Thing\'s public key protocol is not supported"
}
```

<a name="api_verifyChallenge"></a>
# Verify_Challenge

## 
<a name="api_verifyChallenge/post"></a>

<p>verify a challenge that has been signed by a Thing's public key</p>

	POST /verifyChallenge


### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| identity			| String			|  <p>The identifying URN for the thing that has been challenged</p>							|
| challenge			| String			|  <p>The challenge that was sent to the thing</p>							|
| signature			| String			|  <p>The string that resulted when the Thing signed the challenge</p>							|

### Success Response

Success-Response:

```
HTTP/1.1 200 OK
{
  "verified" : true
}
```
### Error Response

Error-Response:

```
HTTP/1.1 400 Not Found
{
  "reason": "Thing does not have a supported public key"
}
```


# Module Documentation

<a name="module_models/registrants"></a>

## models/registrants
Registrants module


* [models/registrants](#module_models/registrants)
    * [hasRegistrant(address)](#module_models/registrants.hasRegistrant) ⇒ <code>Boolean</code>
    * [checkAccess(address)](#module_models/registrants.checkAccess) ⇒ <code>Boolean</code>
    * [setAccess(address, access)](#module_models/registrants.setAccess)
    * [getAll()](#module_models/registrants.getAll) ⇒ <code>Object</code>

<a name="module_models/registrants.hasRegistrant"></a>

### models/registrants.hasRegistrant(address) ⇒ <code>Boolean</code>
check to see if the registrant at the given address is present

**Kind**: static method of <code>[models/registrants](#module_models/registrants)</code>  
**Returns**: <code>Boolean</code> - hasRegistrant  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | address of Registrant |

<a name="module_models/registrants.checkAccess"></a>

### models/registrants.checkAccess(address) ⇒ <code>Boolean</code>
checks to see if a registrat at the given address has access

**Kind**: static method of <code>[models/registrants](#module_models/registrants)</code>  
**Returns**: <code>Boolean</code> - hasAccess  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | address of Registrant |

<a name="module_models/registrants.setAccess"></a>

### models/registrants.setAccess(address, access)
sets the access value for a given registrant at an address to a boolean

**Kind**: static method of <code>[models/registrants](#module_models/registrants)</code>  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | address of Registrant |
| access | <code>Boolean</code> | access permission for Registrant |

<a name="module_models/registrants.getAll"></a>

### models/registrants.getAll() ⇒ <code>Object</code>
return collection of registrantAddresses and registrant objects

**Kind**: static method of <code>[models/registrants](#module_models/registrants)</code>  
**Returns**: <code>Object</code> - registrants  
<a name="module_models/challenges"></a>

## models/challenges
Challenges module


* [models/challenges](#module_models/challenges)
    * [add(challenge)](#module_models/challenges.add)
    * [check(challenge)](#module_models/challenges.check) ⇒ <code>boolean</code>

<a name="module_models/challenges.add"></a>

### models/challenges.add(challenge)
stores added challenge for five minutes in Set

**Kind**: static method of <code>[models/challenges](#module_models/challenges)</code>  

| Param | Type | Description |
| --- | --- | --- |
| challenge | <code>string</code> | challenge to be added |

<a name="module_models/challenges.check"></a>

### models/challenges.check(challenge) ⇒ <code>boolean</code>
checks set to see if challenge has been added to it

**Kind**: static method of <code>[models/challenges](#module_models/challenges)</code>  
**Returns**: <code>boolean</code> - isPresent  

| Param | Type | Description |
| --- | --- | --- |
| challenge | <code>string</code> | challenge to be checked |

<a name="module_utils"></a>

## utils
Utils module


* [utils](#module_utils)
    * [protocols](#module_utils.protocols) : <code>Object</code>
    * [generateChallenge(protocol)](#module_utils.generateChallenge) ⇒ <code>String</code>
    * [parseURN(urn)](#module_utils.parseURN) ⇒ <code>Object</code>
    * [signatureToAns1(signature)](#module_utils.signatureToAns1) ⇒ <code>String</code>
    * [validateFields(requestSchema)](#module_utils.validateFields) ⇒ <code>function</code>
    * [makeErrorCatcher(req, res)](#module_utils.makeErrorCatcher) ⇒ <code>function</code>
    * _inner_
        * [~hash(byteBuffer, algorithm, outEncoding)](#module_utils..hash) ⇒ <code>String</code>
        * [~PKCS1Pad(hexDigest)](#module_utils..PKCS1Pad) ⇒ <code>String</code>

<a name="module_utils.protocols"></a>

### utils.protocols : <code>Object</code>
collection of public key protocols recognized by the server

**Kind**: static constant of <code>[utils](#module_utils)</code>  
<a name="module_utils.generateChallenge"></a>

### utils.generateChallenge(protocol) ⇒ <code>String</code>
generates a random challenge based on the protocol given

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>String</code> - challenge  

| Param | Type | Description |
| --- | --- | --- |
| protocol | <code>String</code> | any supported protocol |

<a name="module_utils.parseURN"></a>

### utils.parseURN(urn) ⇒ <code>Object</code>
takes a formatted URN and returns an object with fields 'valid' (Bool), 'protocol' (String), and 'value' (String)

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>Object</code> - parsedUrn  

| Param | Type | Description |
| --- | --- | --- |
| urn | <code>String</code> | a urn of the format protocol:<value> |

<a name="module_utils.signatureToAns1"></a>

### utils.signatureToAns1(signature) ⇒ <code>String</code>
takes a given challenge (hex string) and converts it to Ans1 format

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>String</code> - Ans1  

| Param | Type | Description |
| --- | --- | --- |
| signature | <code>String</code> | hex string |

<a name="module_utils.validateFields"></a>

### utils.validateFields(requestSchema) ⇒ <code>function</code>
takes a request schema object and returns a piece of express middleware that uses
'express-validator' to ensure the fields in the request body are valid

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>function</code> - validateFieldsMiddleware  

| Param | Type | Description |
| --- | --- | --- |
| requestSchema | <code>Object</code> | An request schema (see 'express-validator') |

<a name="module_utils.makeErrorCatcher"></a>

### utils.makeErrorCatcher(req, res) ⇒ <code>function</code>
takes a request and response object and returns a function that acts as an
error catcher in a promise chain

**Kind**: static method of <code>[utils](#module_utils)</code>  
**Returns**: <code>function</code> - errorHandler  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Express.Request</code> | An Express Request Object |
| res | <code>Express.Response</code> | An Express Response Object |

<a name="module_utils..hash"></a>

### utils~hash(byteBuffer, algorithm, outEncoding) ⇒ <code>String</code>
Returns a hash string based on the original byte buffer, algorith, and outEncoding

**Kind**: inner method of <code>[utils](#module_utils)</code>  
**Returns**: <code>String</code> - hash  

| Param | Type | Description |
| --- | --- | --- |
| byteBuffer | <code>Node.Byte</code> | byte buffer used for hashing |
| algorithm | <code>String</code> | algorithm used to hash (ex. 'sha256') |
| outEncoding | <code>String</code> | type of output (ex. 'hex') |

<a name="module_utils..PKCS1Pad"></a>

### utils~PKCS1Pad(hexDigest) ⇒ <code>String</code>
adds padding to a random hex string to output a PKCS #1 padded SHA1 sum (256-byte hex value)

**Kind**: inner method of <code>[utils](#module_utils)</code>  
**Returns**: <code>String</code> - sha1  

| Param | Type | Description |
| --- | --- | --- |
| hexDigest | <code>String</code> | hex string that will be padded |


