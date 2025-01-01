// Message interface (pode ir em um arquivo separado, como message.interface.ts)
export interface IWhatsappMessage {
    message_id: string;     // ID da mensagem
    from_number: string;    // Número de quem enviou
    timestamp: string;      // Timestamp da mensagem
    message_text?: string;  // Texto da mensagem (caso seja uma mensagem de texto)
    message_type: string;   // Tipo da mensagem (por exemplo, "text")
    received_at?: Date;   // Data e hora que a mensagem foi recebida no sistema,
    status?: string;        // Status da mensagem (por exemplo, "sent")
}