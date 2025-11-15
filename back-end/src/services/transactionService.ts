import { prisma } from '../prisma/client';

interface CreateTransactionData {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
  date: string;
}

interface UpdateTransactionData {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

export const transactionService = {
  async getUserTransactions(userId: string) {
    return await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
  },

  async createTransaction(userId: string, data: CreateTransactionData) {
    return await prisma.transaction.create({
      data: {
        ...data,
        userId
      }
    });
  },

  async updateTransaction(userId: string, transactionId: string, data: UpdateTransactionData) {
    // Verify ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    return await prisma.transaction.update({
      where: { id: transactionId },
      data
    });
  },

  async deleteTransaction(userId: string, transactionId: string) {
    // Verify ownership
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    });
  }
};