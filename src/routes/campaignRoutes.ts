import { FastifyInstance } from 'fastify';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/campaignService';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/campaign';

export default function CampaignRoutes(server: FastifyInstance, campaignService: CampaignService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const campaign = request.body as Campaign;
        const user = request.user as User;

        const campaign_saved = await campaignService.create(campaign);
        if (campaign_saved) {
            await new UserLogService({ user_id: user.id!, action: `create campaign with success.`, origin: path, description: JSON.stringify(campaign_saved) }).log();
            return reply.status(201).send(campaign_saved);
        }
        await new UserLogService({ user_id: user.id!, action: `create campaign with fail.`, origin: path }).log();
        return reply.status(502).send(`Não foi possível salvar a campanha.`);
    });

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const campaign = request.body as Campaign;
        const { id } = request.params as any;
        const user = request.user as User;

        if (!id) return reply.status(400).send('A campanha informada não possui ID no GET.');

        const campaign_updated = await campaignService.update(id, campaign);
        if (campaign_updated) {
            await new UserLogService({ user_id: user.id!, action: `update campaign with success.`, origin: path, description: JSON.stringify(campaign) }).log();
            return reply.status(204).send();
        }
        await new UserLogService({ user_id: user.id!, action: `update campaign with fail.`, origin: path }).log();
        return reply.status(502).send(`Não foi possível atualizar a campanha ${campaign?.id}.`);
    });

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;

        const hasDeleted = await campaignService.delete(id);
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: `delete campaign with success.`, origin: path, description: `Deleted campaign ID: ${id}` }).log();
            return reply.status(200).send();
        }
        await new UserLogService({ user_id: user.id!, action: `delete campaign with fail.`, origin: path, description: `Failed to delete campaign ID: ${id}` }).log();
        return reply.status(502).send();
    });

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;

        try {
            const { id } = request.params as any;
            const campaign = await campaignService.list(id);
            return reply.status(200).send(campaign);
        } catch (err) {
            await new UserLogService({ user_id: user.id!, action: `get campaign with fail.`, origin: path }).log();
            return reply.status(500).send();
        }
    });
}
