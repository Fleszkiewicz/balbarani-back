import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    //VERIFICACION DE CUENTA POR EMAIL
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationCodeExpires: {
        type: Date,
        default: Date.now() + 15 * 60 * 1000 // 15 minutos
    },

    //RECUPERACION DE CONTRASEÑA
    resetPasswordCode: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },


    email: {
        type: String,
        required: true,
        unique: true,
        trime: true,
        minLenght: 6,
        maxLenght: 254
    },
    password: {
        type: String,
        required: true,
        minLenght: 8,
        maxLenght: 254
    },
    username: {
        type: String,
        default: '',
        required: true,
        trim: true,
        minLenght: 3,
        maxLenght: 20
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    },
    name: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },



})

export default mongoose.model('User', UserSchema)