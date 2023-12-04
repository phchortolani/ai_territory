"use strict";
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
const path = '/campaign';
function CampaignRoutes(server, campaignService) {
    server.post(path, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const campaign = request.body;
        const campaign_saved = yield campaignService.create(campaign);
        if (campaign_saved)
            return reply.status(201).send(campaign_saved);
        return reply.status(502).send(`Não foi possível salvar a campanha.`);
    }));
    server.put(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const campaign = request.body;
        const { id } = request.params;
        if (!id)
            return reply.status(400).send('A campanha informada não possui ID no GET.');
        const campaign_updated = yield campaignService.update(id, campaign);
        if (campaign_updated)
            return reply.status(204).send();
        return reply.status(502).send(`Não foi possível atualizar a campanha ${campaign === null || campaign === void 0 ? void 0 : campaign.id}.`);
    }));
    server.delete(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { id } = request.params;
        const hasDeleted = yield campaignService.delete(id);
        if (hasDeleted)
            return reply.status(200).send();
        return reply.status(502).send();
    }));
    server.get(`${path}/:id?`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = request.params;
            const campaign = yield campaignService.list(id);
            return reply.status(200).send(campaign);
        }
        catch (err) {
            return reply.status(500).send();
        }
    }));
}
exports.default = CampaignRoutes;
