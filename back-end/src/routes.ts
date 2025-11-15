import { FastifyInstance } from 'fastify';
import { authController } from './controllers/authController';
import { transactionController } from './controllers/transactionController';
import { aiController } from './controllers/aiController';

export async function routes(fastify: FastifyInstance) {
  // Auth routes
  fastify.post('/api/auth/register', authController.register);
  fastify.post('/api/auth/login', authController.login);
  fastify.get('/api/auth/me', { preHandler: [fastify.authenticate] }, authController.getMe);

  // Transaction routes
  fastify.get('/api/transactions', { preHandler: [fastify.authenticate] }, transactionController.getTransactions);
  fastify.post('/api/transactions', { preHandler: [fastify.authenticate] }, transactionController.createTransaction);
  fastify.put('/api/transactions/:id', { preHandler: [fastify.authenticate] }, transactionController.updateTransaction);
  fastify.delete('/api/transactions/:id', { preHandler: [fastify.authenticate] }, transactionController.deleteTransaction);

  // AI routes
  fastify.post('/api/ai/classify', { preHandler: [fastify.authenticate] }, aiController.classifyTransaction);
  fastify.get('/api/ai/month-summary/:year/:month', { preHandler: [fastify.authenticate] }, aiController.getMonthSummary);
}