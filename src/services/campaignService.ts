import { Database } from "../database/Database";
import { Campaign } from "../models/campaign";

export class CampaignService<T = Campaign> extends Database<T> {
    constructor() {
        super({ options: { table: 'campaign' } })
    }
}