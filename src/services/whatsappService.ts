import { Database } from "../database/Database";
import sql from "../database/sql";
import { TerritoryAndressDto } from "../dtos/territoryAndressDto";
import { WhatsappChallenge } from "../models/WhatsappChallenge";
import { Territory } from "../models/territory";

export class WhatsappService<T = WhatsappChallenge> extends Database<T> {
    constructor() {
        super({ options: { table: 'whatsapp_challenge' } })
    }
}