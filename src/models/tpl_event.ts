export interface TplEvent {
    id?: number;
    event_date: Date | null;
    tpl_day_time_id: number;
    pair?: string;
    created_at?: Date; // Opcional, pois é gerado automaticamente pelo banco de dados
}