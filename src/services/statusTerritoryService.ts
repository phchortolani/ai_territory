import { Database } from "../database/Database";
import { StatusTerritory } from "../models/status_territory";
import { Territory } from "../models/territory";

export class StatusTerritoryService<T = StatusTerritory> extends Database<T> {
    constructor() {
        super({ options: { table: 'status_territory' } })
    }
}