import OpenAI from 'openai';
import { prisma } from '../prisma/client';
import { mongoose, AILog } from '../models/aiLogModel';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export const aiService = {
  async classifyTransaction(userId: string, description: string, amount: number) {
    const prompt = `
      Classify the following financial transaction into one of these categories:
      Food, Transportation, Housing, Entertainment, Healthcare, Education, Shopping, Utilities, Other.
      
      Description: ${description}
      Amount: $${amount}
      
      Respond with ONLY the category name, nothing else.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10
      });

      const category = completion.choices[0]?.message?.content?.trim() || 'Other';

      // Log the AI request
      await AILog.create({
        userId,
        type: 'classification',
        input: { description, amount },
        output: { category },
        timestamp: new Date()
      });

      return category;
    } catch (error) {
      // Log error
      await AILog.create({
        userId,
        type: 'classification',
        input: { description, amount },
        output: { error: 'AI service unavailable' },
        timestamp: new Date()
      });

      return 'Other';
    }
  },

  async generateMonthSummary(userId: string, year: number, month: number) {
    // Get transactions for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savings = totalIncome - totalExpenses;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc: any, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

    const prompt = `
      Analyze the following monthly financial data and provide a concise summary with insights and recommendations:
      
      Month: ${month}/${year}
      Total Income: $${totalIncome}
      Total Expenses: $${totalExpenses}
      Savings: $${savings}
      
      Expenses by category:
      ${Object.entries(expensesByCategory).map(([category, amount]) => `- ${category}: $${amount}`).join('\n')}
      
      Please provide:
      1. A brief summary of spending patterns
      2. Areas where spending seems high
      3. 2-3 practical suggestions to improve savings
      4. Overall financial health assessment
      
      Keep it concise and actionable.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      });

      const summary = completion.choices[0]?.message?.content?.trim() || 'Unable to generate summary';

      // Log the AI request
      await AILog.create({
        userId,
        type: 'month_summary',
        input: { year, month, totalIncome, totalExpenses, savings },
        output: { summary },
        timestamp: new Date()
      });

      return {
        summary,
        metrics: {
          totalIncome,
          totalExpenses,
          savings,
          expensesByCategory
        }
      };
    } catch (error) {
      // Log error
      await AILog.create({
        userId,
        type: 'month_summary',
        input: { year, month, totalIncome, totalExpenses, savings },
        output: { error: 'AI service unavailable' },
        timestamp: new Date()
      });

      return {
        summary: 'AI service is currently unavailable. Please try again later.',
        metrics: {
          totalIncome,
          totalExpenses,
          savings,
          expensesByCategory
        }
      };
    }
  }
};