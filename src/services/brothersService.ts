import { Database } from "../database/Database";
import { brother } from "../models/brother";


export class BrothersService<T = brother> extends Database<T> {
    constructor() {
        super({ options: { table: 'congregations_brothers' } })
    }
}