export interface UserLog {
    id?: number;
    user_id: number;
    origin: string;
    action: string;
    date?: Date;
    description?: string | null;

}