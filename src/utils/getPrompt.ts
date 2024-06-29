import { IaExampleHistory } from "../models/IA/ia_example_history";
import { IATerritoriesInfo } from "../models/IA/ia_territories_info";
import { Rounds } from "../models/rounds";

export const getDefaultPrompt = ({ infos, ia_example_history }: { infos: IATerritoriesInfo[], ia_example_history: IaExampleHistory[] }) => {
    /*     const prompt = `
    
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
    
    `; */

    const prompt = `

Abaixo segue um exemplo mostrando os territórios agendados anteteriormente, esses territórios encaixam nos critérios, use como uma ideia mas não precisa seguir exatamente o que já tinha sido agendado antes.

${JSON.stringify(ia_example_history)}

Instruções:

Abaixo estão os territórios disponíveis com seus respectivos IDs, quantidade de casas e IDs dos territórios próximos para você gerar com base nela:

${JSON.stringify(infos)}

antes de você gerar o array, siga as regras:

1 - ordene os territórios por last_schedule, sendo que devemos iniciar do mais antigo para o mais recente.
2 - para cada territory_id, verfique se o proximo territory_id da lista que eu mandei inclui no nears do territory_id atual. se tiver, adicione-o ao array gerado.
3 - se o próximo territory_id não incluir no nears do territory_id atual, faça uma nova geração em paralelo respeitando a as regras acima também. (faça isso respectivamente para cada territory_id que não tiver no próximo)
4 - a primeira lista gerada a ter mais de 120 casas (house_numbers) somando seus houses_numbers, retorne esse array.

a ideia é somar os house_numbers de cada territorio e se somar mais de 120 casas e menos que 200 casas, retorne esse array, mas só retorne esse array se pelo menos um dos territórios selecionados estiver listado em seu array nears.

se somar mais de 200 casas, retire os territórios mais recentemente programados ou com menos casas até que a soma esteja dentro do intervalo especificado. jamais a soma de house_number pode ser maior que 200.

 Atenção o seu retorno só pode ser um array de territory_id. 
 Exemplo de retorno esperado: [1, 4, 5]


 GEMINI, SOMENTE RETORNE COM O ARRAY DE TERRITORY_ID.

`

    return prompt;
}
