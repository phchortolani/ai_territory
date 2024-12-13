import { FastifyInstance } from 'fastify';
import { TplDayTime } from '../models/tpl_day_time';
import { TplDayTimeService } from '../services/tplDayTimeService';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/TplDayTime';

export default function TplDayTimeRoutes(server: FastifyInstance, tplDayTimeService: TplDayTimeService) {

    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const tplDayTime = request.body as TplDayTime;
        const user = request.user as User;

        const tplDayTime_saved = await tplDayTimeService.create(tplDayTime);
        if (tplDayTime_saved) {
            await new UserLogService({ user_id: user.id!, action: 'create tplDayTime with success.', origin: path, description: JSON.stringify(tplDayTime_saved) }).log();
            return reply.status(201).send(tplDayTime_saved);
        }
        await new UserLogService({ user_id: user.id!, action: 'create tplDayTime with fail.', origin: path }).log();
        return reply.status(502).send(`Não foi possível salvar o Tpl (Horários).`);
    });

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const tplDayTime = request.body as TplDayTime;
        const { id } = request.params as any;
        const user = request.user as User;

        if (!id) return reply.status(400).send('O território informado não possui ID no GET.');

        const tplDayTime_updated = await tplDayTimeService.update(id, tplDayTime);
        if (tplDayTime_updated) {
            await new UserLogService({ user_id: user.id!, action: 'update tplDayTime with success.', origin: path, description: JSON.stringify(tplDayTime) }).log();
            return reply.status(204).send();
        }

        await new UserLogService({ user_id: user.id!, action: 'update tplDayTime with fail.', origin: path, description: `Failed to update tplDayTime with ID: ${id}` }).log();

        return reply.status(502).send(`Não foi possível atualizar o Tpl (Horários) ${tplDayTime?.id}.`);
    });

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;

        const hasDeleted = await tplDayTimeService.delete(id);
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: 'delete tplDayTime with success.', origin: path, description: `Deleted tplDayTime ID: ${id}` }).log();
            return reply.status(200).send();
        }

        await new UserLogService({ user_id: user.id!, action: 'delete tplDayTime with fail.', origin: path, description: `Failed to delete tplDayTime ID: ${id}` }).log();

        return reply.status(502).send();
    });

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const tplDayTime = await tplDayTimeService.list(id);


            return reply.status(200).send(tplDayTime);
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'get tplDayTime with fail.', origin: path }).log();

            return reply.status(500).send();
        }
    });
}
