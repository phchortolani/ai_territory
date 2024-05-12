export interface Amanda {
    id: number;
    data_evento: Date | null;
    ip: string | null;
    email: string | null;
    senha: string | null;
    solicitante?: string | null;
}

export type DadosBasicosDto = {
    nome: string;
    email: string;
    telefone: string;
    documento: string;
}