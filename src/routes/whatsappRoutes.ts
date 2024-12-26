import { FastifyInstance } from 'fastify';
import { WhatsappService } from '../services/whatsappService';
import { ChallengeToken } from '../models/Whatsapp/ChallengeToken';
import moment from 'moment';
import { IWhatsappMessage } from '../models/Whatsapp/whatsapp_message';
import { WhatsAppWebhookBody } from '../models/Whatsapp/whatsappMessageBody';
import { UserLogService } from '../services/userLogService';

const path = '/whatsapp'

export default function WhatsappRoutes(server: FastifyInstance, whatsappService: WhatsappService) {

    // Endpoint para verificação do webhook
    server.get(`${path}/webhook`, async (request, reply) => {
        const { WA_CHALLENGE_TOKEN } = process.env;

        const params = request.query as ChallengeToken;

        // Verifica se o token de verificação é válido
        if (WA_CHALLENGE_TOKEN != params['hub.verify_token']) {
            return reply.status(400).send('Invalid Token');
        }

        // Retorna o challenge caso o parâmetro esteja presente
        if (params['hub.challenge']) {
            await whatsappService.create({
                hub_mode: params['hub.mode'],
                hub_challenge: params['hub.challenge'],
                hub_verify_token: params['hub.verify_token'],
                create_at: moment()
            });
            return reply.status(200).send(params['hub.challenge']);
        } else {
            return reply.status(400).send('Missing challenge parameter');
        }
    });

    // Endpoint para receber mensagens do WhatsApp
    server.post(`${path}/webhook`, async (request, reply) => {
        const body = request.body as WhatsAppWebhookBody;

        await new UserLogService({ user_id: 1, action: 'receive message from whatsapp.', origin: path, description: JSON.stringify(body) }).log();

        if (body.field !== 'messages' || body.value.messaging_product !== 'whatsapp') {
            return reply.status(400).send('Invalid request format');
        }
        for (const message of body.value.messages) {

            const formattedMessage: IWhatsappMessage = {
                message_id: message.id,
                from_number: message.from,
                timestamp: message.timestamp,
                message_text: message.text?.body || '',
                message_type: message.type,
                received_at: new Date()
            };

            await whatsappService.processMessage(formattedMessage);
        }

        return reply.status(200).send('Message received');
    });
}
