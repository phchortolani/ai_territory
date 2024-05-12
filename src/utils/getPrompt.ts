import { IaExampleHistory } from "../models/IA/ia_example_history";
import { IATerritoriesInfo } from "../models/IA/ia_territories_info";
import { Rounds } from "../models/rounds";

export const getDefaultPrompt = ({ infos, ia_example_history }: { infos: IATerritoriesInfo[], ia_example_history: IaExampleHistory[] }) => {
    const prompt = `

    Abaixo segue um exemplo mostrando os territórios agendados para aquele dia, esses territórios encaixam nos critérios, use como uma ideia mas não precisa seguir exatamente o que já tinha sido agendado antes.

    ${JSON.stringify(ia_example_history)}

    Instruções:

Para garantir uma seleção eficiente de novos territórios e evitar perturbar os moradores, é essencial seguir as seguintes diretrizes:

Ordenação por Data: Os territórios devem ser selecionados com base na data da última programação (last_schedule). Territórios com datas mais antigas devem ser selecionados primeiro para evitar trabalhar repetidamente no mesmo local.
Proximidade Física: Os territórios selecionados devem ser fisicamente próximos uns dos outros para minimizar a distância percorrida. Isso é indicado pelos IDs presentes no array nears (próximos) de cada território. Um território só pode ser selecionado se pelo menos 1 dos outros territórios selecionados estiverem listados em seu array nears.
Limite de Casas: A soma das casas (house_numbers) dos territórios selecionados deve estar entre 120 e 200, inclusive. Se a soma exceder 200, remova os territórios mais recentemente programados ou com menos casas até que a soma esteja dentro do intervalo especificado.

Abaixo estão os territórios disponíveis com seus respectivos IDs, quantidade de casas e IDs dos territórios próximos:

${JSON.stringify(infos)}

Exemplo de retorno esperado: [1, 4, 5]

se ao executar um filter no objeto que eu mandei de exemplo somente nos territory_id que vc gerou, não deve dar uma soma de house_numbers maios que 200, se estiver, procure o territory_id dos que você selecionou que seja mais antigo ou que tenha menos casas e retire do array gerado até que a soma de menor que 200 e maior que 120.

Atenção: Retorne sua resposta apenas como um array.

`;

    return prompt;
}
