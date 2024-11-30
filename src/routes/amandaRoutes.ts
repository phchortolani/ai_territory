import { FastifyInstance } from 'fastify';
import { Amanda, DadosBasicosDto } from '../models/amanda';
import { AmandaService } from '../services/amandaService';

const path = '/amanda'

export default function AmandaRoutes(server: FastifyInstance, amandaService: AmandaService) {
    /*     server.post(path, async (request, reply) => {
            const amanda = request.body as string
            const obj = JSON.parse(amanda)
            const amanda_saved = await amandaService.create(obj)
            if (amanda_saved) return reply.status(201).send(amanda_saved)
            return reply.status(502).send(`Não foi possível salvar o IP`)
        })
     */
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const dados_basico = request.body as DadosBasicosDto
        const dados_basicos = await amandaService.create(dados_basico)
        if (dados_basicos) return reply.status(201).send(dados_basicos)
        return reply.status(502).send(`Não foi possível salvar os dados basicos.`)
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { id } = request.params as any;
            const dados_basicos = await amandaService.list(id);
            return reply.status(200).send(dados_basicos)
        } catch (err) {
            return reply.status(500).send()
        }

    })

}