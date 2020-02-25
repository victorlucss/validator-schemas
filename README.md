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