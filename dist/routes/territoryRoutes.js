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
const path = '/territory';
function TerritoryRoutes(server, territoryService) {
    server.post(path, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const territory = request.body;
        const territory_saved = yield territoryService.create(territory);
        if (territory_saved)
            return reply.status(201).send(territory_saved);
        return reply.status(502).send(`Não foi possível salvar o território.`);
    }));
    server.put(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const territory = request.body;
        const { id } = request.params;
        if (!id)
            return reply.status(400).send('O território informado não possui ID no GET.');
        const territory_updated = yield territoryService.update(id, territory);
        if (territory_updated)
            return reply.status(204).send();
        return reply.status(502).send(`Não foi possível atualizar o território ${territory === null || territory === void 0 ? void 0 : territory.id}.`);
    }));
    server.delete(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { id } = request.params;
        const hasDeleted = yield territoryService.delete(id);
        if (hasDeleted)
            return reply.status(200).send();
        return reply.status(502).send();
    }));
    server.get(`${path}/:id?`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = request.params;
            const territorys = yield territoryService.list(id);
            return reply.status(200).send(territorys);
        }
        catch (err) {
            return reply.status(500).send();
        }
    }));
}
exports.default = TerritoryRoutes;
