import mongoose from 'mongoose';

const financialSummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  monthlyIncome: {
    type: Number,
    default: 0
  },
  monthlyExpenses: {
    type: Number,
    default: 0
  },
  savingsRate: {
    type: Number,
    default: 0
  },
  currentMonth: {
    type: String,
    default: () => new Date().toISOString().slice(0, 7)
  },
  previousMonthData: {
    accountBalance: Number,
    monthlyIncome: Number,
    monthlyExpenses: Number,
    savingsRate: Number,
    month: String
  },
  categoryBreakdown: [{
    category: String,
    amount: Number,
    percentage: Number
  }]
}, {
  timestamps: true
});

const FinancialSummary = mongoose.model('FinancialSummary', financialSummarySchema);
export default FinancialSummary;