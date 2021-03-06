'use strict';

const {DEFAULT_ACCEPTED_TYPES, DEFAULT_ENTRIES, DEFAULT_REQUIRED_VALUE, DEFAULT_MIN_LENGTH,DEFAULT_NOT_EMPTY_VALUE} = require('./default_values')
const {ValidationError} = require('./common')
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
        if(!validate.isValid(schema['_otr'])) throw new ValidationError(`Campos ${intersectDataSchema} não conhecidos no Schema!`);
        else {

            let _otrSchema = schema['_otr'];

            if(!validate.isValid(_otrSchema['key'])) throw new ValidationError(`Campo key obrigatório para campos indefinidos (_otr)!`);
            if(!validate.isValid(_otrSchema['value'])) throw new ValidationError(`Campo value obrigatório para campos indefinidos (_otr)!`);
            if(!validate.isObject(_otrSchema['value'])) throw new ValidationError(`Campo value (_otr) deve ser do tipo object!`);
            
            let validatorOtrKey = new RegExp(_otrSchema['key']);
            let findIncorrectKeys = intersectDataSchema.filter(field => !validatorOtrKey.test(field))
            
            if(findIncorrectKeys.length > 0) throw new ValidationError(`Campos ${intersectDataSchema} não conhecidos no Schema!`);

            intersectDataSchema.map((intersectDataSchemaValue) => {
                let dataOtrValue = data[intersectDataSchemaValue];

                
                validateSchema(dataOtrValue, _otrSchema['value']);
            })


        }
        // OUTROS NÃO CONHECIDOS NO SCHEMA
    }
    
    Object.entries(schema).map(([key, value]) => {
        if(!DEFAULT_ENTRIES.includes(key)){

            if(validate.isObject(value)){

                let type = value['type'];
                let typeValidatorsFun = VALIDATORS[type];
                let dataValue = data[key];                

                if(!validate.isValid(type)) throw new ValidationError(`É obrigatório informar o tipo de dado de ${key}. Utilize a diretiva "type" com algum dos seguintes tipos: ${DEFAULT_ACCEPTED_TYPES}`);
                if(!DEFAULT_ACCEPTED_TYPES.includes(type)) throw new ValidationError(`Tipo ${type} não suportado! Tente alguns dos seguintes: ${DEFAULT_ACCEPTED_TYPES}`);

                let required = DEFAULT_REQUIRED_VALUE,
                    notEmpty = DEFAULT_NOT_EMPTY_VALUE;

                if(validate.isValid(value['required'])) required = value['required']
                if(validate.isValid(value['notEmpty'])) notEmpty = value['notEmpty']
                
                if(!validate.isValid(dataValue) && required) throw new ValidationError(`Campo ${key} obrigatório!` );
                if(dataValue === "" && notEmpty) throw new ValidationError(`Campo ${key} não pode ser vazio ("")!` );
                if(validate.isValid(dataValue) && !typeValidatorsFun(dataValue)) throw new ValidationError(`Campo ${key} deve ser do tipo ${type}!`);
                
                if(type === 'map'){
                    if(!validate.isValid(value['mapOf'])) throw new ValidationError(`Campo mapOf obrigatório para tipo map!`);

                    let mapOfSchema = value['mapOf'];
                    if(validate.isValid(dataValue)){
                        Object.entries(dataValue).map(([dataValueKey, dataValueIterator]) => {
                            if(validate.isObject(dataValueIterator)) validateSchema(dataValueIterator, mapOfSchema);
                            else{
                                let validateMapValue = VALIDATORS[mapOfSchema] 
                                if(!validateMapValue(dataValueIterator)) throw new ValidationError(`O campo ${dataValueKey} em ${key} deve ser do tipo ${mapOfSchema}!`);
                            }
                        })
                    }
                }

                if(type === 'object'){
                    if(!validate.isValid(value['of'])) throw new ValidationError(`Campo of obrigatório para tipo object!`);
                    
                    let ofSchema = value['of'];


                    if(validate.isValid(data[key])) validateSchema(data[key], ofSchema)
                }

                if(type === 'list'){


                    //TODO: Vaidar listOf undefined -> fazer com que possa tipar a lista!

                    let minLengh = DEFAULT_MIN_LENGTH;
                    
                    if(validate.isValid(value['min'])) minLengh = value['min']
                    if(dataValue.length < minLengh) throw new ValidationError(`A quantidade de dados mínimos para a lista ${key} é ${minLengh}`);

                    if(validate.isValid(value['listOf'])){

                        let listSchema = value['listOf'];
                        
                        Array.from(dataValue).map((dataValueIterator, dataValueKey) => {

                            if(!validate.isObject(dataValueIterator)) throw new ValidationError(`Campos em ${key} devem ser do tipo objeto!`);
                            validateSchema(dataValueIterator, listSchema)
                        })
                        
                    }

                }

            }else throw new ValidationError(`Campo ${type} desconhecido para estruturação de Schemas!`);

        }
    })
};

module.exports = validateSchema;