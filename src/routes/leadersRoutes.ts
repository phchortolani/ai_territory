import { FastifyInstance } from 'fastify';
import { Leaders } from '../models/leaders';
import { LeadersService } from '../services/leadersService';

const path = '/leaders'

export default function LeadersRoutes(server: FastifyInstance, leaderService: LeadersService) {
    server.post(path, async (request, reply) => {
        const leader = request.body as Leaders
        const leader_saved = await leaderService.create(leader)
        if (leader_saved) return reply.status(201).send(leader_saved)
        return reply.status(502).send(`Não foi possível salvar o dirigente.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        const leader = request.body as Leaders
        const { id } = request.params as any
        if (!id) return reply.status(400).send('O território informado não possui ID no GET.')

        const leader_updated = await leaderService.update(id, leader)
        if (leader_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar o dirigente ${leader?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        const { id } = request.params as any;
        const hasDeleted = await leaderService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        try {
            const { id } = request.params as any;
            const leaders = await leaderService.list(id);
            return reply.status(200).send(leaders)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}