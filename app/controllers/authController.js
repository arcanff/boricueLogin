import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import conexion from '../database/db.js';
import {promisify} from 'util';

//procedimiento para registrarnos
const register = async (req, res) => {    
    try {
        const { id: identificacion, names: nombre, dress: direccion, phon: telefono, mail: correo, pass: contrasena, rol } = req.body;
        const estado = 'Activo';
        const passHash = await bcryptjs.hash(contrasena, 8);

        // Inserta en la base de datos
        conexion.query('INSERT INTO usuario SET ?', {
            identificacion,
            nombres: nombre,
            direccion,
            telefono,
            correo,
            rol,
            estado,
            contrasena: passHash
        }, (error, results) => {
            if (error) {
                // Verifica si el error es de duplicado
                if (error.code === 'ER_DUP_ENTRY') {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Advertencia",
                        alertMessage: "La identificación, correo o teléfono ya se encuentran registrados",
                        alertIcon: 'info',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    console.log(error);
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Ocurrió un error al registrar el usuario",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                }
            } else {
                res.render('login', {
                    alert: true,
                    alertTitle: "Éxito",
                    alertMessage: "Usuario creado correctamente",
                    alertIcon: 'success',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.render('login', {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Ocurrió un error al registrar el usuario",
            alertIcon: 'error',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }       
}



const login = async (req, res) => {
    try {
        const mail = req.body.mail;
        const pass = req.body.pass;

        if (!mail || !pass) {
            res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y contraseña para poder ingresar",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        } else {
            conexion.query('SELECT * FROM usuario WHERE correo = ?', [mail], async (error, results) => {
                if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].contrasena))) {
                    res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contraseña incorrectos",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'
                    });
                } else {
                    // Inicio de sesión OK
                    const idUsuario = results[0].idUsuario;
                    const token = jwt.sign({ idUsuario: idUsuario }, process.env.JWT_SECRETO, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA
                    });

                    console.log("TOKEN JWT generado:", token); // Verifica el token generado

                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    };
                    res.cookie('jwt', token, cookiesOptions);
                    res.render('dashInicio', {
                        alert: true,
                        alertTitle: "Conexión exitosa",
                        alertMessage: "¡Inicio de sesión correcto!",
                        alertIcon: 'success',
                        showConfirmButton: false,
                        timer: 800,
                        ruta: ''
                    });
                }
            });
        }
    } catch (error) {
        console.log("Error en el inicio de sesión:", error);
    }
};

const isAuthenticated = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);
            console.log("Token decodificado:", decodificada);
            const identificadorUnico = req.body.mail ? 'correo' : 'telefono'; // Ajusta según la disponibilidad de datos en el token
            console.log("Identificador único:", identificadorUnico);
            console.log("ID del usuario decodificado:", decodificada.idUsuario);
            conexion.query('SELECT * FROM usuario WHERE idUsuario = ?', [decodificada.idUsuario], (error, results) => {
                if (error) {
                    console.log("Error en la consulta:", error);
                    return next();
                }
                if (!results || results.length === 0) {
                    console.log("Usuario no encontrado");
                    return next();
                }
                req.user = results[0];
                console.log("Usuario autenticado:", req.user);
                return next();
            });
        } catch (error) {
            console.log("Error al verificar el token:", error);
            return next();
        }
    } else {
        console.log("No se encontró cookie de autenticación");
        res.redirect('/login');
    }
};

const logout = (req, res)=>{
    res.clearCookie('jwt')   
    return res.redirect('/')
}

export default {
    register, login, isAuthenticated, logout
}