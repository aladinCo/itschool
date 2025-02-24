import { Schema, model} from 'mongoose'
import { v4 as uuidv4 } from 'uuid';

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    publicId: { type: String, unique: true, default: uuidv4 }
});

const roles = {
    TEACHER: 'teacher', 
    USER: 'user',
    ADMIN: 'admin'
};

userSchema.add({
    role: { type: String, enum: Object.values(roles), default: roles.USER }
});

export default  model('User', userSchema);