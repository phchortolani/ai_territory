import { Database } from "../database/Database";
import { TplDayTime } from "../models/tpl_day_time";


export class TplDayTimeService<T = TplDayTime> extends Database<T> {
    constructor() {
        super({ options: { table: 'tpl_day_time' } })
    }
}