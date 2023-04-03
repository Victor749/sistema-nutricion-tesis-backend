const Joi = require('joi');

const solicitudSustitucionSchema = Joi.object({
    flexible: Joi.string()
        .valid('true', 'false')
        .required(),
})

const validarSolicitudSustitucion = async (solicitudSustitucion) => {
    try {
        await solicitudSustitucionSchema.validateAsync(solicitudSustitucion)
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
    validarSolicitudSustitucion
};
