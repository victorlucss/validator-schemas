# ValidatorSchemas

[![npm version](https://badge.fury.io/js/validator-schemas.svg)](https://badge.fury.io/js/validator-schemas)

ValidatorSchemas is a simple way to validate objects or jsons in Node.js.

## **Fork, change and PR**

Help me forking and improving the code, I promise that your pull request will be merged soon! :)


## Installation

It's very easy! 

```sh
npm install validator-schemas --save
```

And booom! You may have it in your node-modules. You can also clone this repo using:

```sh
git clone https://github.com/victorlucss/validator-schemas.git
```



## Usage

First of all you'll need to instantiate the validator

```javascript
const validator = require('validator-schemas')
```

After that you will need to build your own Schema. 

```javascript
const schema = {
    _name: "MyOwnSchema", 

    firstName: {
        type: "string",
        required: true
    }
}
```

After that you can run the validator in some object (or json parsed to object) and remember to use `try...catch` to catch every exception of validation!

```javascript
const data = {
    firstName: "Victor"
}

try {
    validator.validateSchemas(data, schema)
}catch(ex){
    console.error(ex)
}
```

## Supported types
* **string**
* **integer**
* **float**
* **boolean**
* **timestamp**
* **object** - requires *of* field, that recieves a schema
* **map** - requires *mapOf* field, that recieves a schema
* **list** - you can set the type by passing *listOf* field, that recieve another type (can be some of the listed)

## Non-listed entries

If you have some json with not maped keys, like the following...

```json
{
    "48": 150,
    "52": 32,
    "product": "Clothes"
}
```

Where the 48, 52 keys can be some other number, you'll need to validate that as non-listed entry. To do this you need to create a schema with `_otr` (abbreviation of "others"):

```javascript
const schema = {
    product: {
        type: "string"
    },

    _otr: {
        key: "[0-9]+",
        value: "integer" //You can use any of supported types.
    }
}

```

Now, your validation will cover every fields.