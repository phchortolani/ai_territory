export interface ISchedule {
    territories: number[] | undefined,
    first_day: Date,
    campaign_id?: number,
    repeat_next_week?: boolean,
}