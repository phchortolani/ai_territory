import { FastifyInstance } from 'fastify';
import { TplDayTime } from '../models/tpl_day_time';
import { TplDayTimeService } from '../services/tplDayTimeService';


const path = '/TplDayTime'

export default function TplDayTimeRoutes(server: FastifyInstance, tplDayTimeService: TplDayTimeService) {

    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const leader = request.body as TplDayTime
        const leader_saved = await tplDayTimeService.create(leader)
        if (leader_saved) return reply.status(201).send(leader_saved)
        return reply.status(502).send(`Não foi possível salvar o Tpl (Horários).`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const leader = request.body as TplDayTime
        const { id } = request.params as any
        if (!id) return reply.status(400).send('O território informado não possui ID no GET.')

        const leader_updated = await tplDayTimeService.update(id, leader)
        if (leader_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar o Tpl (Horários) ${leader?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const hasDeleted = await tplDayTimeService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { id } = request.params as any;
            const TplDayTime = await tplDayTimeService.list(id);
            return reply.status(200).send(TplDayTime)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}