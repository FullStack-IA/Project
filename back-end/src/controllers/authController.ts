import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/authService';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const authController = {
  async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    try {
      const { name, email, password } = request.body;
      const result = await authService.register(name, email, password);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const result = await authService.login(email, password);
      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  },

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const user = await authService.getUserById(userId);
      return reply.send({ user });
    } catch (error: any) {
      return reply.status(404).send({ error: error.message });
    }
  }
};