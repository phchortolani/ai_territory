import { FastifyInstance } from 'fastify';
import { WhatsappService } from '../services/whatsappService';
import { ChallengeToken } from '../models/Whatsapp/ChallengeToken';
import moment from 'moment';
import { IWhatsappMessage } from '../models/Whatsapp/whatsapp_message';
import { WhatsAppWebhookBody } from '../models/Whatsapp/whatsappMessageBody';
import { UserLogService } from '../services/userLogService';
import { log } from 'console';
import { getAI } from '../services/geminiService';
import { LeadersService } from '../services/leadersService';
import { RoundsService } from '../services/roundsService';

const path = '/whatsapp'

export default function WhatsappRoutes(server: FastifyInstance, whatsappService: WhatsappService, leadersService: LeadersService, roundsService: RoundsService) {

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
        let log_message = '';
        try {
            log_message = 'receive event from webhook whatsapp.';
            const body = request.body as WhatsAppWebhookBody;
            log_message = 'save in log that received event from webhook whatsapp: ' + JSON.stringify(body) + '.';

            await new UserLogService({ user_id: 1, action: 'receive event from webhook whatsapp.', origin: path }).log();

            log_message = 'validating object in request.';
            if (body?.object !== 'whatsapp_business_account') {
                log_message = 'Invalid object in request init.';
                await new UserLogService({
                    user_id: 1,
                    action: 'Invalid object in request.',
                    origin: path,
                }).log();
                log_message = 'Invalid object in request';
                return reply.status(400).send('Invalid object in request');
            }

            log_message = 'Validating that entry and changes exist and have messages.';
            // Validating that 'entry' and 'changes' exist and have messages
            if (!body?.entry || body?.entry?.length === 0 || !body?.entry[0]?.changes || body?.entry[0]?.changes?.length === 0) {
                log_message = 'Invalid object in request';
                await new UserLogService({ user_id: 1, action: 'Invalid request format.', origin: path })
                return reply.status(400).send('Invalid request format');
            }

            log_message = 'validating if is a message or status change';
            for (const change of body?.entry[0]?.changes) {

                if (change.field !== 'messages' || change.value.messaging_product !== 'whatsapp') {
                    log_message = 'Invalid message format';
                    await new UserLogService({ user_id: 1, action: 'Invalid message format.', origin: path })
                    return reply.status(400).send('Invalid message format');
                }

                //validating if is a message or status change
                log_message = 'validating if is a message or status change';
                if ((change?.value?.statuses?.length ?? 0) > 0) {
                    // only status change
                    log_message = 'only status change';
                    const messages_status_change = change?.value?.statuses?.map(status => {
                        return {
                            message_id: status.id
                        }
                    })

                    log_message = 'updating status from messages: ' + JSON.stringify(messages_status_change?.map(message => message.message_id).join(', ')) + '.';

                    const current_status = change?.value?.statuses![0]?.status;

                    messages_status_change?.forEach(async message => {
                        await whatsappService.updateStatus(message?.message_id ?? '', current_status ?? 'not_set');
                    })

                    await new UserLogService({
                        user_id: 1,
                        action: 'update status from messages: ' + JSON.stringify(messages_status_change?.map(message => message.message_id).join(', ')) + '.',
                        origin: path,
                    }).log();
                    log_message = 'status updated';
                } else {
                    // only message change
                    log_message = 'only message change';
                    if (change.value.messages) {
                        log_message = 'processing messages init.';
                        for (const message of change.value.messages) {
                            const formattedMessage: IWhatsappMessage = {
                                message_id: message.id,
                                from_number: message.from,
                                timestamp: message.timestamp,
                                message_text: message.text?.body || '',
                                message_type: message.type,
                                received_at: new Date(),
                            };
                            log_message = 'processing message: ' + JSON.stringify(formattedMessage) + '.';
                            await whatsappService.processMessage(formattedMessage);
                            log_message = 'message processed with success.';

                            const retorno = await getAI({
                                prompt: `Analise o seguinte texto: ${formattedMessage.message_text}. 
                                Com base no texto acima, responda SOMENTE com SIM ou NÃO: O texto se trata de uma solicitação de agendamento de território?
                                Exemplo de resposta: SIM
                                `
                            });

                            const dirigentes = await leadersService.list();
                            if (retorno.toLocaleUpperCase() == 'SIM') {

                                const agendamento_texto = await getAI({
                                    prompt: `com base nesse texto: ${formattedMessage.message_text}.    

                                    Identifique o nome do dirigente e também o dia que ele deseja agendar.

                                    segue abaixo a lista de dirigentes cadastrados:

                                    ${dirigentes?.map(dirigente => dirigente.name).join(', ')}

                                    Apenas para sua referencia hoje é ${moment().format('YYYY-MM-DD')}

                                    responda com o status 'ENCONTRADO', id do dirigente e o dia (o dia deve ser no formato YYYY-MM-DD) que ele deseja agendar, separado por vírgula.

                                    Exemplo de resposta: ENCONTRADO,1,2023-01-01

                                    caso não tenha o dia, responda: 'SEM DIA'
                                    caso não tenha o dirigente, responda: 'SEM DIRIGENTE'
                                    caso não tenha o dia e o dirigente, responda: 'SEM DIA E DIRIGENTE'
                                    caso a data seja anterior a hoje, responda: 'DATA ANTERIOR A HOJE'

                                    NENHUM OUTRO TIPO DE RESPOSTA É VALIDA, SOMENTE AS INFORMADAS ACIMA.
                                    `
                                });

                                if (agendamento_texto.startsWith('SEM DIA')) {
                                    await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dia que deseja agendar.');
                                }
                                if (agendamento_texto.startsWith('SEM DIRIGENTE')) {
                                    await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dirigente que deseja agendar.');
                                }
                                if (agendamento_texto.startsWith('SEM DIA E DIRIGENTE')) {
                                    await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dirigente e o dia que deseja agendar.');
                                }
                                if (agendamento_texto.startsWith('DATA ANTERIOR A HOJE')) {
                                    await whatsappService.sendMessage(formattedMessage.from_number, 'A data informada é anterior a hoje. Por favor, informe uma data válida.');
                                }
                                if (agendamento_texto.startsWith('ENCONTRADO')) {
                                    const agendamento = agendamento_texto.split(',');
                                    const dirigente_id = Number(agendamento[1]);
                                    const dia = agendamento[2];
                                    const dirigente = dirigentes?.find(dirigente => dirigente.id == dirigente_id);
                                    if (dirigente) {
                                        const agendamento = {
                                            territories: [],
                                            first_day: moment(dia).toDate(),
                                            repeat_next_week: false,
                                            not_use_ia: false
                                        }
                                        await roundsService.ToSchedule(agendamento, dirigente_id);
                                    } else {
                                        await whatsappService.sendMessage(formattedMessage.from_number, 'Não encontrei o dirigente informado. Por favor, tente novamente.');
                                    }
                                }
                            } else {
                                await whatsappService.sendMessage(formattedMessage.from_number, 'Não entendi a solicitação. Por favor, tente novamente.');
                            }




                        }
                    }

                }
            }

            return reply.status(200).send('Message received');
        } catch (error: any) {
            console.error('Erro ao receber mensagem:', JSON.stringify(error));
            console.error('log_message:', log_message);
            await new UserLogService({ user_id: 1, action: 'Error receiving message.', origin: path, description: JSON.stringify(error) }).log();
            await whatsappService.sendMessage('5511957886697', 'Erro ao receber webhook do whatsapp: ' + JSON.stringify(error));
            return reply.status(500).send('Internal Server Error');
        }

    });
}
