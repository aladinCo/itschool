import { Schema, model, Types} from 'mongoose'

const themesSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String,  required: false}
  })

export default  model('Themes', themesSchema) 