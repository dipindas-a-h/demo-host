const Joi = require("joi");

const boardTypeSchema = Joi.object({
    boardName: Joi.string().required(),
    boardShortName: Joi.string().required(),
});

module.exports = { boardTypeSchema };
