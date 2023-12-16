import { Leaders } from "../models/leaders";
import { Territory } from "../models/territory";

export interface ReturnSolicitationDto {
    leader: Leaders,
    day: string,
    first_day: Date,
    last_day: Date
    territories: Territory[]

}