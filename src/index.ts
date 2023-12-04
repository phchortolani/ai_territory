import fastify from 'fastify'
import { Territory } from './models/territory';
import { TerritoryService } from './services/territoryService';
const server = fastify()
const port = 3333;
const territoryService = new TerritoryService();

server.post('/territory', async (request, reply) => {
    const territory = request.body as Territory
    const territory_saved = await territoryService.create(territory)
    if (territory_saved) return reply.status(201).send(territory_saved)
    return reply.status(502).send(`Não foi possível salvar o território.`)
})

server.put('/territory/:id', async (request, reply) => {
    const territory = request.body as Territory
    const { id } = request.params as any
    if (!id) return reply.status(400).send('O território informado não possui ID no GET.')

    const territory_updated = await territoryService.update(id, territory)
    if (territory_updated) return reply.status(204).send()
    return reply.status(502).send(`Não foi possível atualizar o território ${territory?.id}.`)
})

server.delete('/territory/:id', async (request, reply) => {
    const { id } = request.params as any;
    const hasDeleted = await territoryService.delete(id)
    if (hasDeleted) return reply.status(200).send()
    return reply.status(502).send()
})

server.get('/territory/:id?', async (request, reply) => {
    try {
        const { id } = request.params as any;
        const territorys = await territoryService.list(id);
        return reply.status(200).send(territorys)
    } catch (err) {
        return reply.status(500).send()
    }

})


server.listen({ port }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at http://localhost:${port}`)
})

