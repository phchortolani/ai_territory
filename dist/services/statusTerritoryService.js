"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusTerritoryService = void 0;
const Database_1 = require("../database/Database");
class StatusTerritoryService extends Database_1.Database {
    constructor() {
        super({ options: { table: 'status_territory' } });
    }
}
exports.StatusTerritoryService = StatusTerritoryService;
