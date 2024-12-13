import { FastifyInstance } from 'fastify';
import { User } from '../models/user';
import { UserService } from '../services/userService';
import { hashPassword, isValidPassword } from '../utils/bcrypt';
import { UserLogService } from '../services/userLogService';

const path = '/auth'

export default function UserRoutes(server: FastifyInstance, userService: UserService) {

    server.post(path + '/signin', async (request, reply) => {
        const { email, password } = request.body as User;
        if (!email || !password) return reply.status(400).send({ error: 'Email e senha são obrigatórios' });

        const users = await userService.list();
        const user = users.find(u => u.email.trim().toLowerCase() === email.toLowerCase().trim());

        if (!user) return reply.status(401).send({ error: 'Usuário ou senha não encontrado' });

        const is_valid_password = await isValidPassword(password, user.password);
        if (!is_valid_password) {
            await new UserLogService({ user_id: user.id!, action: `signin with fail - invalid password`, origin: '/login' }).log();
            return reply.status(401).send({ error: 'Senha inválida' });
        }

        const token = server.jwt.sign({ id: user.id, name: user.name, email: user.email }, { expiresIn: '1d' });

        await new UserLogService({ user_id: user.id!, action: `signin with success.`, origin: '/login' }).log();

        return reply.send({ token });
    });


    server.post(path + '/reset', async (request, reply) => {
        await request.jwtVerify();
        const { email, id } = request.user as User;

        const { password, old_password } = request.body as any;

        if (!password || !old_password) return reply.status(400).send({ error: 'senha atual e senha anterior são obrigatórias' });

        const users = await userService.list();
        const user_db = users.find(u => u.email === email);

        if (!user_db) {
            await new UserLogService({ user_id: id!, action: `reset with fail - user not found`, origin: '/reset' }).log();
            return reply.status(401).send({ error: 'Usuário ou senha não encontrado' });
        }

        const is_valid_password = await isValidPassword(old_password, user_db.password);
        if (!is_valid_password) {
            await new UserLogService({ user_id: user_db.id!, action: `reset with fail - invalid old password`, origin: '/reset' }).log();
            return reply.status(401).send({ error: 'Senha anterior inválida' });
        }
        const isUpdated = await userService.update(user_db.id!, { ...user_db, password: await hashPassword(password) });

        if (!isUpdated) {
            await new UserLogService({ user_id: user_db.id!, action: `reset with fail - update error`, origin: '/reset' }).log();
            return reply.status(401).send({ error: 'Erro ao atualizar a senha' });
        }

        const users_updated = { id: user_db.id, name: user_db.name, email: user_db.email }

        const token = server.jwt.sign({ id: users_updated.id, name: users_updated.name, email: users_updated.email }, { expiresIn: '1d' });

        await new UserLogService({ user_id: user_db.id!, action: `reset with success.`, origin: '/reset' }).log();

        return reply.send({ token });
    });



}