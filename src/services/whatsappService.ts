import { Database } from "../database/Database";
import sql from "../database/sql";
import { IWhatsappMessage } from "../models/Whatsapp/whatsapp_message";
import { WhatsappChallenge } from "../models/WhatsappChallenge";

export class WhatsappService<T = WhatsappChallenge> extends Database<T> {
    constructor() {
        super({ options: { table: 'whatsapp_challenge' } })
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