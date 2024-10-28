import fastify from 'fastify'
import { TerritoryService } from './services/territoryService';
import { LeadersService } from './services/leadersService';
import LeadersRoutes from './routes/leadersRoutes';
import TerritoryRoutes from './routes/territoryRoutes';
import RoundsRoutes from './routes/roundsRoutes';
import { RoundsService } from './services/roundsService';
import CampaignRoutes from './routes/campaignRoutes';
import { CampaignService } from './services/campaignService';
import statusTerritoryRoutes from './routes/statusTerritoryRoutes';
import { StatusTerritoryService } from './services/statusTerritoryService';
import { BrothersService } from './services/brothersService';

import cors from '@fastify/cors'
import AmandaRoutes from './routes/amandaRoutes';
import { AmandaService } from './services/amandaService';
import WhatsappRoutes from './routes/whatsappRoutes';
import { WhatsappService } from './services/whatsappService';
import BrothersRoutes from './routes/brothersRoutes';
import TplDayTimeRoutes from './routes/tplDayTimeRoutes';
import { TplDayTimeService } from './services/tplDayTimeService';
import TplEventsRoutes from './routes/tplEventsRoutes';
import { TplEventsService } from './services/tplEventsService';


const server = fastify()

server.register(cors, {
    origin: (origin, cb) => {

        cb(null, true);
    },
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
});

const port = process.env.PORT ?? 3333;

TerritoryRoutes(server, new TerritoryService());
LeadersRoutes(server, new LeadersService());
RoundsRoutes(server, new RoundsService())
CampaignRoutes(server, new CampaignService())
statusTerritoryRoutes(server, new StatusTerritoryService())
AmandaRoutes(server, new AmandaService())
WhatsappRoutes(server, new WhatsappService())
BrothersRoutes(server, new BrothersService())
TplDayTimeRoutes(server, new TplDayTimeService())
TplEventsRoutes(server, new TplEventsService())

server.listen({
    port: Number(port),
    host: '0.0.0.0'
}, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at http://localhost:${port}`)
})

