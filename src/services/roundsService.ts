import moment from "moment";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { ISchedule } from "../dtos/schedule";
import { Rounds } from "../models/rounds";


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

    async ToSchedule(schedule: ISchedule, leader_id: number) {
        try {
            const last_day = moment(schedule.first_day).add(7, 'days').toDate();
            const expected_return = last_day;

            if (schedule.territories?.some(x => x == 0)) throw new Error('O agendamento possui territórios com o ID 0');

            const rounds = ((await this.list()) as Rounds[]).filter(x => schedule.territories?.includes(x.territory_id));

            const DataInRange = rounds.filter(x =>
                moment(x.first_day).isSame(new Date(schedule.first_day)) ||
                moment(x.last_day).isSame(last_day) ||
                moment(x.last_day).isSameOrAfter(new Date(schedule.first_day)))
                .map(x => x.territory_id)


            if (DataInRange.length > 0) {
                console.log('Não foi possível seguir com o agendamento.')
                throw new Error('O agendamento não pode ser concluído visto que esses territórios já possuem agendamento nessa mesma data. Territórios: ' + DataInRange.join(','));
            }

            const ToScheduleRounds = schedule.territories?.map(territory_id => {
                return {
                    territory_id,
                    first_day: schedule.first_day,
                    leader: leader_id,
                    expected_return,
                    last_day,
                    status: 2,
                    campaign: schedule.campaign_id
                } as Rounds
            })

            if (ToScheduleRounds && ToScheduleRounds.length > 0) {
                console.log('Efetuando o agendamento...')
                const created = await sql`insert into ${sql(this.table)} ${sql(ToScheduleRounds)}`
                console.log(`${created.count} Territórios agendados a partir de ${moment(schedule.first_day).format("DD-MM-YYYY")} ✅ 🎉`)
                return created.count > 0
            }

            return false;

        } catch (err) {
            throw err
        }
    }



}