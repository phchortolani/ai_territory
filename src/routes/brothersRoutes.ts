import { FastifyInstance } from 'fastify';

import { brother } from '../models/brother';
import { BrothersService } from '../services/brothersService';

const path = '/brothers'

export default function BrothersRoutes(server: FastifyInstance, brotherservice: BrothersService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const brother = request.body as brother
        delete brother.families
        const brother_saved = await brotherservice.create(brother)
        if (brother_saved) return reply.status(201).send(brother_saved)
        return reply.status(502).send(`Não foi possível salvar o irmão.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const brother = request.body as brother
        const { id } = request.params as any
        if (!id) return reply.status(400).send('O irmão informado não possui ID no GET.')

        if (brother.families) {
            await brotherservice.createFamilies(brother, brother.families)
        }

        delete brother.families;

        const brother_updated = await brotherservice.update(id, brother)

        if (brother_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar o irmão ${brother?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const hasDeleted = await brotherservice.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { id } = request.params as any;
            const brothers = await brotherservice.list(id);
            const families = await brotherservice.getFamilies()

            brothers.forEach(brother => {
                const family_persons = families.filter(family => family.person_id === brother.id).map(family => family.family_id)

                if (family_persons?.length > 0) {
                    const itens = brothers.filter(brother => family_persons.includes(brother.id)).map(x => { return { ...x, families: undefined } })
                    brother.families = itens
                }
            });
            return reply.status(200).send(brothers)
        } catch (err) {
            return reply.status(500).send(err)
        }

    })
}