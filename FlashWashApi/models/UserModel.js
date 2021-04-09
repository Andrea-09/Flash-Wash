const { Schema, model } = require('mongoose')

var UserSchema = Schema({
    fullname: {
        type: "String",
        required: true
    },
    email: {
        type: "String",
        required: true,
        unique: true
    },
    password: {
        type: "String",
        require: true
    },
    recoveryToken: "String"
})

module.exports = model("User", UserSchema)