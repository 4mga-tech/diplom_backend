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
  name: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(4).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().required(),
});

export const otpRequestSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
});

export const registerVerifyOtpSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(4).required(),
  code: Joi.string().trim().required(),
});

export const resetVerifyOtpSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  code: Joi.string().trim().required(),
  newPassword: Joi.string().min(4).required(),
});
