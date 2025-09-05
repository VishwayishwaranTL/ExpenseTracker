import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    fullName:{type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    profileImgUrl: {type: String, default: null}
},
{
    timestamps: true
});

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

UserSchema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword,this.password);
}

const User = mongoose.model("User", UserSchema);
export default User;