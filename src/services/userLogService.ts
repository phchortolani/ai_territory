import { Database } from "../database/Database";
import { UserLog } from "../models/user_log";


export class UserLogService<T = UserLog> extends Database<T> {
    #user_log: UserLog | undefined = undefined;

    constructor(user_log: UserLog) {
        super({ options: { table: 'user_log' } })
        user_log.date = user_log.date
        this.#user_log = user_log
    }

    async log() {
        return await super.create(this.#user_log)
    }
}