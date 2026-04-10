"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error(err);
    const status = err?.statusCode ?? 500;
    const message = err?.message ?? "Internal Server Error";
    res.status(status).json({ ok: false, message });
}
