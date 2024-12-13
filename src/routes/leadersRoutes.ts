import { FastifyInstance } from 'fastify';
import { Leaders } from '../models/leaders';
import { LeadersService } from '../services/leadersService';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/leaders';

export default function LeadersRoutes(server: FastifyInstance, leaderService: LeadersService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const leader = request.body as Leaders;
        const user = request.user as User;

        const leader_saved = await leaderService.create(leader);
        if (leader_saved) {
            await new UserLogService({ user_id: user.id!, action: `create leader with success.`, origin: path, description: JSON.stringify(leader_saved) }).log();
            return reply.status(201).send(leader_saved);
        }
        await new UserLogService({
            user_id: user.id!,
            action: `create leader with fail.`,
            origin: path
        }).log();
        return reply.status(502).send(`Não foi possível salvar o dirigente.`);
    });

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const leader = request.body as Leaders;
        const { id } = request.params as any;
        const user = request.user as User;

        if (!id) return reply.status(400).send('O território informado não possui ID no GET.');

        const leader_updated = await leaderService.update(id, leader);
        if (leader_updated) {
            await new UserLogService({ user_id: user.id!, action: `update leader with success.`, origin: path, description: JSON.stringify(leader) }).log();
            return reply.status(204).send();
        }
        await new UserLogService({
            user_id: user.id!,
            action: `update leader with fail.`,
            origin: path,
            description: `Failed to update leader with ID: ${id}`
        }).log();
        return reply.status(502).send(`Não foi possível atualizar o dirigente ${leader?.id}.`);
    });

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;

        const hasDeleted = await leaderService.delete(id);
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: `delete leader with success.`, origin: path, description: `Deleted leader ID: ${id}` }).log();
            return reply.status(200).send();
        }
        await new UserLogService({ user_id: user.id!, action: `delete leader with fail.`, origin: path, description: `Failed to delete leader ID: ${id}` }).log();
        return reply.status(502).send();
    });

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const leaders = await leaderService.list(id);
            return reply.status(200).send(leaders);
        } catch (err) {
            await new UserLogService({
                user_id: user.id!,
                action: `get leaders with fail.`,
                origin: path,
            }).log();
            return reply.status(500).send();
        }
    });
}
