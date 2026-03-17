// import Joi from "joi";

// export const registerSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.email": "Email format буруу байна",
//     "any.required": "Email шаардлагатай",
//   }),

//   password: Joi.string().min(6).required().messages({
//     "string.min": "Password хамгийн багадаа 6 тэмдэгт байх ёстой",
//     "any.required": "Password шаардлагатай",
//   }),
// });

// export const loginSchema = Joi.object({
//   email: Joi.string().email().required(),

//   password: Joi.string().required(),
// });
import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});