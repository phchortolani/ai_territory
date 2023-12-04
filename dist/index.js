"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const territoryService_1 = require("./services/territoryService");
const leadersService_1 = require("./services/leadersService");
const leadersRoutes_1 = __importDefault(require("./routes/leadersRoutes"));
const territoryRoutes_1 = __importDefault(require("./routes/territoryRoutes"));
const roundsRoutes_1 = __importDefault(require("./routes/roundsRoutes"));
const roundsService_1 = require("./services/roundsService");
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
const campaignService_1 = require("./services/campaignService");
const statusTerritoryRoutes_1 = __importDefault(require("./routes/statusTerritoryRoutes"));
const statusTerritoryService_1 = require("./services/statusTerritoryService");
const server = (0, fastify_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3333;
(0, territoryRoutes_1.default)(server, new territoryService_1.TerritoryService());
(0, leadersRoutes_1.default)(server, new leadersService_1.LeadersService());
(0, roundsRoutes_1.default)(server, new roundsService_1.RoundsService());
(0, campaignRoutes_1.default)(server, new campaignService_1.CampaignService());
(0, statusTerritoryRoutes_1.default)(server, new statusTerritoryService_1.StatusTerritoryService());
server.listen({ port: Number(port) }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at http://localhost:${port}`);
});
