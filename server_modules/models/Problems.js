import { Schema, model, Types} from 'mongoose'

const problemsSchema = new Schema({
    name: { type: String, required: true },
    num:{ type: Number, required: false},
    themes:{ type: Types.ObjectId, ref: 'Themes' },
    timelimit: { type: Number, required: true, default: 1000},
    memorylimit: { type: Number, required: true, default: 128},
    text: { type: String,  required: true},
    input:{ type: String, required: true },
    output:{ type: String, required: true },
    solution:{type: String}
  })
  export default  model('Problems', problemsSchema)