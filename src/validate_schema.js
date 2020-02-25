'use strict';

const {DEFAULT_ACCEPTED_TYPES, DEFAULT_ENTRIES, DEFAULT_REQUIRED_VALUE, DEFAULT_MIN_LENGTH} = require('./default_values')
const validate = require('./validate');
const VALIDATORS = {
    'string': validate.isString,
    'integer': validate.isInteger,
    'float': validate.isFloat,
    'boolean': validate.isBoolean,
    'timestamp': validate.isTimestamp,
    'map': validate.isObject,
    'list': validate.isArray,
    'object': validate.isObject
}

function validateSchema(data, schema){


    let fieldsInData = Object.keys(data);
    let fieldsInSchema = Object.keys(schema);

    let intersectDataSchema = fieldsInData.filter(field => !fieldsInSchema.includes(field))

    if(intersectDataSchema.length > 0){
        if(!validate.isValid(schema['_otr'])) throw `Campos ${intersectDataSchema} não conhecidos no Schema!`;
        else {

            let _otrSchema = schema['_otr'];

            if(!validate.isValid(_otrSchema['key'])) throw `Campo key obrigatório para campos indefinidos (_otr)!`;
            if(!validate.isValid(_otrSchema['value'])) throw `Campo value obrigatório para campos indefinidos (_otr)!`;
            if(!validate.isObject(_otrSchema['value'])) throw `Campo value (_otr) deve ser do tipo object!`;
            
            let validatorOtrKey = new RegExp(_otrSchema['key']);
            let findIncorrectKeys = intersectDataSchema.filter(field => !validatorOtrKey.test(field))
            
            if(findIncorrectKeys.length > 0) throw `Campos ${intersectDataSchema} não conhecidos no Schema!`;

            intersectDataSchema.map((intersectDataSchemaValue) => {
                let dataOtrValue = data[intersectDataSchemaValue];

                
                validateSchema(dataOtrValue, _otrSchema['value']);
            })


        }
        // OUTROS NÃO CONHECIDOS NO SCHEMA
    }
    

    
    
    // fieldsInData.map((fieldValue, fieldKey) => {
    //     if(validate.isValid(schema['_otr'])){

    //     }
        
    //     if(!validate.isValid(schema[fieldValue])) throw `Campo ${fieldValue} não conhecido no Schema!`;
    // })
    Object.entries(schema).map(([key, value]) => {
        if(!DEFAULT_ENTRIES.includes(key)){

            if(validate.isObject(value)){

                let type = value['type'];
                let typeValidatorsFun = VALIDATORS[type];
                let dataValue = data[key];                

                if(!validate.isValid(type)) throw `É obrigatório informar o tipo de dado de ${key}. Utilize a diretiva "type" com algum dos seguintes tipos: ${DEFAULT_ACCEPTED_TYPES}`;
                if(!DEFAULT_ACCEPTED_TYPES.includes(type)) throw `Tipo ${type} não suportado! Tente alguns dos seguintes: ${DEFAULT_ACCEPTED_TYPES}`;

                let required = DEFAULT_REQUIRED_VALUE;

                if(validate.isValid(value['required'])) required = value['required']
                
                if(!validate.isValid(dataValue) && required) throw `Campo ${key} obrigatório!` 
                if(validate.isValid(dataValue) && !typeValidatorsFun(dataValue)) throw `Campo ${key} deve ser do tipo ${type}!`
                
                if(type === 'map'){
                    if(!validate.isValid(value['mapOf'])) throw `Campo mapOf obrigatório para tipo map!`;
                    // if(required && !validate.isValid(dataValue)) throw `Campo `;

                    let mapOfSchema = value['mapOf'];
                    if(validate.isValid(dataValue)){
                        Object.entries(dataValue).map(([dataValueKey, dataValueIterator]) => {
                            if(validate.isObject(dataValueIterator)) validateSchema(dataValueIterator, mapOfSchema);
                            else{
                                let validateMapValue = VALIDATORS[mapOfSchema] 
                                if(!validateMapValue(dataValueIterator)) throw `O campo ${dataValueKey} em ${key} deve ser do tipo ${mapOfSchema}!`
                            }
                        })
                    }
                }

                if(type === 'object'){
                    if(!validate.isValid(value['of'])) throw `Campo of obrigatório para tipo object!`;
                    
                    let ofSchema = value['of'];


                    if(validate.isValid(data[key])) validateSchema(data[key], ofSchema)
                }

                if(type === 'list'){


                    //TODO: Vaidar listOf undefined -> fazer com que possa tipar a lista!

                    let minLengh = DEFAULT_MIN_LENGTH;
                    
                    if(validate.isValid(value['min'])) minLengh = value['min']
                    if(dataValue.length < minLengh) throw `A quantidade de dados mínimos para a lista ${key} é ${minLengh}`;

                    if(validate.isValid(value['listOf'])){

                        let listSchema = value['listOf'];
                        
                        Array.from(dataValue).map((dataValueIterator, dataValueKey) => {

                            if(!validate.isObject(dataValueIterator)) throw `Campos em ${key} devem ser do tipo objeto!`;
                            validateSchema(dataValueIterator, listSchema)
                        })
                        
                    }

                }

            }else throw `Campo ${type} desconhecido para estruturação de Schemas!`

        }
    })
};

module.exports = validateSchema;