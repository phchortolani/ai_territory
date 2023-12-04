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
const path = '/rounds';
function RoundsRoutes(server, RoundsService) {
    server.post(path, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const round = request.body;
        const round_saved = yield RoundsService.create(round);
        if (round_saved)
            return reply.status(201).send(round_saved);
        return reply.status(502).send(`Não foi possível salvar a rodada.`);
    }));
    server.put(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const round = request.body;
        const { id } = request.params;
        if (!id)
            return reply.status(400).send('A rodada informada não possui ID no GET.');
        const round_updated = yield RoundsService.update(id, round);
        if (round_updated)
            return reply.status(204).send();
        return reply.status(502).send(`Não foi possível atualizar a rodada ${round === null || round === void 0 ? void 0 : round.id}.`);
    }));
    server.delete(`${path}/:id`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        const { id } = request.params;
        const hasDeleted = yield RoundsService.delete(id);
        if (hasDeleted)
            return reply.status(200).send();
        return reply.status(502).send();
    }));
    server.get(`${path}/:id?`, (request, reply) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = request.params;
            const rounds = yield RoundsService.list(id);
            return reply.status(200).send(rounds);
        }
        catch (err) {
            return reply.status(500).send();
        }
    }));
}
exports.default = RoundsRoutes;
