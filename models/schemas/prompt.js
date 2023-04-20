const Joi = require('joi');

const promptSchema = Joi.object({
    pregunta: Joi.string()
        .required(),
})

const validarPrompt = async (prompt) => {
    try {
        await promptSchema.validateAsync(prompt)
        return json = {
            valido: true
        }
    }
    catch (err) { 
        return json = {
            valido: false,
            error: err
        }
    }
}

module.exports = {
    validarPrompt
};
