import Joi from 'joi';

const timeRegexp = /\b([01]?[0-9]|2[0-3]):[0-5][0-9]\b/;

export const calendarSchema = Joi.object({
  note: Joi.string().required().messages({
    'any.required': `missing required note field`,
  }),
});
