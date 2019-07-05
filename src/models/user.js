const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        tolowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email')
            }
        }
       
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if(value.includes('password')){
                throw new Error('password can not be password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatars: {
        type: Buffer
    }
})
// hide password and token
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}

// create jwt
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'somesecretkey')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


// login user by email and password
userSchema.statics.findByCredential = async (email,password)=> {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }
    if(user.isModified('password')){
        const isMatched = await bcrypt.compare(password,user.password)
        console.log(isMatched)
        if(!isMatched){
            throw new Error('unable to login')
        }
    }
   
    
    return user
}



// to hash the plain text password
userSchema.pre('save', async function (next) {
    const user = this
    user.password = await bcrypt.hash(user.password,8)
    //console.log(user.password)
    next();
})

const User = mongoose.model('User',userSchema)
module.exports = User;