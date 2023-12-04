import { Database } from "../database/Database";
import { Rounds } from "../models/rounds";

export class RoundsService<T = Rounds> extends Database<T> {
    constructor() {
        super({ options: { table: 'rounds' } })
    }
}