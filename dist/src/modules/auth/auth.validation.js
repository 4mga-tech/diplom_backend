"use strict";
// import Joi from "joi";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
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
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(4).required(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
