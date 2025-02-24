import { Schema, model, Types} from 'mongoose'

const testResultSchema = new Schema({
    userId: {type: Types.ObjectId, ref: 'User' },  
    taskId: {type: Types.ObjectId, ref: 'Examples' },  
    code: {type: String},                            
    status: {type: String},                          
    error: {type: String}, 
    output: {type: Object},                         
    timestamp: { type: Date, default: Date.now }
  })

export default  model('TestResult', testResultSchema) 