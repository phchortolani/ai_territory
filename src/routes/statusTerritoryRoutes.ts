import { FastifyInstance } from 'fastify';
import { StatusTerritory } from '../models/status_territory';
import { StatusTerritoryService } from '../services/statusTerritoryService';

const path = '/statusTerritory'

export default function statusTerritoryRoutes(server: FastifyInstance, statusTerritoryService: StatusTerritoryService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const statusTerritory = request.body as StatusTerritory
        const statusTerritory_saved = await statusTerritoryService.create(statusTerritory)
        if (statusTerritory_saved) return reply.status(201).send(statusTerritory_saved)
        return reply.status(502).send(`Não foi possível salvar o status do território.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const statusTerritory = request.body as StatusTerritory
        const { id } = request.params as any
        if (!id) return reply.status(400).send('o status do território informado não possui ID no GET.')

        const statusTerritory_updated = await statusTerritoryService.update(id, statusTerritory)
        if (statusTerritory_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar o status informado ${statusTerritory?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const hasDeleted = await statusTerritoryService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { id } = request.params as any;
            const statusTerritory = await statusTerritoryService.list(id);
            return reply.status(200).send(statusTerritory)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}