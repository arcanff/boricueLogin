import conexion from '../database/db.js';
import { promisify } from 'util';

const getProducts = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM producto';
        conexion.query(query, (error, results) => {
            if (error) {
                return next(error);
            }

            // Asegúrate de que `results` sea un arreglo
            if (!Array.isArray(results)) {
                return next(new Error('La consulta no devolvió un arreglo'));
            }

            req.products = results; // Pasar los productos a través del objeto req
            next(); // Llamar a next() para pasar al siguiente middleware
        });
    } catch (error) {
        console.error(error);
        next(error); // Pasar el error al manejador de errores
    }
};

const getProductsByUser = async (req, res, next) => {
    try {
        // Obtener el ID del usuario desde req.user (si está usando autenticación)
        const userId = req.user.idUsuario;

        // Consultar productos del usuario
        const query = 'SELECT * FROM producto WHERE usuario_id = ?';
        const products = await promisify(conexion.query).bind(conexion)(query, [userId]);

        if (products.length === 0) {
            // No hay productos disponibles, enviar un array vacío
            req.products = []; // Puedes usar req.locals.products si prefieres
        } else {
            // Hay productos, enviar los productos encontrados
            req.products = products;
        }

        // Continuar con la siguiente función (ruta) en Express
        next();

    } catch (error) {
        console.log(error);
        // Manejo del error si falla la consulta
        res.status(500).json({ error: "Error al obtener productos del usuario." });
    }
};

export default {
    getProducts,
    getProductsByUser
};
