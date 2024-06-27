import fs from 'fs';
import conexion from '../database/db.js';
import { promisify } from 'util';
import multer from 'multer';
import path from 'path';
import authController from './authController.js'; // Importa el controlador de autenticación

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'app/public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
}); 

const upload = multer({ storage }).single('imagen');

const createProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.render('dashCrearPubli', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ocurrió un error al subir el archivo",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'CrearPublicacion'
            });
        }

        try {
            const { nombre, descripcion, tipo, categoria, precio } = req.body;
            const imagen = req.file ? req.file.filename : null;

            if (!nombre || !descripcion || !tipo || !categoria) {
                return res.render('dashCrearPubli', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Por favor, complete todos los campos requeridos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'CrearPublicacion'
                });
            }

            let precioFinal = precio; // Precio por defecto

            // Verificar la categoría seleccionada y ajustar el precio
            if (categoria === 'Intercambio') {
                precioFinal = '$ INTERCAMBIO';
            } else if (categoria === 'Donacion') {
                precioFinal = '$ GRATIS';
            }

            // Obtener el ID del usuario desde req.user
            const userId = req.user.idUsuario;

            // Insertar en la base de datos
            const query = 'INSERT INTO producto (imagen, nombre, descripcion, tipo, categoria, precio, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const values = [imagen, nombre, descripcion, tipo, categoria, precioFinal, userId];

            await promisify(conexion.query).bind(conexion)(query, values);

            res.render('dashCrearPubli', {
                alert: true,
                alertTitle: "Éxito",
                alertMessage: "Producto creado correctamente",
                alertIcon: 'success',
                showConfirmButton: true,
                timer: false,
                ruta: 'CrearPublicacion'
            });
        } catch (error) {
            console.log(error);
            res.render('dashCrearPubli', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ocurrió un error al crear el producto",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'CrearPublicacion'
            });
        }
    });
};

const editProduct = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            console.log(err);
            return res.render('dashEditarPubli', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ocurrió un error al subir el archivo",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'EditarPublicacion'
            });
        }

        try {
            const { nombre, descripcion, tipo, categoria, precio } = req.body;
            const imagen = req.file ? req.file.filename : null;
            const idProducto = req.params.idProducto;

            if (!nombre || !descripcion || !tipo || !categoria) {
                return res.render('dashEditarPubli', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "Por favor, complete todos los campos requeridos",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: `EditarPublicacion/${idProducto}`
                });
            }

            let precioFinal = precio;

            if (categoria === 'Intercambio') {
                precioFinal = '$ INTERCAMBIO';
            } else if (categoria === 'Donacion') {
                precioFinal = '$ GRATIS';
            }

            let query = 'UPDATE producto SET nombre = ?, descripcion = ?, tipo = ?, categoria = ?, precio = ?';
            let values = [nombre, descripcion, tipo, categoria, precioFinal];

            if (imagen) {
                // Obtener la imagen actual del producto
                const getImageQuery = 'SELECT imagen FROM producto WHERE idProducto = ?';
                const result = await promisify(conexion.query).bind(conexion)(getImageQuery, [idProducto]);

                if (result.length > 0) {
                    const oldImagePath = path.join('app/public/images', result[0].imagen);

                    // Eliminar la imagen anterior del sistema de archivos
                    fs.unlink(oldImagePath, (err) => {
                        if (err) {
                            console.log('Error al eliminar la imagen anterior:', err);
                        }
                    });
                }

                query += ', imagen = ?';
                values.push(imagen);
            }

            query += ' WHERE idProducto = ?';
            values.push(idProducto);

            await promisify(conexion.query).bind(conexion)(query, values);

            // Después de editar correctamente el producto, continuar con el siguiente middleware o respuesta
            return next();
        } catch (error) {
            console.log(error);
            res.render('dashEditarPubli', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ocurrió un error al editar el producto",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: `EditarPublicacion/${idProducto}`
            });
        }
    });
};

const deleteProduct = async (req, res) => {
    try {
        const idProducto = req.params.idProducto;

        // Obtener la imagen del producto antes de eliminarlo
        const getImageQuery = 'SELECT imagen FROM producto WHERE idProducto = ?';
        const result = await promisify(conexion.query).bind(conexion)(getImageQuery, [idProducto]);

        if (result.length > 0) {
            const imagePath = path.join('app/public/images', result[0].imagen);

            // Eliminar el producto de la base de datos
            const deleteQuery = 'DELETE FROM producto WHERE idProducto = ?';
            await promisify(conexion.query).bind(conexion)(deleteQuery, [idProducto]);

            // Eliminar la imagen del sistema de archivos
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log('Error al eliminar la imagen:', err);
                }
            });
        }

        res.redirect('/Publicaciones');
    } catch (error) {
        console.log(error);
        res.redirect('/Publicaciones');
    }
};


export default {
    createProduct,
    editProduct,
    deleteProduct
};
