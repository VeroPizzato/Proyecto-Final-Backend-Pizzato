module.exports = {
    userIsLoggedIn: (req, res, next) => {
        // el usuario debe tener una sesion iniciada
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (!isLoggedIn) {
            return res.status(401).json({ error: 'User should be logged in!' })
        }

        next()
    },
    userIsNotLoggedIn: (req, res, next) => {
        // el usuario no debe tener una sesion iniciada
        const isLoggedIn = ![null, undefined].includes(req.session.user)
        if (isLoggedIn) {
            return res.status(401).json({ error: 'User should not be logged in!' })
        }

        next()
    },
    userIsAdmin: (req, res, next) => {
        // el usuario debe ser admin o superadmin           
        if (req.session.user.rol != "admin" && req.session.user.rol != "superadmin")  {           
            return res.status(403).json({ error: 'Unauthorized user!' })
        }

        next()
    },
    userIsUser: (req, res, next) => {
        // el usuario debe ser user o superadmin o premium    
        if (req.session.user.rol != "user" && req.session.user.rol != "superadmin")  {        
            return res.status(403).json({ error: 'Unauthorized user!' })
        }

        next()
    },
    userIsUserOrPremium: (req, res, next) => {
        if ((req.session.user.rol != "user") && (req.session.user.rol != "premium")) {
            return res.status(403).json({ error: 'El usuario debe tener permisos de admin o premium!' })
        }

        next()
    },
    userIsAdminOrPremium: (req, res, next) => {
        if ((req.session.user.rol != "admin") && (req.session.user.rol != "premium")) {
            return res.status(403).json({ error: 'El usuario debe tener permisos de admin o premium!' })
        }

        next()
    }
}