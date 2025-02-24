import { Schema, model, Types} from 'mongoose'

const solvingSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    problems:{ type: Types.ObjectId, ref: 'Problems' },
    solution: { type: String, required: true},
    endflag: { type: Boolean, required: true, default: false},
    timestamp: { type: Date, default: Date.now }
  });

  export default  model('Solving', solvingSchema)