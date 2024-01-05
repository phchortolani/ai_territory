export interface RoundsDto {
    id: number,
    first_day: Date;
    last_day?: Date;
    expected_return: Date;
    leader: string;
    campaign?: string;
    status?: string;
    territory_id: number
}