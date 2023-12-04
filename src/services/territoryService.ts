import { Database } from "../database/Database";
import { Territory } from "../models/territory";

export class TerritoryService<T = Territory> extends Database<T> {
    constructor() {
        super({ options: { table: 'territories' } })
    }
}