export interface Rounds {
    id: number;
    first_day: Date;
    last_day?: Date;
    expected_return: Date;
    leader: number; //fk de leaders
    campaign: number; //fk de campaign
    status: number; //fk de status_territory 
}