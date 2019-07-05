const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const multer = require('multer')

const photo = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('please upload only image'))
        }
        cb(undefined,true)
    }
})

router.post('/images', photo.single('upload'),auth, async (req,res)=>{
    console.log(req.file.buffer)
    const name = req.body.firstName
    const user = await User.findOneAndUpdate({firstName: name},{avatars:req.file.buffer},{upsert:true,new:true})
    res.send(user)
//    const userdata = await User.findOne({firstName: name })
//    if(!userdata){
//     return res.send('user not found')
//    }
//     req.user.avatar = req.file.buffer
//     await req.user.save()
//     res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})


//-----ADD----------
router.post('/user',async (req,res)=>{
    const user = new User(req.body)
    //console.log(user)
    try {
       await user.save()
       const token = await user.generateAuthToken()
       res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
    
})



//-------FETCH----------
router.get('/user', auth, async (req,res)=>{
    try {
        const user = await User.find({})
        if(!user){
           return res.status(404).send('user not found')
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

//--------UPDATE----------
router.put('/user/:id',async (req,res)=>{
   const updates = Object.keys(req.body)
   console.log(updates)
   const allowedUpdates = ['firstName', 'lastName', 'email', 'password']
   const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
   if(!isValidOperation){
       return res.status(400).send('Invalid updates')
   }
    try {
        const user = await User.findById(req.params.id)
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        //const user = await User.findOneAndUpdate(req.params.id,req.body, {new:true, runValidators: true})
        if(!user){
           return res.status(404).send('user not updated')
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

//------DELETE----------
router.delete('/user/:id',async (req,res)=>{
    const id = req.params.id
    try {
        const user = await User.findByIdAndDelete(id)
        if(!user){
           return res.status(404).send(user)
        }
        res.status(200).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

//--------LogIn--------------
router.post('/user/login', auth, async (req,res)=>{
    try {
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
    
    // const email = req.body.email;
    // const password = req.body.password;
    // const user = await User.findOne({email})
    // if(!user){
    //     return res.status(404).send('user not found')
    // }
    // const isMatched = await bcrypt.compare(password,user.password)
    // if(!isMatched){
    //     return res.status(404).send('password not matched')
    // }
    // res.status(200).send({message: 'login successful',user})
})

//--------LogOut-------------
router.post('/user/logout', auth, async (req,res)=>{

    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

//-------Logout All------------
router.post('/user/logoutall', auth, async (req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router