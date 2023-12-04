import { Database } from "../database/Database";
import { Campaign } from "../models/campaign";

export class TerritoryService<T = Campaign> extends Database<T> {
    constructor() {
        super({ options: { table: 'campaign' } })
    }
}