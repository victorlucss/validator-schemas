const validate = {
    isString: (val) => typeof val === 'string',
    isInteger: (val) => Number.isInteger(val),
    isFloat: (val) => Number(val) % 1 !== 0 || Number.isInteger(val),
    isBoolean: (val) => typeof val === 'boolean',
    isTimestamp : (val) => val >= 0 && val < Date.now(),
    isObject: (val) => typeof val === 'object',
    hasProp: (obj, prop) => obj.hasOwnProperty(prop),
    isValid: (val) => val !== null && val !== undefined,
    isArray: (val) => Array.isArray(val)
}

module.exports = validate;