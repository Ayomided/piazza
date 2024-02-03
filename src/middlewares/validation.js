const joi = require('joi')

const registerValidation = (data) => {
    const schemaValidation = joi.object({
        username: joi.string().alphanum().required().min(3).max(256),
        email: joi.string().required().min(6).max(256).email({ minDomainSegments: 2 }),
        password: joi.string().required().min(8).max(1024)
    })
    return schemaValidation.validate(data)
}

const loginValidation = (data) => {
    const schemaValidation = joi.object({
        username: joi.string().required().min(6).max(256),
        password: joi.string().required().min(8).max(1024)
    })
    return schemaValidation.validate(data)
}

module.exports = { registerValidation, loginValidation }