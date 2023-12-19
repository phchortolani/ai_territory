import { Leaders } from "../models/leaders";
import { Territory } from "../models/territory";

export interface DevolutionDto {
    day: string,
    first_day: Date,
    last_day: Date
    territories: Territory[]
}
export interface ReturnSolicitationDto {
    leader: Leaders,
    devolutions: DevolutionDto[]
}