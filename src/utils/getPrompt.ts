import { IATerritoriesInfo } from "../models/IA/ia_territories_info";

export const getDefaultPrompt = ({ infos }: { infos: IATerritoriesInfo[] }) => {
    const prompt = `

    Instruções:

Para garantir uma seleção eficiente de novos territórios e evitar perturbar os moradores, é essencial seguir as seguintes diretrizes:

Ordenação por Data: Os territórios devem ser selecionados com base na data da última programação (last_schedule). Territórios com datas mais antigas devem ser selecionados primeiro para evitar trabalhar repetidamente no mesmo local.
Proximidade Física: Os territórios selecionados devem ser fisicamente próximos uns dos outros para minimizar a distância percorrida. Isso é indicado pelos IDs presentes no array nears (próximos) de cada território. Um território só pode ser selecionado se todos os outros territórios selecionados estiverem listados em seu array nears e vice-versa.
Limite de Casas: A soma das casas (house_numbers) dos territórios selecionados deve estar entre 120 e 200, inclusive. Se a soma exceder 200, remova os territórios mais recentemente programados ou com menos casas até que a soma esteja dentro do intervalo especificado.

Abaixo estão os territórios disponíveis com seus respectivos IDs, quantidade de casas e IDs dos territórios próximos:

${JSON.stringify(infos)}

Exemplo de retorno esperado: [1, 4, 5]

Atenção: Retorne sua resposta apenas como um array.
`;

    return prompt;
}
