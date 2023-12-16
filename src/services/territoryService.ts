import { Database } from "../database/Database";
import sql from "../database/sql";
import { TerritoryAndressDto } from "../dtos/territoryAndressDto";
import { Territory } from "../models/territory";

export class TerritoryService<T = Territory> extends Database<T> {
    constructor() {
        super({ options: { table: 'territories' } })
    }

    async getAllAndress() {
        try {
            const andressList: TerritoryAndressDto[] = await sql`
            select ra.id as register_id,a.description as andress,r.territory_id  
            from register_andress ra join andress a on a.id = ra.andress_id  
            join  register r on ra.register_id = r.id  order by r.territory_id`
            return andressList;
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}