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
const path = '/statusTerritory';
function statusTerritoryRoutes(server, statusTerritoryService) {
    server.post(path, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const statusTerritory = request.body;
        const statusTerritory_saved = yield statusTerritoryService.create(statusTerritory);
        if (statusTerritory_saved)
            return reply.status(201).send(statusTerritory_saved);
        return reply.status(502).send(`Não foi possível salvar o status do território.`);
    }));
    server.put(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const statusTerritory = request.body;
        const { id } = request.params;
        if (!id)
            return reply.status(400).send('o status do território informado não possui ID no GET.');
        const statusTerritory_updated = yield statusTerritoryService.update(id, statusTerritory);
        if (statusTerritory_updated)
            return reply.status(204).send();
        return reply.status(502).send(`Não foi possível atualizar o status informado ${statusTerritory === null || statusTerritory === void 0 ? void 0 : statusTerritory.id}.`);
    }));
    server.delete(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { id } = request.params;
        const hasDeleted = yield statusTerritoryService.delete(id);
        if (hasDeleted)
            return reply.status(200).send();
        return reply.status(502).send();
    }));
    server.get(`${path}/:id?`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = request.params;
            const statusTerritory = yield statusTerritoryService.list(id);
            return reply.status(200).send(statusTerritory);
        }
        catch (err) {
            return reply.status(500).send();
        }
    }));
}
exports.default = statusTerritoryRoutes;
