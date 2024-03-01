export interface WhatsappChallenge {
    id: number;
    hub_mode: string;
    hub_challenge: string;
    hub_verify_token: string;
    create_at: Date;
}