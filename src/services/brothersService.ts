import { Database } from "../database/Database";
import sql from "../database/sql";
import { brother } from "../models/brother";

type congregations_brothers_family = {
    id: number
    person_id: number
    family_id: number
}
export class BrothersService<T = brother> extends Database<T> {
    constructor() {
        super({ options: { table: 'congregations_brothers' } })
    }

    async getFamilies(brother_id?: number) {

        if (brother_id) {
            const family_relation: congregations_brothers_family[] = await sql`select * from congregations_brothers_family where person_id = ${brother_id}`
            return family_relation

        }
        const family_relation: congregations_brothers_family[] = await sql`select * from congregations_brothers_family`
        return family_relation
    }

    async createFamilies(brother: brother, families: brother[]) {
        const current_families = await this.getFamilies(brother.id);

        families = families.filter(f => !current_families.some(cf => cf.person_id === f.id))

         await sql`delete from congregations_brothers_family where person_id = ${brother.id}`
        families.forEach(family => {
            this.#addFamily(brother, family)
        })
        return families;

    }

    async  #addFamily(brother: brother, family: brother) {
        const family_relation = await sql`insert into congregations_brothers_family (person_id, family_id) values (${brother.id}, ${family.id}) returning *`
        if (family_relation.length > 0) {
            console.log(`Adicionado(a) o(a) irmã(o) ${brother.id} - ${brother.brother_name} no(a) irmão(a) ${family.id} - ${family.brother_name} ✅`)
        } else console.log(`Falha ao adicionar o irmão ${brother.id} no(a) irmão(a) ${family.id} - ${family.brother_name} 🤯`)

        return family_relation.length > 0
    }
}