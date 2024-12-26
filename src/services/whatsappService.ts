import axios, { AxiosError } from "axios";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { IWhatsappMessage } from "../models/Whatsapp/whatsapp_message";
import { WhatsappChallenge } from "../models/WhatsappChallenge";

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
            return response.data;
        } catch (error: any) {
            console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
            throw error;
        }
    }


    async processMessage(message: IWhatsappMessage) {
        try {
            if (message.timestamp) message.timestamp = new Date(Number(message.timestamp) * 1000).toISOString();

            const result = await sql`insert into ${sql('whatsapp_messages')} ${sql(message)} returning *`;

            return result;
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            throw error;
        }
    }

}