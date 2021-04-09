const joi = require('joi')

const UserValidator = {
    registerValidator: data => {
        const validateSchema = joi.object({
            fullname: joi.string()
                .min(6)
                .required(),
            email: joi.string()
                .min(6)
                .required()
                .email(),
            password: joi.string()
                .min(6)
                .required() 
        })

        return validateSchema.validateAsync(data)
    },

    loginValidator: data => {
        const validateSchema = joi.object({
            fullname: joi.string()
                .min(6),
            email: joi.string()
                .min(6)
                .email(),
            password: joi.string()
                .min(6)
                .required()
        })

        return validateSchema.validateAsync(data)
    },

    updateValidator: data => {
        const validateSchema = joi.object({
            fullname: joi.string()
                .min(6),
            email: joi.string()
                .min(6)
                .email(),
            password: joi.string()
                .min(6)
        })
        return validateSchema.validateAsync(data)
    }
}

module.exports = UserValidator