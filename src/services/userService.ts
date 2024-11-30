import { Database } from "../database/Database";
import { User } from "../models/user";

export class UserService<T = User> extends Database<T> {

    constructor() {
        super({ options: { table: 'users' } })
    }


}