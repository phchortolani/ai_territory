"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundsService = void 0;
const Database_1 = require("../database/Database");
class RoundsService extends Database_1.Database {
    constructor() {
        super({ options: { table: 'rounds' } });
    }
}
exports.RoundsService = RoundsService;
