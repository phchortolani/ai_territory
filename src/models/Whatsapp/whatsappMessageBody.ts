export interface WhatsAppWebhookBody {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
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
                statuses?: [
                    {
                        id: string;
                        status: string,
                        timestamp: string,
                        recipient_id: string,
                        conversation: {
                            id: string,
                            origin: {
                                type: string,
                            }
                        },
                        pricing: {
                            billable: boolean,
                            pricing_model: string,
                            category: string
                        }
                    }
                ];
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
            field: string;
        }>;
    }>;
}
