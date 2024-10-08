//const config = require('../config/config')
const { isValidPassword } = require('../utils/hashing')

class JwtServices {

    constructor(dao) {
        this.dao = dao
    }

    async login(email, password) { 
        let user      
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Datos de sesión para el usuario coder Admin
            user = {
                first_name: "Usuario",
                last_name: "de CODER",
                age: 21,
                email: process.env.ADMIN_EMAIL,
                cart: null,
                rol: "admin",
                _id: "jh235hlki23463nkhlo",
                last_connection: Date.now()
            }            
        }
        else if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
            // Datos de sesión para el usuario coder Admin
            user = {
                first_name: "Usuario",
                last_name: "de CODER",
                age: 40,
                email: process.env.SUPER_ADMIN_EMAIL,
                cart: null,
                rol: "superadmin",
                _id: "kflshGKSGNasbsgj3dae",
                last_connection: Date.now()
            }
        }
        else {
            user = await this.dao.findByEmail({ email })
            if (!user) {
                //res.sendNotFoundError(err)
                //return res.status(404).json({ error: 'User not found!' })
                throw new Error('not found')
            }

            if (!isValidPassword(password, user.password)) {
                //return send.sendUnauthorized('Invalid password')
                //return res.status(401).json({ error: 'Invalid password' })
                throw new Error('invalid password')
            }
        }
        return user
    }

    async validarPassRepetidos(email, password) {
        return await this.dao.validarPassRepetidos(email, password)
    }

    async findByEmail(email) {
        return await this.dao.findByEmail({ email })
    }

    async getUserByEmail(email) {  
        //if (email == process.env.ADMIN_EMAIL) {   
        if (email == 'admin') {
            let user = {
                first_name: "Usuario",
                last_name: "de CODER",
                age: 21,
                email: process.env.ADMIN_EMAIL,
                cart: null,
                rol: "admin",
                _id: "jh235hlki23463nkhlo"
            }
            return user
        }
        return await this.dao.getUserByEmail(email)
    }

    async getUserByCartId(idCart) {
        return await this.dao.getUserByCartId(idCart)
    }

    async updateLastConnection(email, date){
        return await this.dao.updateLastConnection(email, date)
    }

    // async changeRole(idUser) {
    //     return await this.dao.changeRole(idUser)
    // }   
        
}

module.exports = { JwtServices }