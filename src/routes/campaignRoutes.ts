import { FastifyInstance } from 'fastify';
import { Campaign } from '../models/campaign';
import { CampaignService } from '../services/campaignService';

const path = '/campaign'

export default function CampaignRoutes(server: FastifyInstance, campaignService: CampaignService) {
    server.post(path, async (request, reply) => {
        const campaign = request.body as Campaign
        const campaign_saved = await campaignService.create(campaign)
        if (campaign_saved) return reply.status(201).send(campaign_saved)
        return reply.status(502).send(`Não foi possível salvar a campanha.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        const campaign = request.body as Campaign
        const { id } = request.params as any
        if (!id) return reply.status(400).send('A campanha informada não possui ID no GET.')

        const campaign_updated = await campaignService.update(id, campaign)
        if (campaign_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar a campanha ${campaign?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        const { id } = request.params as any;
        const hasDeleted = await campaignService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        try {
            const { id } = request.params as any;
            const campaign = await campaignService.list(id);
            return reply.status(200).send(campaign)
        } catch (err) {
            return reply.status(500).send()
        }

    })
}