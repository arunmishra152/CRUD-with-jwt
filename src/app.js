const express = require('express')
const app = express()
require('./db/mongoose')
const userrouter = require('./router/userroute')
const port = process.env.PORT || 3002

// app.get('/',(req,res)=>{
//     res.send('Ok Google')
// })
app.use(express.json())
app.use(userrouter)

app.listen(port, ()=>{
    console.log('srever is listening on port: '+port)
})