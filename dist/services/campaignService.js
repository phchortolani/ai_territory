"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const Database_1 = require("../database/Database");
class CampaignService extends Database_1.Database {
    constructor() {
        super({ options: { table: 'campaign' } });
    }
}
exports.CampaignService = CampaignService;
