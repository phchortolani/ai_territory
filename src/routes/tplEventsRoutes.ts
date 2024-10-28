import { FastifyInstance } from 'fastify';
import { TplEventsService } from '../services/tplEventsService';
import { TplEvent } from '../models/tpl_event';

const path = '/TplEvents'

export default function TplEventsRoutes(server: FastifyInstance, TplEventsService: TplEventsService) {
    server.post(path, async (request, reply) => {
        const tpl_events = request.body as TplEvent
        const tpl_events_saved = await TplEventsService.create(tpl_events)
        if (tpl_events_saved) return reply.status(201).send(tpl_events_saved)
        return reply.status(502).send(`Não foi possível salvar o Tpl (Eventos).`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        const tpl_events = request.body as TplEvent
        const { id } = request.params as any
        if (!id) return reply.status(400).send('O território informado não possui ID no GET.')

        const tpl_events_updated = await TplEventsService.update(id, tpl_events)
        if (tpl_events_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar o Tpl (Eventos) ${tpl_events?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        const { id } = request.params as any;
        const hasDeleted = await TplEventsService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        try {
            const { id } = request.params as any;
            const TplEvents = await TplEventsService.list(id);
            const convertEventsToFront = await TplEventsService.convertEventsToFront(TplEvents)
            return reply.status(200).send(convertEventsToFront)
        } catch (err) {
            return reply.status(500).send()
        }

    })

    server.post(`${path}/generate`, async (request, reply) => {
        try {
            const tpl_events = request.body as { initial_date: Date, final_date: Date }

            const TplEvents = await TplEventsService.generateEvents(tpl_events)
            const convertEventsToFront = await TplEventsService.convertEventsToFront(TplEvents)
            return reply.status(200).send(convertEventsToFront)
        } catch (err) {
            return reply.status(500).send()
        }

    })
    server.post(`${path}/getByDate`, async (request, reply) => {
        try {
            const tpl_events = request.body as { initial_date: Date, final_date: Date }
            const TplEvents = await TplEventsService.getEvents(tpl_events)
            const convertEventsToFront = await TplEventsService.convertEventsToFront(TplEvents)
            
            return reply.status(200).send(convertEventsToFront)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}