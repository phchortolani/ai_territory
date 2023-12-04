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

const server = fastify()
const port = 3333;

TerritoryRoutes(server, new TerritoryService());
LeadersRoutes(server, new LeadersService());
RoundsRoutes(server, new RoundsService())
CampaignRoutes(server, new CampaignService())
statusTerritoryRoutes(server, new StatusTerritoryService())

server.listen({ port }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at http://localhost:${port}`)
})

