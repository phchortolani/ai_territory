import 'dotenv/config'
import { FastifyInstance } from 'fastify';
import { WhatsappService } from '../services/whatsappService';
import { ChallengeToken } from '../models/Whatsapp/ChallengeToken';
import moment from 'moment';

const path = '/whatsapp'


export default function WhatsappRoutes(server: FastifyInstance, whatsappService: WhatsappService) {
    server.get(`${path}/validateToken`, async (request, reply) => {

        const { WA_CHALLENGE_TOKEN } = process.env

        const params = request.query as ChallengeToken;
        if (WA_CHALLENGE_TOKEN != params['hub.verify_token']) return reply.status(400).send('Invalid Token')

        if (params['hub.challenge']) {
            await whatsappService.create({
                hub_mode: params['hub.mode'],
                hub_challenge: params['hub.challenge'],
                hub_verify_token: params['hub.verify_token'],
                create_at: moment()
            })
            return reply.status(200).send(params['hub.challenge'])
        } else return reply.status(400)
    })
}