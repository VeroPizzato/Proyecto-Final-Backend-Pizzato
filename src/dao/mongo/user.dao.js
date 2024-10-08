const UserModel = require("./models/user.model")
const { hashPassword } = require('../../utils/hashing')

class UserDAO {

    findByEmail = async (email) => {
        try {
            const user = await UserModel.findOne(email)
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    getUserByEmail = async (email) => {
        try {
            const user = await UserModel.findOne({ email })           
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    getUserByCartId = async (idCart) => {
        try {
            const user = await UserModel.findOne({ cart: idCart })
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUsers() {
        try {           
            const users = await UserModel.find()
            return users.map(u => u.toObject())
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserById(id) {
        try {
            const user = await UserModel.findById(id)
            return user?.toObject() ?? false
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async saveUser(user) {
        try {
            const savedUser = await UserModel.create(user)
            return savedUser.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateUser(email, pass) {
        try {
            const result = await UserModel.updateOne(email, { $set: { password: pass } })
            return result
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async validarPassRepetidos(email, pass) {
        try {
            //const user = await this.findByEmail({ email })
            const user = await UserModel.findOne({ email })
            return hashPassword(pass) == user.password // misma contraseña que la anterior             
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateLastConnection(email, date) {
        return await UserModel.updateOne({ email }, { $set: { last_connection: date } })
    }

    async changeRole(idUser) {
        try {
            const user = await this.getUserById(idUser)
            if (user) {
                const requiredDocuments = ['identificacion', 'comprobanteDomicilio', 'comprobanteCuenta']
                const hasRequiredDocuments = requiredDocuments.every(doc => user.documents.some(d => (d.name).includes(doc)))
                //const hasRequiredDocuments = requiredDocuments.every(doc => user.documents.some(d => d.name === doc))
                // Para cada documento en requiredDocuments, se ejecuta una función que verifica si hay al menos un documento en user.documents que tenga un name igual al nombre del documento actual (doc)
                if (user.rol == 'user') {                    
                    if (!hasRequiredDocuments) {
                        console.error('El usuario no ha terminado de procesar su documentacion')
                        return false
                    }
                    user.rol = 'premium'
                }
                else if (user.rol == 'premium')
                    user.rol = 'user'
                else
                    // en otro caso no se puede cambiar el rol
                    return false

                await UserModel.updateOne({ _id: idUser }, { $set: { rol: user.rol } })  // se cambió el rol
                return true
            }
            else
                return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async uploadDocuments(userId, files) {
        try {
            const user = await this.getUserById(userId)
            if (!user) {
                console.error('Usuario no encontrado')
                return null
            }
            //if (!user) throw new Error('Usuario no encontrado')
            files.forEach(file => {
                const document = {
                    name: file.originalname,
                    reference: file.path
                };
                user.documents.push(document)
            })
            user.status = 'uploaded'
            //user.status = 'updated'
            const result = await UserModel.updateOne({ _id: userId }, { $set: { documents: user.documents, status: user.status } })
            console.log(user)
            if (result) {
                console.error('Documentos subidos y estado del usuario actualizado')
                return user
            } else {
                console.error('Se produjo un error al intentar actualizar el usuario')
                return null
            }
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async deleteUser(user) {
        try {
            const result = await UserModel.deleteOne(user)
            if (!result) {
                return false
            }
        } catch (err) {
            return false
        }

        return true
    }

    async deleteInactiveUsers() {
        try {
            // const thirtyMinutesAgo = new Date();
            // thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);  // Resto 30 minutos a la fecha actual

            // // Busco todos los usuarios cuya última conexión (last_connection) sea anterior a la fecha almacenada en thirtyMinutesAgo
            // const deletedUsers = await UserModel.find({
            //     last_connection: { $lt: thirtyMinutesAgo }  // last_connection menor que thirtyMinutesAgo
            // });

            // // Elimino todos los usuarios cuya última conexión (last_connection) sea anterior a la fecha almacenada en thirtyMinutesAgo
            // const result = await UserModel.deleteMany({
            //     last_connection: { $lt: thirtyMinutesAgo }  // last_connection menor que thirtyMinutesAgo
            // });
            
            const twoDaysAgo = new Date() // la fecha y hora actual
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)  // Resto 2 días a la fecha actual (twoDaysAgo ahora contiene la fecha y hora de hace 2 días)

            // Busco todos los ususarios cuya ultima conexion (last_connection) sea anterior a la fecha almacenada en twoDaysAgo (usuarios que no se han conectado en los últimos 2 días)
            const deletedUsers = await UserModel.find({
                last_connection: { $lt: twoDaysAgo }  // last_connection menor que twoDaysAgo (menor que hace 2 dias)
            })

            // Elimino todos los usuarios cuya última conexión (last_connection) sea anterior a la fecha almacenada en twoDaysAgo (se eliminan los usuarios inactivos)
            const result = await UserModel.deleteMany({
                last_connection: { $lt: twoDaysAgo }  // last_connection menor que twoDaysAgo (menor que hace 2 dias)
            })          

            return { deletedCount: result.deletedCount, deletedUsers }
        } catch (error) {
            return { deletedCount: 0, deletedUsers: [] }
        }
    }
}

module.exports = { UserDAO }