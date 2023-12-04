import { Database } from "../database/Database";
import { Leaders } from "../models/leaders";

export class LeadersService<T = Leaders> extends Database<T> {
    constructor() {
        super({ options: { table: 'leaders' } })
    }
}