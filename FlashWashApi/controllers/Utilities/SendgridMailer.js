const sendgrid = require('@sendgrid/mail')

console.log(process.env.SENDGRID_API_KEY)
sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async function(email) {
    try {
        await sendgrid.send(email)
    } catch (err) {
        return err
    }
}