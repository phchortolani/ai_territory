import { FastifyInstance } from 'fastify';
import { WhatsappService } from '../services/whatsappService';
import { ChallengeToken } from '../models/Whatsapp/ChallengeToken';
import moment from 'moment';
import { IWhatsappMessage } from '../models/Whatsapp/whatsapp_message';
import { WhatsAppWebhookBody } from '../models/Whatsapp/whatsappMessageBody';
import { UserLogService } from '../services/userLogService';
import 'moment/locale/pt-br';
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

                            if (!!formattedMessage?.message_text) {
                                const retorno = await getAI({
                                    prompt: `Analise o seguinte texto: "${formattedMessage.message_text}".  
                                  
                                    A pergunta é: **o texto trata de uma solicitação de agendamento ou geração de territórios?**
                                    
                                    as perguntas geralmente são:
                                    - "Quero agendar um território"
                                    - "Gere territórios para mim"
                                    - "Gere territórios para o fulano de tal no dia tal"
                                    - "Quero agendar um território para o fulano de tal no dia tal"
                                    - "Gere territórios para o fulano de tal"  
                                    - 'Quero territórios para hoje'
                                    - 'Preciso de territórios'
                                    - 'Me envie os territórios'
                                    - 'Quero os territórios'
                                    - 'Gere territórios'
                                    - 'gere territórios para mim'
                                    - 'me mande os territórios'
                                    - 'preciso de territórios para hoje'

                                    Qualquer solicitação parecida com esses exemplos é considerada uma solicitação de agendamento.
                                  
                                    🔹 **Responda apenas com "SIM" ou "NÃO".** Nenhuma outra resposta é permitida.  
                                  
                                    **Exemplo de resposta:**  
                                    - SIM  
                                    - NÃO  
                                    `
                                });

                                const dirigentes = await leadersService.list();
                                if (retorno.toUpperCase().trim() === 'SIM') {

                                    const agendamento_texto = await getAI({
                                        prompt: `Com base no seguinte texto: "${formattedMessage.message_text}", identifique:  
                                      
                                        1. O nome do dirigente mencionado (o nome do dirigente pode ser escrito com ou sem acentuação, ou com ou sem espaços, ou com ou sem letras maiúsculas).  
                                        2. O dia desejado para o agendamento.  
                                        3. Se o nome do dirigente **não for mencionado**, verifique na lista de dirigentes se o telefone **${formattedMessage.from_number}** está cadastrado e associe-o ao dirigente correspondente.  
                                      
                                        **Lista de dirigentes cadastrados (id - nome - telefone):**  
                                        ${dirigentes?.map(dirigente => `ID: ${dirigente.id} - NOME: ${dirigente.name} - TELEFONE: ${dirigente?.telefone}`).join(', ')}  
                                      
                                        **Data atual:** ${moment().subtract(3, 'hours').format('YYYY-MM-DD')}.  
                                      
                                        **Regras de resposta:**  
                                        - Se encontrar o dirigente e o dia, responda: **"ENCONTRADO,id,YYYY-MM-DD"**  
                                        - Se não encontrar o dia, responda: **"SEM DIA"**  
                                        - Se não encontrar o dirigente (nem pelo nome, nem pelo telefone), responda: **"SEM DIRIGENTE"**  
                                        - Se não encontrar nem o dirigente nem o dia, responda: **"SEM DIA E DIRIGENTE"**  
                                        - Se a data for anterior a hoje, responda: **"DATA ANTERIOR A HOJE"**  
                                        - Se o dirigente **foi identificado apenas pelo telefone**, responda: **"ENCONTRADO_POR_TELEFONE,id,YYYY-MM-DD"**  
                                        - Se o texto for totalmente diferente de uma solicitação de agendamento, responda: **"NÃO É UMA SOLICITAÇÃO DE AGENDAMENTO"**
                                      
                                        🚨 **Apenas essas respostas são válidas. Não forneça nenhuma outra resposta.**  
                                        `
                                    });

                                    if (agendamento_texto.startsWith('NÃO É UMA SOLICITAÇÃO DE AGENDAMENTO')) {
                                        await whatsappService.sendMessage(formattedMessage.from_number, 'Estou disponível para agendamentos. Por favor, informe o dirigente e o dia que deseja agendar.');
                                    }

                                    if (agendamento_texto.startsWith('SEM DIA E DIRIGENTE')) {
                                        await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dirigente e o dia que deseja agendar.');
                                    } else {
                                        if (agendamento_texto.startsWith('SEM DIA')) {
                                            await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dia que deseja agendar.');
                                        }
                                        if (agendamento_texto.startsWith('SEM DIRIGENTE')) {
                                            await whatsappService.sendMessage(formattedMessage.from_number, 'Por favor, informe o dirigente que deseja agendar.');
                                        }
                                    }

                                    if (agendamento_texto.startsWith('DATA ANTERIOR A HOJE')) {
                                        await whatsappService.sendMessage(formattedMessage.from_number, 'A data informada é anterior a hoje. Por favor, informe uma data válida.');
                                    }
                                    if (agendamento_texto.startsWith('ENCONTRADO') || agendamento_texto.startsWith('ENCONTRADO_POR_TELEFONE')) {
                                        const agendamento = agendamento_texto.split(',');
                                        const dirigente_id = Number(agendamento[1]);
                                        const dia = agendamento[2];
                                        const dirigente = dirigentes?.find(dirigente => dirigente.id == dirigente_id);
                                        if (dirigente) {
                                            const agendamento = {
                                                territories: [],
                                                first_day: moment(dia).toDate(),
                                                repeat_next_week: false,
                                                not_use_ia: false,
                                                notificar_whatsapp: agendamento_texto.endsWith('ENCONTRADO_POR_TELEFONE'),
                                            }
                                            await roundsService.ToSchedule(agendamento, dirigente_id);
                                        } else {
                                            await whatsappService.sendMessage(formattedMessage.from_number, 'Não encontrei o dirigente informado. Por favor, tente novamente.');
                                        }
                                    }
                                } else {
                                    await whatsappService.sendMessage(formattedMessage.from_number, 'Não entendi a solicitação por esse texto. Por favor, tente novamente:');
                                }
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
