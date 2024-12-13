import { FastifyInstance } from 'fastify';

import { brother } from '../models/brother';
import { BrothersService } from '../services/brothersService';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/brothers'

export default function BrothersRoutes(server: FastifyInstance, brotherservice: BrothersService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const brother = request.body as brother
        const user = request.user as User
        delete brother.families
        const brother_saved = await brotherservice.create(brother)
        if (brother_saved) {
            await new UserLogService({ user_id: user.id!, action: `create brother with success.`, origin: path, description: JSON.stringify(brother_saved) }).log()
            return reply.status(201).send(brother_saved)
        }
        await new UserLogService({ user_id: user.id!, action: `create brother with fail.`, origin: path }).log()
        return reply.status(502).send(`Não foi possível salvar o irmão.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const brother = request.body as brother
        const { id } = request.params as any
        const user = request.user as User

        if (!id) return reply.status(400).send('O irmão informado não possui ID no GET.')

        if (brother.families) {
            const families = await brotherservice.createFamilies(brother, brother.families)
            await new UserLogService({ user_id: user.id!, action: `update brother with families with success.`, origin: path, description: JSON.stringify(families) }).log()
        }

        delete brother.families;

        const brother_updated = await brotherservice.update(id, brother)

        if (brother_updated) {
            await new UserLogService({ user_id: user.id!, action: `update brother with success.`, origin: path, description: JSON.stringify(brother) }).log()
            return reply.status(204).send()
        }
        await new UserLogService({ user_id: user.id!, action: `update brother with fail.`, origin: path }).log()
        return reply.status(502).send(`Não foi possível atualizar o irmão ${brother?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const user = request.user as User;
        const hasDeleted = await brotherservice.delete(id)
        if (hasDeleted) {
            await new UserLogService({ user_id: user.id!, action: `delete brother with success.`, origin: path, description: `Deleted brother ID: ${id}` }).log()
            return reply.status(200).send()
        }
        await new UserLogService({ user_id: user.id!, action: `delete brother with fail.`, origin: path, description: `Failed to delete brother ID: ${id}` }).log()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        const user = request.user as User;
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
            await new UserLogService({ user_id: user.id!, action: `get brothers with fail.`, origin: path }).log()
            return reply.status(500).send(err)
        }

    })
}
