export interface S13_Item {
    id: number;
    first_day: Date;
    last_day: Date;
    leader_name: string;
    territory_id: number;

}

export interface S13 {
    id: number;
    rounds: S13_Item[]
}