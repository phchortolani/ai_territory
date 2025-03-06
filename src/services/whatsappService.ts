import axios, { AxiosError } from "axios";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { IWhatsappMessage } from "../models/Whatsapp/whatsapp_message";
import { WhatsappChallenge } from "../models/WhatsappChallenge";
import { UserLogService } from "./userLogService";
import moment from "moment";
import { getStatusDay } from "../utils/getStatusDay";

export interface RoundInfoTemplateParams {
    territorios: string;
    info: string;
    quantidade_casas: string;
    url: string;
    dia: Date;
}

export class WhatsappService<T = WhatsappChallenge> extends Database<T> {
    accessToken?: string | undefined;
    phoneNumberId?: string | undefined;
    metaUrl?: string | undefined;

    constructor() {
        super({ options: { table: 'whatsapp_challenge' } })
        this.accessToken = process.env.META_TOKEN!
        this.phoneNumberId = process.env.META_PHONE_ID!;
        this.metaUrl = process.env.META_URL

    }

    // Método para enviar mensagem usando o Template
    async sendMessage(to: string, message: string, templateId?: string) {
        try {
            const url = `${this.metaUrl}${this.phoneNumberId}/messages`;

            const body = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: {
                    preview_url: false,
                    body: message
                }
            }
            const response = await axios.post(url, body, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            return response.status == 200;
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
            throw error;
        }
    }



    async sendMessageRoundInfo(to: string, templateParams: RoundInfoTemplateParams) {
        try {
            console.log('Enviando os seguintes parâmetros para o template round_info: ', templateParams);
            const url = `${this.metaUrl}${this.phoneNumberId}/messages`;

            const body = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "template",
                template: {
                    name: "round_info",
                    language: { code: "pt_BR" },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "text",
                                    parameter_name: "dia",
                                    text: `${moment(templateParams.dia).utc().locale('pt-br').format('dddd DD/MM/YYYY')}`.toUpperCase()
                                }
                            ]
                        },
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    parameter_name: "territorios",
                                    text: templateParams.territorios
                                },
                                {
                                    type: "text",
                                    parameter_name: "info",
                                    text: templateParams.info
                                },
                                {
                                    type: "text",
                                    parameter_name: "quantidade_casas",
                                    text: templateParams.quantidade_casas
                                }
                            ]
                        },
                        {
                            type: "button",
                            index: 0,
                            sub_type: "url",
                            parameters: [{
                                type: "text",
                                parameter_name: "url",
                                text: templateParams.url
                            }]
                        }
                    ]
                }
            };

            // console.log('Body:', JSON.stringify(body, null, 2));

            const response = await axios.post(url, body, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Resposta:', response.data);
            return response.status == 200;
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
            throw error;
        }
    }


    async sendMultipleImages(to: string, images: Array<{ url: string, caption?: string }>) {
        try {
            const results = [];

            for (const image of images) {
                const url = `${this.metaUrl}${this.phoneNumberId}/messages`;

                const body = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: "image",
                    image: {
                        link: image.url
                    }
                };

                // Adiciona legenda se fornecida
                if (image.caption) {
                    body.image = {
                        ...body.image,
                    };
                }

                try {
                    const response = await axios.post(url, body, {
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    results.push({
                        url: image.url,
                        success: true,
                        response: response.data
                    });

                    // Adiciona um pequeno delay entre os envios para evitar rate limiting
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (error: any) {
                    console.error(`Erro ao enviar imagem ${image.url}:`, error.response?.data || error.message);
                    results.push({
                        url: image.url,
                        success: false,
                        error: error.response?.data || error.message
                    });
                }
            }

            return results.every(result => result.success);
        } catch (error: any) {
            console.error('Erro ao enviar múltiplas imagens:', error);
            throw error;
        }
    }


    async processMessage(message: IWhatsappMessage) {
        try {
            if (message.timestamp) message.timestamp = new Date(Number(message.timestamp) * 1000).toISOString();

            const exists = await this.messageExists(message.message_id);

            if (!exists) {
                const result: IWhatsappMessage[] = await sql`insert into ${sql('whatsapp_messages')} ${sql(message)} returning *`;

                this.sendMessage(message.from_number, 'Mensagem recebida e registrada com sucesso!');
                await new UserLogService({ user_id: 1, action: 'message  received with success.', origin: 'whatsapp', description: result[0]?.message_id }).log();

                return result;
            } else {
                console.log('Mensagem já existe:', message);
                return;
            }

        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            throw error;
        }
    }
    async messageExists(message_id: string) {
        try {
            const result = await sql`select * from ${sql('whatsapp_messages')} where message_id = ${message_id}`;
            return result.length > 0;
        } catch (error) {
            console.error('Erro ao verificar se a mensagem já existe:', error);
            throw error;
        }
    }

    async updateStatus(message_id: string, status: string) {
        try {
            const result = await sql`update ${sql('whatsapp_messages')} set status = ${status} where message_id = ${message_id}`;
            return result;
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            throw error;
        }
    }

    async sendRoundInfoStartMessage(to: string, nome: string) {
        try {
            console.log('Enviando template utilitário para:', nome);

            const url = `${this.metaUrl}${this.phoneNumberId}/messages`;

            const status_dia = getStatusDay();

            const body = {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "template",
                template: {
                    name: "round_start",
                    language: { code: "pt_BR" },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", parameter_name: "status_dia", text: status_dia }
                            ]
                        }
                    ]
                }
            };

            // console.log('Body:', JSON.stringify(body, null, 2));

            const response = await axios.post(url, body, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // console.log('Resposta da API:', response.data);
            return response.status == 200;
        } catch (error: any) {
            console.error('Erro ao enviar template utilitário:', error.response?.data || error.message);
            throw error;
        }
    }


}

