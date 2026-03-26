const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ticket_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transaction_code: {
    type: String
  },
  payment_status: {
    type: String,
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);