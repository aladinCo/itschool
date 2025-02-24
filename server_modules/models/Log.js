import { Schema, model, Types} from 'mongoose'

const logSchema = new Schema({
    level: { type: String, required: true },
    message: { type: String, required: true },
    session: { type: String, default: null},
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
    process: { type: String, required: true }, // Поле для комбинированного process ID
    file: { type: String, default: 'unknown' }
  })

// Створення TTL індексу на поле createdAt
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

  
export default  model('Log', logSchema) 