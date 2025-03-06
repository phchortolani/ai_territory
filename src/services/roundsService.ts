import moment from "moment";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { ISchedule } from "../dtos/schedule";
import { Rounds } from "../models/rounds";
import { ReturnSolicitationDto } from "../dtos/returnSolicitation";
import 'moment/locale/pt-br';
import { RoundsDto } from "../dtos/roundsDto";
import { S13, S13_Item } from "../dtos/s13";
import { getAI } from "./geminiService";
import { ia_info_territory } from "../models/territory";
import { IATerritoriesInfo } from "../models/IA/ia_territories_info";
import { checkNearTerritories, checkNearTerritoriesV2, checkQuantityIsValid, getNear } from "../utils/getNear";
import { getDefaultPrompt } from "../utils/getPrompt";
import { IaExampleHistory } from "../models/IA/ia_example_history";
import { WhatsappService } from "./whatsappService";
import { randomUUID } from 'crypto'
import { Leaders } from "../models/leaders";

interface info_send_grid_devolution {
    name: string,
    leaders: { leader_name: string }[]
}

interface vw_house_not_allowed {
    id: number,
    territory_id: number,
    house_number?: number,
    description: string,
    obs?: string
}

export const telefone_ph = '+5511957886697'
export class RoundsService<T = Rounds> extends Database<T> {
    serviceWhatsapp: WhatsappService = new WhatsappService()

    constructor() {
        super({ options: { table: 'rounds' } })
    }

    async MarkAsDone(territory_ids: number[], leader_id: number) {
        try {
            console.log('Marcando os territórios como feitos: ' + territory_ids.join(',') + '...')
            const markedAsDone = await sql`update ${sql(this.table)} set status = 1 
            WHERE expected_return <= current_date AND status = 2 AND leader = ${leader_id}
            and territory_id in ${sql(territory_ids)}`;
            console.log(markedAsDone.count + " linhas atualizadas")
            console.log('Marcando os territórios expirados restantes não feitos como não feitos...')
            const markedAsNotDone = await sql`update rounds set status = 3 
            WHERE expected_return <= current_date AND status = 2 AND leader = ${leader_id}`;
            console.log(markedAsNotDone.count + " linhas atualizadas")
            if (markedAsDone.count > 0) {
                console.log('Atualização de rodadas realizadas com sucesso! ✅🎉')
            } else console.log('Nenhuma rodada atualizada.')

            return markedAsDone.count > 0;
        } catch (err) {
            console.log(err)
            throw err
        }
    }
    async MarkRoundAsDone(round_id: string, status: number) {
        try {
            console.log('Marcando a rodada: ' + round_id + ' como feita...')

            const markedAsDone = await sql`update ${sql(this.table)} set status = ${status} 
            WHERE id = ${round_id}`;
            console.log(markedAsDone.count + " linhas atualizadas")
            if (markedAsDone.count > 0) {
                console.log('Atualização de rodadas realizadas com sucesso! ✅🎉')
            } else console.log('Nenhuma rodada atualizada.')

            return markedAsDone.count > 0;
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    async getScheduleByStatus(status: string) {
        try {

            if (status?.length > 2) return

            const Schedule: RoundsDto[] = await sql`select r.id, r.first_day, r.last_day ,r.expected_return ,l."name" as leader,c."name" as campaign, territory_id , 
            st."name" as status
            from rounds r 
            left join leaders l on l.id = r.leader 
            left join campaign c on c.id  = r.campaign 
            left join status_territory st on st.id = r.status 
            where status is not null ${status ? sql`and status = ${status}` : sql``}`;

            return Schedule;
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    async getS13() {
        try {

            const s13_list: S13_Item[] = await sql`select * from vw_base_s13`;

            const s13_group = [] as S13[];

            s13_list.forEach(s13_item => {
                const current_item_index = s13_group.findIndex(x => x.id == s13_item.territory_id)
                if (current_item_index > -1) {
                    s13_group[current_item_index].rounds.push(s13_item)
                } else s13_group.push({ id: s13_item.territory_id, rounds: [s13_item] })
            })


            return s13_group;
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    async getRoundsByRangeofDate(days: number): Promise<IATerritoriesInfo[]> {

        const ia_info_territory = await sql`	select t.id,vlj.last_schedule,t.house_numbers from vw_last_job vlj 
                join territories t on vlj.territory_id = t.id where (current_date - vlj.last_schedule) >= ${days} order by vlj.last_schedule`

        return ia_info_territory.map(territory => {
            return { id: territory.id, house_numbers: territory.house_numbers, nears: getNear(territory.id), last_schedule: territory.last_schedule }
        })

    }

    async ToScheduleRaiz(schedule: ISchedule, leader_id: number) {

        /*   let last_day: Date | null = moment(schedule.first_day).toDate();
  
          if (moment(schedule.first_day).isoWeekday() !== 6 && schedule.repeat_next_week) {
              last_day = moment(schedule.first_day).add(7, 'days').toDate();
          }
  
          const expected_return = last_day;
  
          if (schedule.territories?.some(x => x == 0)) throw new Error('O agendamento possui territórios com o ID 0');
  
          const rounds = ((await this.list()) as Rounds[]).filter(x => schedule.territories?.includes(x.territory_id));
  
          const DataInRange = rounds.filter(x =>
              moment(x.first_day).isSame(new Date(schedule.first_day)) ||
              moment(x.last_day).isSame(last_day) ||
              moment(x.last_day).isSameOrAfter(new Date(schedule.first_day))
              || x.status == 2)
              .map(x => x.territory_id)
  
  
          if (DataInRange.length > 0) {
              console.log('Não foi possível seguir com o agendamento.')
              throw new Error('O agendamento não pode ser concluído visto que esses territórios já possuem agendamento nessa mesma data. Territórios: ' + DataInRange.join(','));
          }
   */

        const available_territories = await this.getRoundsByRangeofDate(15)


        if (!schedule.territories) return null;

        console.log(available_territories)

        // pegar a partir de 15 dias


        //criar uma lista de lista de retonos 

        //criar método para pegar o primeiro território e verificar se os próximos territórios são proximos

        // caso o proximo território for próximo adicione ele na lista 1

        //caso não for proximo adicione ele na lista 2 e repita o processo para ele

        // a primeira lista a ter mais de 120 casas ja será retornada.


        // Criar uma lista 

    }

    async ToSchedule(schedule: ISchedule, leader_id: number) {

        try {
            let last_day: Date | null = moment(schedule.first_day).toDate();

            if (moment(schedule.first_day).isoWeekday() !== 6 && schedule.repeat_next_week) {
                last_day = moment(schedule.first_day).add(7, 'days').toDate();
            }

            const expected_return = last_day;

            if (schedule.territories?.some(x => x == 0)) throw new Error('O agendamento possui territórios com o ID 0');

            const rounds = ((await this.list()) as Rounds[]).filter(x => schedule.territories?.includes(x.territory_id));

            const DataInRange = rounds.filter(x =>
                moment(x.first_day).isSame(new Date(schedule.first_day)) ||
                moment(x.last_day).isSame(last_day) ||
                moment(x.last_day).isSameOrAfter(new Date(schedule.first_day))
                || x.status == 2)
                .map(x => x.territory_id)


            if (DataInRange.length > 0) {
                console.log('Não foi possível seguir com o agendamento.')
                throw new Error('O agendamento não pode ser concluído visto que esses territórios já possuem agendamento nessa mesma data. Territórios: ' + DataInRange.join(','));
            }

            let iaTerritoriesInfo: IATerritoriesInfo[] = []

            if (!schedule.not_use_ia) {
                const available_territories: ia_info_territory[] = await sql`	select t.id,vlj.last_schedule,t.house_numbers from vw_last_job vlj 
                join territories t on vlj.territory_id = t.id where (current_date - vlj.last_schedule) >= 10 order by vlj.last_schedule`
                // aqui a IA entra em ação

                iaTerritoriesInfo = available_territories.map(territory => {
                    return { id: territory.id, house_numbers: territory.house_numbers, nears: getNear(territory.id), last_schedule: territory.last_schedule }
                })

                schedule.territories = undefined;
                let interacoes = 0;


                const ia_example_history: IaExampleHistory[] = await sql`SELECT
                to_char(r.first_day, 'YYYY-MM-DD') AS first_day,
                string_agg(r.territory_id::text, ',') AS territories_id
            FROM
                rounds r
            WHERE
                extract(dow from r.first_day) <> 0 -- Exclui os dias que são domingo
            GROUP BY
                r.first_day
            ORDER BY
                first_day DESC`

                let perfect_prompt = getDefaultPrompt({ infos: iaTerritoriesInfo, ia_example_history })

                while (!schedule.territories) {
                    interacoes++;
                    console.log('Tentativa Nº ', interacoes)

                    const territories_generated = await getAI({ prompt: perfect_prompt })
                    //continua o fluxo
                    const territories_array = eval(territories_generated) as Array<number>

                    const checkNear = checkNearTerritoriesV2(territories_array)
                    if (checkNear.result) {
                        const checkQT = checkQuantityIsValid(territories_array, iaTerritoriesInfo, 120, 200)
                        if (checkQT.result) {
                            schedule.territories = territories_array.sort((a, b) => a - b)
                            break;
                        } else {
                            console.log(checkQT.msg)
                            perfect_prompt = `Foi solicitado esse prompt: ${perfect_prompt} porém ${checkQT.msg}. gere novamente por favor respeitando todas as regras já explicadas.`
                        }
                    } else {
                        console.log(checkNear.msg)
                        perfect_prompt = `Foi solicitado esse prompt: ${perfect_prompt} porém ${checkNear.msg}. gere novamente por favor respeitando todas as regras já explicadas.`
                    }
                    if (interacoes == 40) break;
                }
            }


            if (!schedule.territories) return null;




            const uuid = randomUUID()

            console.log('uuid', uuid)

            const ToScheduleRounds = schedule.territories?.map(territory_id => {
                const obj = {
                    territory_id,
                    first_day: moment(schedule.first_day).toDate(),
                    leader: leader_id,
                    expected_return,
                    last_day,
                    status: 2,
                    uid: uuid
                } as Rounds
                if (schedule.campaign_id) {
                    obj.campaign = schedule.campaign_id
                }
                return obj
            })

            if (ToScheduleRounds && ToScheduleRounds.length > 0) {
                console.log('Efetuando o agendamento...')
                const territories_infos: ia_info_territory[] = await sql`	select t.id,vlj.last_schedule,t.house_numbers from vw_last_job vlj 
                join territories t on vlj.territory_id = t.id where vlj.territory_id in ${sql(schedule.territories)} order by vlj.last_schedule`

                const RoundsCreated: Rounds[] = await sql`insert into ${sql(this.table)} ${sql(ToScheduleRounds)} RETURNING *`
                if (!!RoundsCreated) {
                    console.log(`${RoundsCreated?.length ?? 0} Territórios agendados a partir de ${moment(schedule.first_day).format("DD-MM-YYYY")} ✅ 🎉`)

                    const quantity_house: any = territories_infos.reduce((acc, cur) => acc += cur?.house_numbers ?? 0, 0)

                    const day = moment(schedule.first_day).utc().format('dddd').toLowerCase().charAt(0).toUpperCase() + moment(schedule.first_day).utc().format('dddd').slice(1);

                    let formattedData = `*${day}*\n`;
                    const first_day = moment(RoundsCreated[0].first_day).utc().format('DD-MM-YYYY');
                    const last_day = moment(RoundsCreated[0].last_day).utc().format('DD-MM-YYYY');

                    formattedData += `Saída: *${first_day}* ${last_day != first_day ? `| 2ª Saída: *${last_day}*` : ''}\n\n`;
                    formattedData += `*Territórios:* \n 🗺️ *${RoundsCreated.map((rounds) => rounds.territory_id).join(', ')}*\n\n`;

                    formattedData += `*Informações adicionais:*\n`;

                    if (territories_infos.length > 0) {
                        territories_infos.filter(x => schedule.territories?.includes(x.id)).sort((a, b) => a.id - b.id).forEach(info => {
                            formattedData += `🗓️ • T.${info.id} - Última vez trabalhado: *${moment(info.last_schedule).utc().format('DD-MM-YYYY')}*\n`;
                        });
                    }

                    formattedData += `\n*Quantidade de casas:*\n 🏘️ *${quantity_house}*\n`;

                    const houses_not_allowed = await this.getInfoHouseNotAllowed(schedule.territories);
                    if (houses_not_allowed.length > 0) {
                        formattedData += `\n⚠️ *Atenção* ⚠️\n`;
                        formattedData += `_Os seguintes casas não podem ser trabalhadas:_ \n\n`;

                        // Agrupar casas por território
                        const groupedHouses = houses_not_allowed.reduce((acc: any, x) => {
                            if (!acc[x.territory_id]) acc[x.territory_id] = [];
                            acc[x.territory_id].push(x);
                            return acc;
                        }, {});

                        // Iterar sobre cada território e suas casas
                        Object.keys(groupedHouses).forEach(territoryId => {
                            const territoryHouses = groupedHouses[territoryId] as vw_house_not_allowed[];
                            formattedData += `*T.${territoryId} - ${territoryHouses[0].description || ''}:*\n\n`; // Usando o nome do território se disponível
                            territoryHouses.forEach(house => {
                                formattedData += `🚫 _Nº ${house.house_number ?? 'S/N'}${house.obs ? ` - *${house.obs}*` : ''}_ \n`;
                            });
                            formattedData += '\n';
                        });
                    }

                    const leader_info: Leaders[] = await sql`select * from leaders where id = ${leader_id} limit 1`;
                    let leader_selected = leader_info[0]

                    if (!leader_selected) throw new Error('Leader selecionado nao encontrado')
                    if (!leader_selected.telefone) leader_selected.telefone = telefone_ph;

                    const sended_start_info = await this.serviceWhatsapp.sendRoundInfoStartMessage(leader_selected?.telefone, leader_selected?.name)

                    if (sended_start_info) {
                        console.log('Mensagem de início enviada para o irmão... 📲📩')
                        console.log('Enviando imagens...')
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const send_images = await this.serviceWhatsapp.sendMultipleImages(leader_selected?.telefone, schedule.territories.map(territory_id => ({ url: `https://aitab.lanisystems.com.br/${territory_id}.png` })));

                        if (send_images) {
                            console.log('Imagens enviadas com sucesso! 📲📩')
                            console.log('Enviando dados com o agendamento... 📲📩')

                            const send_schedule = await this.serviceWhatsapp.sendMessage(leader_selected?.telefone, formattedData)

                            if (send_schedule) {
                                console.log('Dados enviados com sucesso! 📲📩')
                                if (leader_selected.telefone != telefone_ph) {
                                    formattedData += `\n\n*Os dados acima foram enviados para o irmão(ã): ${leader_selected.name} no telefone *${leader_selected.telefone}*`
                                    formattedData += `\n\n*O status de envio das imagens é de "*${send_images ? 'Sucesso' : 'Erro'}"*.\n\n*O status de envio dos dados de agendamento é de "*${send_schedule ? 'Sucesso' : 'Erro'}*"*\n`
                                    const send_status = await this.serviceWhatsapp.sendMessage(telefone_ph, formattedData)
                                    if (send_status) {
                                        console.log('Dados de confirmação enviados com sucesso! 📲📩')
                                    } else console.log('Erro ao enviar dados para o telefone de backup! 📲📩')
                                }
                            }
                            else console.log('Erro ao enviar dados! 📲📩')

                        }

                    }

                    return formattedData
                }
                console.log('Nenhuma rodada criada! 🙈❌')
                return null
            }

            return null;

        } catch (err) {
            throw err
        }
    }

    async getReturnSolicitation() {
        try {
            const data: { first_day: Date, last_day: Date, leader_id: number, leader_name: string, territory_id: number }[] = await sql`select first_day, last_day ,l.id as leader_id, l."name" as leader_name, territory_id  from rounds r
            join leaders l on l.id = r.leader  
            where expected_return <= current_date and status = 2 order by first_day`

            const devolution_list_leaders = data.map(x => x.leader_id).reduce((acc: number[], curr: number) => {
                if (!acc.some(dado => dado == curr)) {
                    acc.push(curr)
                }
                return acc
            }, [])
            const devolution_list: ReturnSolicitationDto[] = []

            devolution_list_leaders.forEach(leader_id => {


                const devolutions = data.filter(d => d.leader_id == leader_id)

                devolutions.forEach(devolution => {

                    if (devolution_list.some(a => a.leader.id == devolution.leader_id)) {

                        const current_devolution_index = devolution_list.findIndex(a => a.leader.id == leader_id && a.devolutions.some(x => moment(devolution.first_day).isSame(x.first_day)))
                        const current_devolution = devolution_list[current_devolution_index]?.devolutions.find(x => moment(devolution.first_day).isSame(x.first_day))

                        if (current_devolution) {
                            current_devolution.territories.push({ id: devolution.territory_id })
                        } else {

                            devolution_list.find(a => a.leader.id == devolution.leader_id)?.devolutions.push({
                                first_day: devolution.first_day,
                                last_day: devolution.last_day,
                                day: moment(devolution.first_day).utc().format('dddd'),
                                territories: [{
                                    id:
                                        devolution.territory_id
                                }]

                            })
                        }
                    } else {

                        devolution_list.push({
                            leader: {
                                id: devolution.leader_id,
                                name: devolution.leader_name,
                            },
                            devolutions: [{
                                first_day: devolution.first_day,
                                last_day: devolution.last_day,
                                day: moment(devolution.first_day).utc().format('dddd'),
                                territories: [{
                                    id:
                                        devolution.territory_id
                                }]
                            }]

                        })
                    }
                })
            })
            return devolution_list

        } catch (err) {
            throw err
        }
    }

    async getRoundByUUID(uuid: string): Promise<Rounds[]> {
        return await sql`select * from rounds where uid = ${uuid}`
    }

    async getInfoHouseNotAllowed(territories_id: number[]): Promise<vw_house_not_allowed[]> {
        const territories: vw_house_not_allowed[] = await sql`select * from vw_house_not_allowed where territory_id in ${sql(territories_id)}`
        if (territories.length == 0) return []

        return territories
    }

}