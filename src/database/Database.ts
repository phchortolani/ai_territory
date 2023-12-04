import { database_options } from "../enums/database_options";
import { Territory } from "../models/territory";
import sql from "./sql";

interface IDatabase {
    options: database_options;
}
export class Database<T> {
    #table: string

    constructor({ options }: IDatabase) {
        this.#table = options.table;
    }

    async create(obj: any) {
        try {
            delete obj.id
            const keys = Object.keys(obj);
            const created = await sql`insert into ${sql(this.#table)} ${sql(obj, keys)} returning *`
            console.log('created', created)
            return created
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async update(id: number, obj: any) {
        try {
            const keys = Object.keys(obj);
            const updated = await sql`update ${sql(this.#table)} set ${sql(obj, keys)} where id = ${id}`
            console.log('updated: ', updated.count > 0)
            return updated.count > 0
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async delete(id?: number) {
        try {
            const query = await sql`delete from ${sql(this.#table)}
            where id is not null ${id ? sql`and id = ${id}` : sql``}`;
            console.log('delete_status: ', query.count > 0)
            return query.count > 0;
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async list(id?: number) {
        try {
            const list: T[] = await sql`select * from ${sql(this.#table)} 
            where id is not null ${id ? sql`and id = ${id}` : sql``}` as unknown as any;
            return list;
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}