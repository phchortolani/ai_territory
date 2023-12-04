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
const path = '/leaders';
function LeadersRoutes(server, leaderService) {
    server.post(path, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const leader = request.body;
        const leader_saved = yield leaderService.create(leader);
        if (leader_saved)
            return reply.status(201).send(leader_saved);
        return reply.status(502).send(`Não foi possível salvar o dirigente.`);
    }));
    server.put(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const leader = request.body;
        const { id } = request.params;
        if (!id)
            return reply.status(400).send('O território informado não possui ID no GET.');
        const leader_updated = yield leaderService.update(id, leader);
        if (leader_updated)
            return reply.status(204).send();
        return reply.status(502).send(`Não foi possível atualizar o dirigente ${leader === null || leader === void 0 ? void 0 : leader.id}.`);
    }));
    server.delete(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { id } = request.params;
        const hasDeleted = yield leaderService.delete(id);
        if (hasDeleted)
            return reply.status(200).send();
        return reply.status(502).send();
    }));
    server.get(`${path}/:id?`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = request.params;
            const leaders = yield leaderService.list(id);
            return reply.status(200).send(leaders);
        }
        catch (err) {
            return reply.status(500).send();
        }
    }));
}
exports.default = LeadersRoutes;
