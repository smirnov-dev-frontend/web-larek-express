import { celebrate, Joi, Segments } from 'celebrate';

export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().required().min(2).max(30)
      .messages({
        'any.required': 'Поле "title" должно быть заполнено',
        'string.empty': 'Поле "title" должно быть заполнено',
        'string.min': 'Минимальная длина поля "title" - 2',
        'string.max': 'Максимальная длина поля "title" - 30',
      }),
    image: Joi.object().keys({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required()
      .messages({
        'any.required': 'Поле "image" должно быть заполнено',
      }),
    category: Joi.string().required()
      .messages({
        'any.required': 'Поле "category" должно быть заполнено',
        'string.empty': 'Поле "category" должно быть заполнено',
      }),
    description: Joi.string().allow(''),
    price: Joi.number().min(0).allow(null),
  }),
});

export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    payment: Joi.string().required().valid('card', 'online')
      .messages({
        'any.required': 'Поле "payment" должно быть заполнено',
        'any.only': 'Поле "payment" должно быть равно "card" или "online"',
      }),
    email: Joi.string().required().email()
      .messages({
        'any.required': 'Поле "email" должно быть заполнено',
        'string.email': 'Поле "email" должно быть валидным email-адресом',
      }),
    phone: Joi.string().required()
      .messages({
        'any.required': 'Поле "phone" должно быть заполнено',
        'string.empty': 'Поле "phone" должно быть заполнено',
      }),
    address: Joi.string().required()
      .messages({
        'any.required': 'Поле "address" должно быть заполнено',
        'string.empty': 'Поле "address" должно быть заполнено',
      }),
    total: Joi.number().required().min(0)
      .messages({
        'any.required': 'Поле "total" должно быть заполнено',
      }),
    items: Joi.array().required().min(1)
      .items(Joi.string().hex().length(24)
        .messages({
          'string.hex': 'Поле "items" должно содержать корректные id товаров',
          'string.length': 'Поле "items" должно содержать корректные id товаров',
        }))
      .messages({
        'any.required': 'Поле "items" должно быть заполнено',
        'array.min': 'Поле "items" должно содержать хотя бы один товар',
      }),
  }),
});

const emailSchema = Joi.string().required().email()
  .messages({
    'any.required': 'Поле "email" должно быть заполнено',
    'string.empty': 'Поле "email" должно быть заполнено',
    'string.email': 'Поле "email" должно быть валидным email-адресом',
  });

export const validateRegisterBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().min(2).max(30)
      .messages({
        'string.min': 'Минимальная длина поля "name" - 2',
        'string.max': 'Максимальная длина поля "name" - 30',
      }),
    email: emailSchema,
    password: Joi.string().required().min(6)
      .messages({
        'any.required': 'Поле "password" должно быть заполнено',
        'string.empty': 'Поле "password" должно быть заполнено',
        'string.min': 'Минимальная длина поля "password" - 6',
      }),
  }),
});

export const validateLoginBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: emailSchema,
    password: Joi.string().required()
      .messages({
        'any.required': 'Поле "password" должно быть заполнено',
        'string.empty': 'Поле "password" должно быть заполнено',
      }),
  }),
});
