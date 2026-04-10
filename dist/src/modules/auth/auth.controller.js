"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.login = exports.register = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const auth_service_2 = require("./auth.service");
const register = async (req, res) => {
    try {
        console.log("REGISTER BODY:", req.body);
        console.log("schema:", auth_validation_1.registerSchema);
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
const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }
        const result = await (0, auth_service_2.resetPasswordService)(email, password);
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
