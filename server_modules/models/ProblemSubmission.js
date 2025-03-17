import { Schema, model, Types } from 'mongoose';

const testSchema = new Schema({
  id:{ type: Types.ObjectId, required: true },
  bal: { type: Number, required: true },
  time: { type: Number, required: true },
  result: { type: Boolean, required: true }
}, { _id: false }); // Вимикаємо _id у вкладених об'єктах масиву tests

const groupSchema = new Schema({
  group: { type: Number, required: true },
  testBal: { type: Number, required: true },
  testCount: { type: Number, required: true },
  tests: [testSchema], // Використовуємо testSchema без _id
  scored: { type: Number, required: true }
}, { _id: false }); // Вимикаємо _id у вкладених об'єктах масиву groupsTests

const problemSubmissionSchema = new Schema({
  idUser: { type: Types.ObjectId, required: true },
  idProblem: { type: Types.ObjectId, required: true },
  code: { type: String, required: true },
  scoredAll: { type: Number, default: 0, required: true },
  balAll: { type: Number, default: 0, required: true },
  status: {
    type: Boolean,
    default: false, // Значення за замовчуванням
    required: true
  },
  groupsTests: [groupSchema] // Використовуємо groupSchema без _id
}, { timestamps: true });





export default  model('ProblemSubmission', problemSubmissionSchema);