import { FastifyInstance } from 'fastify';
import { TerritoryService } from '../services/territoryService';
import { Territory } from '../models/territory';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/territory';

export default function TerritoryRoutes(server: FastifyInstance, territoryService: TerritoryService) {

    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const territory = request.body as Territory;
        const user = request.user as User;

        const territory_saved = await territoryService.create(territory);
        if (territory_saved) {
            await new UserLogService({ user_id: user.id!, action: 'create territory with success.', origin: path, description: JSON.stringify(territory_saved) }).log();
            return reply.status(201).send(territory_saved);
        }

        await new UserLogService({ user_id: user.id!, action: 'create territory with fail.', origin: path }).log();
        return reply.status(502).send(`Não foi possível salvar o território.`);
    });

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const territory = request.body as Territory;
        const { id } = request.params as any;
        const user = request.user as User;

        if (!id) return reply.status(400).send('O território informado não possui ID no GET.');

        const territory_updated = await territoryService.update(id, territory);
        if (territory_updated) {
            await new UserLogService({ user_id: user.id!, action: 'update territory with success.', origin: path, description: JSON.stringify(territory) }).log();
            return reply.status(204).send();
        }

        await new UserLogService({ user_id: user.id!, action: 'update territory with fail.', origin: path, description: `Failed to update territory with ID: ${id}` }).log();
        return reply.status(502).send(`Não foi possível atualizar o território ${territory?.id}.`);
    });

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;

        const hasDeleted = await territoryService.delete(id);
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: 'delete territory with success.', origin: path, description: `Deleted territory ID: ${id}` }).log();
            return reply.status(200).send();
        }

        await new UserLogService({ user_id: user.id!, action: 'delete territory with fail.', origin: path, description: `Failed to delete territory ID: ${id}` }).log();
        return reply.status(502).send();
    });

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const territories = await territoryService.list(id);

            return reply.status(200).send(territories.sort((a, b) => a.id - b.id));
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'get territory with fail.', origin: path }).log();
            return reply.status(500).send();
        }
    });

    server.get(`${path}/getFullTerritoriesList`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const ret = await Promise.all([territoryService.list(id), territoryService.getAllAndress()]);

            return reply.status(200).send({
                territories: ret[0].sort((a, b) => a.id - b.id),
                andressList: ret[1]
            });
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'get full territories list with fail.', origin: path }).log();
            return reply.status(500).send();
        }
    });

    server.get(`${path}/getAvailableTerritories`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;
        try {
            const ret = await territoryService.getTerritoriesAvaliable();
            return reply.status(200).send(ret);
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: 'get full territories list with fail.', origin: path }).log();
            return reply.status(500).send();
        }
    })


}
