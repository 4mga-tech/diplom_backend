"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetVerifyOtp = exports.resetRequestOtp = exports.registerVerifyOtp = exports.registerRequestOtp = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const sendError = (res, error) => {
    const status = error?.statusCode ?? 400;
    const message = error?.message ?? "Request failed";
    return res.status(status).json({ message });
};
const register = async (req, res) => {
    try {
        const { error } = auth_validation_1.registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const { name, email, password } = req.body;
        const result = await (0, auth_service_1.registerUser)(name, email, password);
        res.status(201).json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { error } = auth_validation_1.loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const { email, password } = req.body;
        const result = await (0, auth_service_1.loginUser)(email, password);
        res.json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.login = login;
const registerRequestOtp = async (req, res) => {
    try {
        const { error, value } = auth_validation_1.otpRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const result = await (0, auth_service_1.requestRegisterOtp)(value.email);
        res.json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.registerRequestOtp = registerRequestOtp;
const registerVerifyOtp = async (req, res) => {
    try {
        const { error, value } = auth_validation_1.registerVerifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const result = await (0, auth_service_1.verifyRegisterOtp)(value.name, value.email, value.password, value.code);
        res.json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.registerVerifyOtp = registerVerifyOtp;
const resetRequestOtp = async (req, res) => {
    try {
        const { error, value } = auth_validation_1.otpRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const result = await (0, auth_service_1.requestResetOtp)(value.email);
        res.json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.resetRequestOtp = resetRequestOtp;
const resetVerifyOtp = async (req, res) => {
    try {
        const { error, value } = auth_validation_1.resetVerifyOtpSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message: error.details[0].message,
            });
        }
        const result = await (0, auth_service_1.verifyResetOtp)(value.email, value.code, value.newPassword);
        res.json(result);
    }
    catch (error) {
        return sendError(res, error);
    }
};
exports.resetVerifyOtp = resetVerifyOtp;
