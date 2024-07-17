import fs from 'fs'; // Módulo para trabajar con el sistema de archivos
import conexion from '../database/db.js'; // Importa la conexión a la base de datos
import { promisify } from 'util'; // Módulo para convertir funciones de callback en promesas
import multer from 'multer'; // Módulo para manejar la subida de archivos
import path from 'path'; // Módulo para trabajar con rutas de archivos
import authController from './authController.js'; // Importa el controlador de autenticación

// Configuración del almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'app/public/images'); // Define la carpeta de destino para los archivos subidos
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Define el nombre del archivo subido
    }
}); 

// Configuración de multer para un solo archivo con el nombre 'imagen'
const upload = multer({ storage }).single('imagen');

// Función para crear un producto
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

            // Verificar que todos los campos requeridos estén completos, incluyendo la imagen
            if (!nombre || !descripcion || !tipo || !categoria || !imagen) {
                let mensajeError = "Por favor, complete todos los campos requeridos";
                
                if (!imagen) {
                    mensajeError = "Por favor, agregue una imagen del producto";
                }

                return res.render('dashCrearPubli', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: mensajeError,
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'CrearPublicacion'
                });
            }

            let precioFinal = precio; // Precio por defecto

            // Verificar la categoría seleccionada y ajustar el precio
            if (categoria === 'Intercambio') {
                precioFinal = 'CAMBIO';
            } else if (categoria === 'Donacion') {
                precioFinal = 'GRATIS';
            } else if (categoria === 'Venta') {
                precioFinal = '$' + precio;
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

// Función para editar un producto
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
                precioFinal = 'CAMBIO';
            } else if (categoria === 'Donacion') {
                precioFinal = 'GRATIS';
            } else if (categoria === 'Venta') {
                precioFinal = '$' + precio;
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

            return next(); // Después de editar correctamente el producto, continuar con el siguiente middleware o respuesta
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

// Función para eliminar un producto
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
