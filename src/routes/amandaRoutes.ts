import { FastifyInstance } from 'fastify';
import { Amanda } from '../models/amanda';
import { AmandaService } from '../services/amandaService';

const path = '/amanda'

export default function AmandaRoutes(server: FastifyInstance, amandaService: AmandaService) {
    server.post(path, async (request, reply) => {
        const amanda = request.body as Amanda
        const amanda_saved = await amandaService.create(amanda)
        if (amanda_saved) return reply.status(201).send(amanda_saved)
        return reply.status(502).send(`Não foi possível salvar o IP`)
    })
}