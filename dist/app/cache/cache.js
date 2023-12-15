"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCache = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const utils_1 = require("../../shared/utils/utils");
class FileCache {
    constructor(cacheDir) {
        this.cacheDir = cacheDir;
        (0, utils_1.createDir)(cacheDir);
    }
    set(key, value, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            const entry = {
                data: value,
                ttl: Date.now() + ttl * 1000,
            };
            const filePath = (0, utils_1.getFilePath)(this.cacheDir, key);
            try {
                yield fs.writeFile(filePath, JSON.stringify(entry));
            }
            catch (error) {
                console.error(`Error writing cache - ${key}: ${error.message}`);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, utils_1.getFilePath)(this.cacheDir, key);
            try {
                const entryData = yield fs.readFile(filePath, 'utf-8');
                const entry = JSON.parse(entryData);
                if (entry.ttl > Date.now()) {
                    return entry.data;
                }
                else {
                    yield this.delete(key);
                }
            }
            catch (error) {
                return null;
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = (0, utils_1.getFilePath)(this.cacheDir, key);
            try {
                yield fs.unlink(filePath);
            }
            catch (error) {
                console.error(`Error deleting cache - ${key}: ${error.message}`);
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield fs.readdir(this.cacheDir);
                const unlinkPromises = files.map(file => fs.unlink(path.join(this.cacheDir, file)));
                yield Promise.all(unlinkPromises);
            }
            catch (error) {
                console.error(`Error clearing cache: ${error.message}`);
            }
        });
    }
}
exports.FileCache = FileCache;
