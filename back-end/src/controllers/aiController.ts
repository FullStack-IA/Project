import { FastifyRequest, FastifyReply } from 'fastify';
import { aiService } from '../services/aiService';

interface ClassifyBody {
  description: string;
  amount: number;
}

export const aiController = {
  async classifyTransaction(request: FastifyRequest<{ Body: ClassifyBody }>, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const { description, amount } = request.body;
      const classification = await aiService.classifyTransaction(userId, description, amount);
      return reply.send({ classification });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  },

  async getMonthSummary(request: FastifyRequest<{ Params: { year: string, month: string } }>, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const year = parseInt(request.params.year);
      const month = parseInt(request.params.month);
      const summary = await aiService.generateMonthSummary(userId, year, month);
      return reply.send({ summary });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  }
};