import { FastifyInstance } from 'fastify';
import { RoundsService } from '../services/roundsService';
import { Rounds } from '../models/rounds';
import { Campaign } from '../models/campaign';
import { ISchedule } from '../dtos/schedule';
import { ReturnSolicitationDto } from '../dtos/returnSolicitation';
import moment from 'moment';
import { UserLogService } from '../services/userLogService';
import { User } from '../models/user';

const path = '/rounds'

export default function RoundsRoutes(server: FastifyInstance, RoundsService: RoundsService) {
    server.post(path, async (request, reply) => {
        await request.jwtVerify();
        const round = request.body as Rounds
        const round_saved = await RoundsService.create(round)
        if (round_saved) return reply.status(201).send(round_saved)
        return reply.status(502).send(`Não foi possível salvar a rodada.`)
    })

    server.put(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const round = request.body as Rounds
        const { id } = request.params as any
        if (!id) return reply.status(400).send('A rodada informada não possui ID no GET.')

        const round_updated = await RoundsService.update(id, round)
        if (round_updated) return reply.status(204).send()
        return reply.status(502).send(`Não foi possível atualizar a rodada ${round?.id}.`)
    })

    server.delete(`${path}/:id`, async (request, reply) => {
        await request.jwtVerify();
        const { id } = request.params as any;
        const hasDeleted = await RoundsService.delete(id)
        if (hasDeleted) return reply.status(200).send()
        return reply.status(502).send()
    })

    server.get(`${path}/:id?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { id } = request.params as any;
            const rounds = await RoundsService.list(id);
            return reply.status(200).send(rounds)
        } catch (err) {
            return reply.status(500).send(err)
        }

    })

    server.get(`${path}/schedule/:status?`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { status } = request.params as any;
            let rounds = await RoundsService.getScheduleByStatus(status);

            rounds = rounds?.map(x => {
                return {
                    ...x, first_day: moment(x.first_day).add(4, 'hours').toDate(),
                    last_day: moment(x.last_day ?? x.first_day).add(4, 'hours').toDate(),
                    expected_return: moment(x.expected_return).add(4, 'hours').toDate()
                }
            })
            return reply.status(200).send(rounds)
        } catch (err) {
            return reply.status(500).send(err)
        }

    })

    server.post(`${path}/markasdone/:leader_id`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { leader_id } = request.params as any
            if (!leader_id) return reply.status(400).send('Para atualizar a rodada é necessário informar o leader_id no URI')
            const body = request.body as {
                MarkAsDone?: number[] | undefined
            }
            if (!body?.MarkAsDone) return reply.status(400).send('Para atualizar a rodada é necessário informar o array de numeros na propriedade "MarkAsDone"')
            const MarkedAsDoneResult = await RoundsService.MarkAsDone(body.MarkAsDone, leader_id);

            if (MarkedAsDoneResult) return reply.status(200).send(MarkedAsDoneResult)
            return reply.status(502).send(`Não foi possível atualizar a rodada.`)
        } catch (err) {
            return reply.status(500).send(err)
        }

    })

    server.post(`${path}/markRoundAsDone/:round_id`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { round_id } = request.params as any
            const { status } = request.body as { status: number }
            const user = request.user as User;

            if (!round_id) return reply.status(400).send('Para atualizar a rodada é necessário informar o numero na propriedade "round_id"')
            const MarkedAsDoneResult = await RoundsService.MarkRoundAsDone(round_id, status);

            if (MarkedAsDoneResult) {
                await new UserLogService({ user_id: user.id!, action: `update campaign with success.`, origin: path, description: JSON.stringify({ round_id, status }) }).log();
                return reply.status(200).send(MarkedAsDoneResult)
            }
            await new UserLogService({ user_id: user.id!, action: `update campaign with fail.`, origin: path }).log();
            return reply.status(502).send(`Não foi possível atualizar a rodada.`)
        } catch (err) {
            return reply.status(500).send(err)
        }

    })

    server.post(`${path}/schedule/:leader_id`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const { leader_id } = request.params as any
            if (!leader_id) return reply.status(400).send('Para atualizar a rodada é necessário informar o leader_id no URI')
            const schedule = request.body as ISchedule
            if (!schedule) return reply.status(400).send('Para atualizar a rodada é necessário informar o array de numeros na propriedade "MarkAsDone"')
            /* const ScheduleResult = await RoundsService.ToSchedule(schedule, leader_id); */
            const ScheduleResult = await RoundsService.ToSchedule(schedule, leader_id);
            if (ScheduleResult) return reply.status(200).send(ScheduleResult)
            return reply.status(502).send(`Não foi possível agendar esses territórios.`)
        } catch (err) {
            return reply.status(400).send(err)
        }

    })

    /*  server.get(`${path}/:id?`, async (request, reply) => {
         try {
             const { id } = request.params as any;
             const rounds = await RoundsService.list(id);
             return reply.status(200).send(rounds)
         } catch (err) {
             return reply.status(500).send(err)
         }
 
     }) */

    server.get(`${path}/getReturnSolicitation`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const ret = await RoundsService.getReturnSolicitation()
            return reply.status(200).send(ret)
        } catch (err) {
            return reply.status(500).send()
        }
    })

    server.get(`${path}/getS13`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const ret = await RoundsService.getS13()
            return reply.status(200).send(ret)
        } catch (err) {
            return reply.status(500).send()
        }
    })
    server.get(`${path}/Whatsapp/Devolution`, async (request, reply) => {
        await request.jwtVerify();
        try {
            const ret = await RoundsService.getReturnSolicitation()

            function formatDevolutionData(data: ReturnSolicitationDto[]): string {
                let formattedData = '';

                data.forEach((entry) => {
                    const leaderName = entry.leader.name.toLowerCase().charAt(0).toUpperCase() + entry.leader.name.slice(1).toLocaleLowerCase();

                    formattedData += `Olá ${leaderName}, tudo bom?\n`;
                    formattedData += `Poderia me passar um retorno informando quais dos territórios abaixo foram trabalhados, por favor?\n\n`;

                    entry.devolutions.forEach((devolution) => {
                        const day = devolution.day.toLowerCase().charAt(0).toUpperCase() + devolution.day.slice(1);

                        formattedData += `*${day}* - 1ª Saída: *${moment(devolution.first_day).utc().format('DD-MM-YYYY')}* | 2ª Saída: *${moment(devolution.last_day).utc().format('DD-MM-YYYY')}*\n`;
                        formattedData += `Territórios: *${devolution.territories.map((territory) => territory.id).join(', ')}*\n `;
                    });

                    formattedData += '\n';
                });

                return formattedData;
            }

            return reply.status(200).send(formatDevolutionData(ret))
        } catch (err) {
            return reply.status(500).send()
        }
    })

}