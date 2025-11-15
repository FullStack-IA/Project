import { FastifyRequest, FastifyReply } from 'fastify';
import { transactionService } from '../services/transactionService';

interface CreateTransactionBody {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
  date: string;
}

interface UpdateTransactionBody {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

export const transactionController = {
  async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const transactions = await transactionService.getUserTransactions(userId);
      return reply.send({ transactions });
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  },

  async createTransaction(request: FastifyRequest<{ Body: CreateTransactionBody }>, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const transaction = await transactionService.createTransaction(userId, request.body);
      return reply.status(201).send({ transaction });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async updateTransaction(request: FastifyRequest<{ Params: { id: string }, Body: UpdateTransactionBody }>, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      const transaction = await transactionService.updateTransaction(userId, request.params.id, request.body);
      return reply.send({ transaction });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  },

  async deleteTransaction(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      await transactionService.deleteTransaction(userId, request.params.id);
      return reply.send({ message: 'Transaction deleted successfully' });
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
};