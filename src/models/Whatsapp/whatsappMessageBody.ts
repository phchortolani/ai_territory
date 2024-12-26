export interface WhatsAppWebhookBody {
    field: string;
    value: {
        messaging_product: string;
        metadata: {
            display_phone_number: string;
            phone_number_id: string;
        };
        contacts: Array<{
            profile: {
                name: string;
            };
            wa_id: string;
        }>;
        messages: Array<{
            from: string;
            id: string;
            timestamp: string;
            type: string;
            text?: {
                body: string;
            };
        }>;
    };
}
