import moment from "moment";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { ISchedule } from "../dtos/schedule";
import { Rounds } from "../models/rounds";
import { ReturnSolicitationDto } from "../dtos/returnSolicitation";
import 'moment/locale/pt-br';
import { RoundsDto } from "../dtos/roundsDto";

export class RoundsService<T = Rounds> extends Database<T> {

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

    async ToSchedule(schedule: ISchedule, leader_id: number) {
        try {
            let last_day: Date | null = moment(schedule.first_day).toDate();

            if (moment(schedule.first_day).isoWeekday() !== 6) {
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

            const ToScheduleRounds = schedule.territories?.map(territory_id => {
                const obj = {
                    territory_id,
                    first_day: schedule.first_day,
                    leader: leader_id,
                    expected_return,
                    last_day,
                    status: 2
                } as Rounds
                if (schedule.campaign_id) {
                    obj.campaign = schedule.campaign_id
                }
                return obj
            })

            if (ToScheduleRounds && ToScheduleRounds.length > 0) {
                console.log('Efetuando o agendamento...')
                const RoundsCreated: Rounds[] = await sql`insert into ${sql(this.table)} ${sql(ToScheduleRounds)} RETURNING *`

                if (!!RoundsCreated) {
                    console.log(`${RoundsCreated?.length ?? 0} Territórios agendados a partir de ${moment(schedule.first_day).format("DD-MM-YYYY")} ✅ 🎉`)

                    const day = moment(schedule.first_day).utc().format('dddd').toLowerCase().charAt(0).toUpperCase() + moment(schedule.first_day).utc().format('dddd').slice(1);

                    let formattedData = `*${day}*\n`

                    formattedData += `1ª Saída: *${moment(RoundsCreated[0].first_day).utc().format('DD-MM-YYYY')}* | 2ª Saída: *${moment(RoundsCreated[0].last_day).utc().format('DD-MM-YYYY')}*\n`;
                    formattedData += `Territórios: *${RoundsCreated.map((rounds) => rounds.territory_id).join(', ')}*\n `;
                    formattedData += '----\n';
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
                                name: devolution.leader_name
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


}