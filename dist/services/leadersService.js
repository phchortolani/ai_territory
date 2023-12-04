"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadersService = void 0;
const Database_1 = require("../database/Database");
class LeadersService extends Database_1.Database {
    constructor() {
        super({ options: { table: 'leaders' } });
    }
}
exports.LeadersService = LeadersService;
