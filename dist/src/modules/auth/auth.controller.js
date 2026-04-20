"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetVerifyOtp = exports.resetRequestOtp = exports.registerVerifyOtp = exports.registerRequestOtp = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
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
        res.status(400).json({ message: error.message });
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
        res.status(400).json({ message: error.message });
    }
};
exports.login = login;
const registerRequestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }
        const result = await (0, auth_service_1.requestRegisterOtp)(email);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.registerRequestOtp = registerRequestOtp;
const registerVerifyOtp = async (req, res) => {
    try {
        const { name, email, password, code } = req.body;
        if (!name || !email || !password || !code) {
            return res.status(400).json({
                message: "Name, email, password and code are required",
            });
        }
        const result = await (0, auth_service_1.verifyRegisterOtp)(name, email, password, code);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.registerVerifyOtp = registerVerifyOtp;
const resetRequestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email required" });
        }
        const result = await (0, auth_service_1.requestResetOtp)(email);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetRequestOtp = resetRequestOtp;
const resetVerifyOtp = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({
                message: "Email, code and newPassword are required",
            });
        }
        const result = await (0, auth_service_1.verifyResetOtp)(email, code, newPassword);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetVerifyOtp = resetVerifyOtp;
