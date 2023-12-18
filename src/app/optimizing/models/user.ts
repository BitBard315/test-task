import { Document, Schema, model } from 'mongoose';

interface IUser extends Document {
    name: string;
    email: string;
    age: number;
}

const userSchema = new Schema<IUser>({
    name: String,
    email: { type: String, unique: true },
    age: Number,
});

const User = model<IUser>('User', userSchema);

export default User;
