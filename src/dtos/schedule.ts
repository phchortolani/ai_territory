export interface ISchedule {
    territories: number[] | undefined,
    first_day: Date,
    campaign_id?: number,
    repeat_next_week?: boolean,
    not_use_ia?: boolean,
    notificar_whatsapp?: boolean,
    house_number?: number
}