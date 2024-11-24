import moment from "moment";
import { Database } from "../database/Database";
import sql from "../database/sql";
import { TplEvent } from "../models/tpl_event";
import { vw_brothers_active_to_generate } from "../views/vw_brothers_active_to_generate";
import { TplDayTime } from "../models/tpl_day_time";
import { brother } from "../models/brother";
import 'moment/locale/pt-br';
interface TplEventsParams {
    initial_date?: Date,
    final_date?: Date,
}

export class TplEventsService<T = TplEvent> extends Database<T> {
    constructor() {
        super({ options: { table: 'tpl_events' } })
    }

    async getEvents({ initial_date, final_date }: TplEventsParams) {
        try {
            if (!initial_date || !final_date) {
                console.log('Buscando todos os eventos...')
                const events: TplEvent[] = await sql`
                select * from ${sql(this.table)}
            `;
                return events;
            }
            console.log('Buscando eventos entre as datas informadas...', initial_date, final_date)
            const events: TplEvent[] = await sql`
            select * from ${sql(this.table)} where event_date between ${initial_date.toString()} and ${final_date.toString()}
        `;
            return events.map(x => ({ ...x, event_date: moment(x.event_date).add(3, 'hours').toDate() })).sort((a, b) => a.event_date.getTime() - b.event_date.getTime());
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    async generateEvents({ initial_date, final_date }: TplEventsParams) {
        try {
            console.log('Gerando eventos...')
            console.log('periodo: ', initial_date, final_date)
            const brothers_active: vw_brothers_active_to_generate[] = await sql`select * from ${sql('vw_brothers_active_to_generate')}`;
            if (!brothers_active) return


            const qt_days = moment(final_date).diff(initial_date, 'days') + 1;


            const times: TplDayTime[] = await sql`select * from ${sql('tpl_day_time')}`


            let brother_added_id: number[] = []

            const tpl_events: TplEvent[] = []

            for (let i = 0; i < qt_days; i++) {
                const event_date = moment(initial_date).add(i, 'days').format('YYYY-MM-DD'); // yyyy-mm-dd
                let event_date_week = moment(event_date).format('ddd').toLowerCase(); // dom seg ter qua qui sex sab
                if (event_date_week == 'sab') event_date_week = 'sáb';

                console.log('Buscando horários do dia: ', event_date, event_date_week, qt_days)
                const times_day_ids = times.filter(x => x.day_time.trim().toLowerCase().startsWith(event_date_week.trim().toLowerCase())).map(x => x.id) // 1,2,3,4,5,6,7 etc
                if (times_day_ids.length == 0) continue;


                console.log('Gerando eventos para o dia: ', event_date, event_date_week, times_day_ids.length)

                const brothers_ready_for_this_day = brothers_active.filter(x => x.tpl_times?.split(',').some(x => times_day_ids.includes(Number(x))));
               
                if (brothers_ready_for_this_day.length == 0) continue;
             
                const qt_times = times_day_ids.length // quntidade de horário para ser gerados

                /*      console.log(times_day_ids) */

                for (let horario_index = 0; horario_index < qt_times; horario_index++) {

                    let qt_pairs = 0;

                    //quantidade de duplas por horário
                    switch (event_date_week) {
                        case 'seg':
                            qt_pairs = 1;
                            break;
                        case 'qua':
                            qt_pairs = 2;
                            break;
                        case 'sáb':
                            qt_pairs = 2;
                            break;
                        case 'dom':
                            qt_pairs = 1;
                            break;
                        default:
                            qt_pairs = 0;
                            break;
                    }
                    for (let pair_index = 0; pair_index < qt_pairs; pair_index++) {

                        let pair = {
                            brother_id_1: 0,
                            brother_id_2: 0
                        };

                        let tentatives = 20;
                        while (pair.brother_id_1 == 0 || pair.brother_id_2 == 0) {
                            const brothers_avaliable_for_this_hour = brothers_ready_for_this_day.filter(x => x.tpl_times?.split(',').includes(String(times_day_ids[horario_index])))

                            console.log(brothers_avaliable_for_this_hour.length == 0 ? `sem brothers disponíveis para o horário: ${times_day_ids[horario_index]} ` : `brothers disponíveis para o horário ${times_day_ids[horario_index]}`)
                            const brother_1 = brothers_avaliable_for_this_hour[Math.floor(Math.random() * brothers_avaliable_for_this_hour.length)];
                            const brother_2 = brothers_avaliable_for_this_hour[Math.floor(Math.random() * brothers_avaliable_for_this_hour.length)];
                            if (times_day_ids[horario_index] == 1) console.log(brothers_ready_for_this_day)

                            if (!brother_1 && !brother_2) {
                                console.log('sem brothers disponíveis para o horário: ' + times_day_ids[horario_index])
                                break;
                            }

                            if ((!brother_1 && brother_2) || (brother_1 && !brother_2)) {
                                console.log('encontrou apeneas 1 brother das duplas disponivel')
                                continue;
                            }

                            if (brother_1?.id == brother_2?.id) continue;

                            if (brother_added_id.includes(brother_1?.id) || brother_added_id.includes(brother_2?.id)) {
                                tentatives--;
                                if (tentatives > 0) {
                                    continue;
                                } else {
                                    brother_added_id = [];
                                }

                            }

                            if (brother_1.sex == brother_2.sex) {
                                pair.brother_id_1 = brother_1?.id;
                                pair.brother_id_2 = brother_2?.id;
                                brother_added_id.push(brother_1?.id, brother_2?.id);
                                break;
                            } else {
                                if (brother_1?.relatives?.split(',').includes(String(brother_2?.id))) {
                                    pair.brother_id_1 = brother_1?.id;
                                    pair.brother_id_2 = brother_2?.id;
                                    brother_added_id.push(brother_1?.id, brother_2?.id);
                                    break;
                                }
                            }

                        }

                        if (pair.brother_id_1 == 0 || pair.brother_id_2 == 0) {
                            console.log('erro ao gerar evento')
                            break;
                        }
                        const event: TplEvent = {
                            event_date: moment(event_date).toDate(),
                            tpl_day_time_id: times_day_ids[horario_index],
                            pair: [pair.brother_id_1, pair.brother_id_2].sort().join(','),
                            created_at: new Date(),

                        }
                        tpl_events.push(event)

                    }

                }

            }

            if (tpl_events.length > 0 && initial_date && final_date) {
                console.log("deletando o periodo antigo..." + initial_date + " a " + final_date)
                /*      console.log(tpl_events) */
                const deleted_events = await sql`
                     delete from ${sql('tpl_events')} 
                    where event_date between ${moment(initial_date).format('YYYY-MM-DD')} and ${moment(final_date).format('YYYY-MM-DD')} 
                 `;

                console.log(deleted_events.count + " linhas deletadas")
                console.log("inserindo os eventos no banco de dados...")
                const created = await sql`
                     insert into ${sql('tpl_events')} ${sql(tpl_events)} 
                     returning *
                 `;
                console.log(created.count + " linhas inseridas")
            } else {
                if (tpl_events.length == 0) {
                    console.log("nenhum evento gerado")
                } else console.log("initial_date ou final_date estão indefinidos.");
            }


            return tpl_events
        } catch (err) {
            console.log(err)
            throw err
        }

    }

    async convertEventsToFront(Tpl_Events?: TplEvent[]) {
        if (!Tpl_Events) return [];



        const times: TplDayTime[] = await sql`select * from ${sql('tpl_day_time')}`
        const brothers: brother[] = await sql`select * from ${sql('congregations_brothers')}`

        const processed_events_days = new Set<string>();

        Tpl_Events.flatMap((event, index) => {

            if (processed_events_days.has(moment(event.event_date).format('dddd, DD [de] MMMM [de] YYYY'))) return null;
            else processed_events_days.add(moment(event.event_date).format('dddd, DD [de] MMMM [de] YYYY'))
        }).filter(x => x != null)


        const retorno: { date: string, periods: { time: string, pairs: { brother_id: brother, support: brother }[] }[] }[] = []

        processed_events_days.forEach((day: string) => {

            let periods: {
                time: string,
                pairs: ({
                    brother: string | undefined;
                    support: string | undefined;
                } | null)[]
            }[] = []
            const times_day_ids = times.filter(x => x.day_time.toUpperCase().startsWith(day.toUpperCase().substring(0, 3))).map(x => x.id) // 1,2,3,4,5,6,7 etc

            const qt_times = times_day_ids.length

            for (let horario_index = 0; horario_index < qt_times; horario_index++) {
                const period = {
                    time: times.find(x => x.id == times_day_ids[horario_index])?.day_time ?? times_day_ids.find(x => x == times_day_ids[horario_index])?.toString() ?? '',
                    pairs: Tpl_Events.filter(x => moment(x.event_date).format('dddd, DD [de] MMMM [de] YYYY') == day && x.tpl_day_time_id == times_day_ids[horario_index]).map(event => {

                        if (!event.pair) return null

                        const pair = event?.pair?.split(',').map(x => parseInt(x));

                        const brother_1 = brothers.find(x => x.id == pair[0]);
                        const brother_2 = brothers.find(x => x.id == pair[1]);
                        return {
                            brother: brother_1?.brother_name,
                            support: brother_2?.brother_name
                        }
                    })
                }
                if (period) periods.push(period)
            }

            retorno.push({ date: day, periods: periods as any })
        })

        /*    console.log(processed_events_days) */

        return retorno.filter(x => x.periods.length > 0)
    }
}