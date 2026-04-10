"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
mongoose_1.default.connect(env_1.env.MONGODB_URI).then(() => {
    console.log("MongoDB connected");
    app_1.default.listen(env_1.env.PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${env_1.env.PORT}`);
    });
});
