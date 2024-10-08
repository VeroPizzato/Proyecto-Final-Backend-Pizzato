const { UsersService } = require('../services/users.service')
const { User: UserDAO } = require('../dao')
const transport = require("../config/transport")
//const config = require('../config/config')

class UsersController {

    constructor() {
        this.service = new UsersService(new UserDAO())
    }

    async changeRole(req, res) {
        try {
            const idUser = req.params.uid
            const user = await this.service.changeRole(idUser)
            if (!user)
                return res.sendServerError(`No se pudo cambiar el rol del usuario '${idUser}'`)

            return res.sendSuccess(`El usuario '${idUser}' cambió su rol'`)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

    async uploadDocuments(req, res) {
        const idUser = req.params.uid
        //const {name, type} = req.body        
        const files = req.files
        if (!files || files.length === 0) {
            return res.sendUserError('No se subieron archivos')
            //return res.status(400).send('No se subieron archivos')
        }
        const user = await this.service.uploadDocuments(idUser, files)
        req.logger.info('Documentación actualizada exitosamente')
        res.sendCreatedSuccess('Documento actualizado de forma correcta')
        //res.status(201).json({ message: 'Documento actualizado de forma correcta' })
    }

    async deleteUser(req, res) {         
        const {
            uid
        } = req.params
        const user = await this.service.getUserById(uid)
        const email = user.email
        const esBorrado = await this.service.deleteUser(user)            
        if (esBorrado) {            
            if (email) {
                let result = await transport.sendMail({
                    from: process.env.ADMIN_EMAIL,
                    to: `${email}`,
                    subject: 'Su Usuario fue Eliminado por el Administrador',
                    html: `<div> <h1> Su Usuario fue eliminado por el Administrador de Coder. </h1></div>`,
                    attachments: []
                })
            }            
            return res.status(200).json({
                message: 'Usuario eliminado'
            })
        }
    }

    async deleteInactiveUsers(req, res) {
        const deletedCount = await this.service.deleteInactiveUsers()
        if (deletedCount) {
            res.status(200).json({
                message: `${deletedCount} usuarios eliminados`
            })
        } else {
            res.status(210).json({
                message: 'No se encontraron usuarios para eliminar'
            })
        }
    }
}

module.exports = { UsersController }