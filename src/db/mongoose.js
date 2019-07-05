const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/UserData',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})