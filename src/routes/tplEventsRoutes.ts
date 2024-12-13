import { FastifyInstance } from 'fastify';
import { TplEventsService } from '../services/tplEventsService';
import { TplEvent } from '../models/tpl_event';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/TplEvents';

export default function TplEventsRoutes(server: FastifyInstance, TplEventsService: TplEventsService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const tpl_events = request.body as TplEvent;
        const user = request.user as User;

        const tpl_events_saved = await TplEventsService.create(tpl_events);
        if (tpl_events_saved) {
            await new UserLogService({ user_id: user.id!, action: 'create tpl events with success.', origin: path, description: JSON.stringify(tpl_events_saved) }).log();
            return reply.status(201).send(tpl_events_saved);
        }
        await new UserLogService({ user_id: user.id!, action: 'create tpl events with fail.', origin: path }).log();
        return reply.status(502).send('Não foi possível salvar o Tpl (Eventos).');
    });

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const tpl_events = request.body as TplEvent;
        const { id } = request.params as any;
        const user = request.user as User;

        if (!id) return reply.status(400).send('O território informado não possui ID no GET.');

        const tpl_events_updated = await TplEventsService.update(id, tpl_events);
        if (tpl_events_updated) {
            await new UserLogService({ user_id: user.id!, action: 'update tpl events with success.', origin: path, description: JSON.stringify(tpl_events) }).log();
            return reply.status(204).send();
        }
        await new UserLogService({ user_id: user.id!, action: 'update tpl events with fail.', origin: path, description: `Failed to update tpl events with ID: ${id}` }).log();
        return reply.status(502).send(`Não foi possível atualizar o Tpl (Eventos) ${tpl_events?.id}.`);
    });

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;

        const hasDeleted = await TplEventsService.delete(id);
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: 'delete tpl events with success.', origin: path, description: `Deleted tpl events with ID: ${id}` }).log();
            return reply.status(200).send();
        }
        await new UserLogService({ user_id: user.id!, action: 'delete tpl events with fail.', origin: path, description: `Failed to delete tpl events with ID: ${id}` }).log();
        return reply.status(502).send();
    });

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const TplEvents = await TplEventsService.list(id);


            return reply.status(200).send(TplEvents);
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'get tpl events with fail.', origin: path }).log();
            return reply.status(500).send();
        }
    });

    server.post(`${path}/generate`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const tpl_events = request.body as { initial_date: Date, final_date: Date, event_id?: number };

            const TplEvents = await TplEventsService.generateEvents(tpl_events);
            const convertEventsToFront = await TplEventsService.convertEventsToFront(TplEvents);

            await new UserLogService({ user_id: user.id!, action: 'generate tpl events with success.', origin: path, description: `Generated tpl events from ${tpl_events.initial_date} to ${tpl_events.final_date}` }).log();
            return reply.status(200).send(convertEventsToFront);
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'generate tpl events with fail.', origin: path }).log();
            return reply.status(500).send();
        }
    });

    server.post(`${path}/getByDate`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;
        try {
            const tpl_events = request.body as { initial_date: Date, final_date: Date };
            const TplEvents = await TplEventsService.getEvents(tpl_events);
            const convertEventsToFront = await TplEventsService.convertEventsToFront(TplEvents);

            return reply.status(200).send(convertEventsToFront);
        } catch (err) {
            await new UserLogService({
                user_id: user.id!,
                action: 'get tpl events by date with fail.',
                origin: path
            }).log();

            return reply.status(500).send();
        }
    });
}
