"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageWithLessons = exports.getLevelWithPackages = exports.getAllLevels = void 0;
const level_model_1 = require("./level.model");
const package_model_1 = require("./package.model");
const lesson_model_1 = require("./lesson.model");
const getAllLevels = async () => {
    return level_model_1.Level.find().sort({ order: 1 });
};
exports.getAllLevels = getAllLevels;
const getLevelWithPackages = async (levelId) => {
    const level = await level_model_1.Level.findById(levelId);
    if (!level)
        throw new Error("Level not found");
    const packages = await package_model_1.Package.find({ levelId }).sort({ order: 1 });
    return { level, packages };
};
exports.getLevelWithPackages = getLevelWithPackages;
const getPackageWithLessons = async (packageId) => {
    const pack = await package_model_1.Package.findById(packageId);
    if (!pack)
        throw new Error("Package not found");
    const lessons = await lesson_model_1.Lesson.find({ packageId }).sort({ order: 1 });
    return { pack, lessons };
};
exports.getPackageWithLessons = getPackageWithLessons;
