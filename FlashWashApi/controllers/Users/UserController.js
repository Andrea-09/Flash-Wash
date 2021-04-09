const mailer = require('../Utilities/SendgridMailer')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../../models/UserModel')
const { registerValidator, loginValidator } = require('./UserValidator')

var UserController = {
    register: async(req, res) => {
        try {

            await registerValidator(req.body)

            const notUnique = await User.find({$or: [{fullname: req.body.fullname}, {email: req.body.email}]})

            if(notUnique != 0)
                throw "Correo o nombre de usuario ya esta registrado"

            let hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT))

            let newUser = new User({
                fullname: req.body.fullname,
                email: req.body.email,
                password: hashedPassword
            })

            await newUser.save()

            return res.status(201).json({ error: false, message: "Created" })
        }
        catch(err) {
            console.log(err)
            return res.status(400).json(err.details != null ? err.details[0].message : err)
        }
    },

    login: async(req, res) => {
        try {
            await loginValidator(req.body)

            const user = req.body.email == null ? await User.findOne({fullname: req.body.fullname}) : await User.findOne({email: req.body.email})

            if(!user)
                throw {error: true, message: "Nombre de usuario o correo no encontrado."}

            var logged = await bcrypt.compare(req.body.password, user.password)

            if(!logged)
                throw {error: true, message: "Contraseña incorrecta."}

            const token = jwt.sign({_id: user._id}, process.env.TOKEN_KEY)
            return res.status(200).json({error: false, message: "Succes", token: token})

        } catch (err) {
            return res.status(400).json(err.details != null ? err.details[0].message : err)
        }
    },

    updateUser: async(req, res) => {
        try {
            await updateValidator(req.body)

            var actualUser = await User.findOne({_id: req.user._id})
            const matchUsers = await User.find({ email: req.body.email })

            var unique = true
            if(matchUsers.length != 0)
                matchUsers.forEach(u => {
                    if(req.user._id != u._id)
                        if(u.email == req.body.email)
                            unique = false
                })
            
            if(!unique)
                throw { error: true, message: "El Email ya esta registrado" }

            var hashedPassword = req.body.password == null ? null : await bcrypt.hash(req.body.password, parseInt(process.env.SALT))

            actualUser = {
                fullname: req.body.fullname || actualUser.fullname,
                email: req.body.email || actualUser.email,
                password: hashedPassword || actualUser.password
            }

            await User.findByIdAndUpdate({_id: req.user._id}, actualUser)

            return res.status(200).json({error: false, message: "Usuario actualizado."})

        } catch (err) {
            return res.status(400).json(err.details != null ? err.details[0].message : err)
        }
    },

    requestPassword: async(req, res) => {
        try {
            var user = await User.findOne({email: req.body.email})

            if(!user)
                throw {error: true, message: "Correo no encontrado."}

            const token = jwt.sign({_id: user._id}, process.env.TOKEN_RESET_KEY, {expiresIn: '15m'})

            const recoverEmail = {
                to: req.body.email,
                from: process.env.EMAIL,
                subject: "RECUPERACIÓN DE CONTRASEÑA",
                html:
                `
                <h2>Saludos ${user.fullname}</h2>
                <p>Para recuperar tu contraseña visita el siguiente enlace: <a href="${process.env.CLIENT_URL}/auth/${token}" target="_blank">Recuperación</a></p>
                <p>Si necesitas ayuda, puedes escribir a: ${process.env.MAIL}</p>
                <h3>DEPROINV</h3>
                `
            }

            await User.findByIdAndUpdate({_id: user._id}, {recoveryToken: token})
            await mailer(recoverEmail)
            return res.header('Authorize', token).status(200).json({error: false, message: "Correo enviado"})

        } catch (err) {
            return res.status(500).json(err)
        }
    },

    requestPasswordHandler: async(req, res) => {
        try {
            const token = req.header('Authorize')

            if(!token)
                throw {error: true, message: "Acceso denegado"}
            
            const verified = jwt.verify(token, process.env.TOKEN_RESET_KEY)

            if(!verified)
                throw {error: true, message: "Invalid token"}

            var user = await User.findOne({_id: verified._id})

            user.password = await bcrypt.hash(req.body.newPassword, parseInt(process.env.SALT))
            user.recoveryToken = null

            await User.findOneAndUpdate({_id: user._id}, {password: user.password, recoveryToken: user.recoveryToken})

            return res.status(200).json({error: false, message: "Contraseña actualizada, intente iniciar sesión."})

        } catch (err) {
            return res.status(500).json(err)
        }
    },

    getCurrentUser: async(req, res) => {
        const user = await User.findOne({_id: req.user._id})

        return res.status(200).json({user})
    }

}

module.exports = UserController