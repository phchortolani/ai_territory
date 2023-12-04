import { FastifyInstance } from 'fastify';
import { RoundsService } from '../services/roundsService';
import { Rounds } from '../models/rounds';

const path = '/rounds'

export default function RoundsRoutes(server: FastifyInstance, RoundsService: RoundsService) {
    server.post(path, async (request, reply) => {
        const round = request.body as Rounds
        const round_saved = await RoundsService.create(round)
        if (round_saved) return reply.status(201).send(round_saved)
        return reply.status(502).send(`Não foi possível salvar a rodada.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        const round = request.body as Rounds
        const { id } = request.params as any
        if (!id) return reply.status(400).send('A rodada informada não possui ID no GET.')

        const round_updated = await RoundsService.update(id, round)
        if (round_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar a rodada ${round?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        const { id } = request.params as any;
        const hasDeleted = await RoundsService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        try {
            const { id } = request.params as any;
            const rounds = await RoundsService.list(id);
            return reply.status(200).send(rounds)
        } catch (err) {
            return reply.status(500).send()
        }

    })

    server.post(`${path}/markasdone/:leader_id`, async (request, reply) => {
        try {
            const { leader_id } = request.params as any
            if (!leader_id) return reply.status(400).send('Para atualizar a rodada é necessário informar o leader_id no URI')
            const body = request.body as {
                MarkAsDone?: number[] | undefined
            }
            if (!body?.MarkAsDone) return reply.status(400).send('Para atualizar a rodada é necessário informar o array de numeros na propriedade "MarkAsDone"')
            const MarkedAsDoneResult = await RoundsService.MarkAsDone(body.MarkAsDone, leader_id);

            if (MarkedAsDoneResult) return reply.status(204).send()
            return reply.status(502).send(`Não foi possível atualizar a rodada.`)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}