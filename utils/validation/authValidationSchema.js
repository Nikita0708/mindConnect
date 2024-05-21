import Joi from 'joi';

const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const numberRegexp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

export const userSignupSchema = Joi.object({
  firstName: Joi.string().max(20).required().messages({
    'string.base': `"firstName" should be a type of 'text'`,
    'string.empty': `"firstName" cannot be an empty field`,
    'string.max': `"firstName" should have a maximum length of 20`,
    'any.required': `"firstName" is a required field.`,
  }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': `"email" must be a string.`,
    'string.empty': `"email" must not be empty.`,
    'string.pattern.base': `"email" must be in format example@gmail.com.`,
    'any.required': `"email" is a required field.`,
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': `"password" must be a string.`,
    'string.empty': `"password" must not be empty.`,
    'string.min': `"username" should have a maximum length of 6`,
    'any.required': `"password" is a required field.`,
  }),
  number: Joi.string().pattern(numberRegexp).messages({
    'string.base': `"number" must be a string.`,
    'string.empty': `"number" must not be empty.`,
    'string.pattern.base': `"number" must be in format +38(095)1231234.`,
  }),
});

export const userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    'string.base': `"email" must be a string.`,
    'string.empty': `"email" must not be empty.`,
    'string.pattern.base': `"email" must be in format example@gmail.com.`,
    'any.required': `"email" is a required field.`,
  }),
  password: Joi.string().min(6).required().messages({
    'string.base': `"password" must be a string.`,
    'string.empty': `"password" must not be empty.`,
    'string.min': `"username" should have a maximum length of 6`,
    'any.required': `"password" is a required field.`,
  }),
});

export const userInfoSchema = Joi.object({
  firstName: Joi.string().max(20).messages({
    'string.base': `"name" should be a type of 'text'`,
    'string.empty': `"name" cannot be an empty field`,
    'string.max': `"name" should have a maximum length of 20`,
  }),
  lastName: Joi.string().max(20).messages({
    'string.base': `"lastName" should be a type of 'text'`,
    'string.empty': `"lastName" cannot be an empty field`,
    'string.max': `"lastName" should have a maximum length of 20`,
  }),
  number: Joi.string().pattern(numberRegexp).messages({
    'string.base': `"number" must be a string.`,
    'string.empty': `"number" must not be empty.`,
    'string.pattern.base': `"number" must be in format +38(095)1231234.`,
  }),
  image: Joi.binary(),
});
