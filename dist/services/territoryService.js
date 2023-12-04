"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryService = void 0;
const Database_1 = require("../database/Database");
class TerritoryService extends Database_1.Database {
    constructor() {
        super({ options: { table: 'territories' } });
    }
}
exports.TerritoryService = TerritoryService;
