import conexion from '../database/db.js'; // Importa la conexión a la base de datos
import { promisify } from 'util'; // Módulo para convertir funciones de callback en promesas

// Función para obtener todos los productos
const getProducts = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM producto'; // Consulta para obtener todos los productos
        conexion.query(query, (error, results) => {
            if (error) {
                return next(error); // Manejar el error y pasar al siguiente middleware
            }

            // Asegúrate de que `results` sea un arreglo
            if (!Array.isArray(results)) {
                return next(new Error('La consulta no devolvió un arreglo')); // Manejar el error si el resultado no es un arreglo
            }

            req.products = results; // Pasar los productos a través del objeto req
            next(); // Llamar a next() para pasar al siguiente middleware
        });
    } catch (error) {
        console.error(error); // Mostrar el error en la consola
        next(error); // Pasar el error al manejador de errores
    }
};

// Función para obtener los productos de un usuario específico
const getProductsByUser = async (req, res, next) => {
    try {
        // Obtener el ID del usuario desde req.user (si está usando autenticación)
        const userId = req.user.idUsuario;

        // Consultar productos del usuario
        const query = 'SELECT * FROM producto WHERE usuario_id = ?'; // Consulta para obtener productos por usuario
        const products = await promisify(conexion.query).bind(conexion)(query, [userId]); // Promisificar y ejecutar la consulta

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
        console.log(error); // Mostrar el error en la consola
        // Manejo del error si falla la consulta
        res.status(500).json({ error: "Error al obtener productos del usuario." });
    }
};

// Exportar las funciones
export default {
    getProducts,
    getProductsByUser
};
