import { Database } from "../database/Database";
import { Amanda } from "../models/amanda";

export class AmandaService<T = Amanda> extends Database<T> {
    constructor() {
        super({ options: { table: 'amanda' } })
    }

}