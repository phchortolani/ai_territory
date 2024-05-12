import { Database } from "../database/Database";
import sql from "../database/sql";
import { Amanda, DadosBasicosDto } from "../models/amanda";

export class AmandaService<T = DadosBasicosDto> extends Database<T> {
    constructor() {
        super({ options: { table: 'dados_basicos' } })
    }


}