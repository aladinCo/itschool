import { Schema, model, Types} from 'mongoose'

const examplesSchema = new Schema({
    type:{type:Number, required: true },
    group:{type:Number, required: true },
    problems: { type: Types.ObjectId, ref: 'Problems' },
    input: { type: Object, required: true},
    output: { type: Object, required: true},
    time:{type:Number, required: true }
  })
  
  export default  model('Examples', examplesSchema)