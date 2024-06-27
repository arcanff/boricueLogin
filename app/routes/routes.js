import { Router } from "express";
import dotenv from 'dotenv';
import conexion from '../database/db.js';
import { promisify } from 'util';
import authController from '../controllers/authController.js';
import uploadController from '../controllers/uploadController.js';
import dashboardController from '../controllers/dashboardController.js';

dotenv.config();

const router = Router();

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/acerca', (req, res) => {
    res.render('acerca');
});

router.get('/login', (req, res) => {
    res.render('login', {
        alert: false,
        alertTitle: '',
        alertMessage: '',
        alertIcon: '',
        showConfirmButton: false,
        timer: false,
        ruta: ''
    });
});

router.get('/contactanos', (req, res) => {
    res.render('contactanos');
});

router.get('/preguntas', (req, res) => {
    res.render('preguntas');
});

router.get('/servicios', (req, res) => {
    res.render('servicios');
});

router.get('/T&C', (req, res) => {
    res.render('tyc');
});

router.get('/Inicio', authController.isAuthenticated, dashboardController.getProducts, (req, res) => {
    const products = req.products; // Obtener los productos desde el objeto req
    res.render('dashInicio', { products }); // Renderizar la vista con los productos
});

router.get('/Publicaciones', authController.isAuthenticated, dashboardController.getProductsByUser, (req, res) => {
    const products = req.products || []; // Obtener los productos desde req.products
    res.render('dashPublicaciones', { products });
});

router.get('/CrearPublicacion', authController.isAuthenticated, async (req, res) => {
    res.render('dashCrearPubli', {
        alert: false,
        alertTitle: '',
        alertMessage: '',
        alertIcon: '',
        showConfirmButton: false,
        timer: false,
        ruta: ''
    });
});

router.get('/EditarPublicacion/:idProducto', authController.isAuthenticated, async (req, res, next) => {
    const idProducto = req.params.idProducto;
    
    try {
        const query = 'SELECT * FROM producto WHERE idProducto = ?';
        const product = await promisify(conexion.query).bind(conexion)(query, [idProducto]);

        if (product.length > 0) {
            req.product = product[0]; // Guardar el producto en req para que esté disponible en el siguiente middleware
            next(); // Llamar a next() para pasar al siguiente middleware (renderizado del formulario)
        } else {
            res.redirect('/Publicaciones');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/Publicaciones'); // Manejo del error si falla la consulta
    }
}, (req, res) => {
    const product = req.product;
    res.render('dashEditarPubli', {
        product,
        alert: false,
        alertTitle: '',
        alertMessage: '',
        alertIcon: '',
        showConfirmButton: false,
        timer: false,
        ruta: ''
    });
});

router.post('/edit/:idProducto', authController.isAuthenticated, uploadController.editProduct, (req, res) => {
    // Después de editar correctamente el producto, redirigir a la página de edición
    const idProducto = req.params.idProducto;
    res.redirect('/Publicaciones');
});

router.get('/EliminarPublicacion/:idProducto', authController.isAuthenticated, uploadController.deleteProduct);

router.get('/Chat', authController.isAuthenticated, async (req, res) => {
    res.render('dashChat');
});

router.get('/Perfil', authController.isAuthenticated, async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    const datos = req.user;

    res.render("dashPerfil", {
        "datos": datos
    });
});

router.get('/Reportes', (req, res) => {
    res.render('dashReportes');
});

router.get('/EditarPerfil', async (req, res) => {
    res.render('dashEditarPerfil');
});

router.post('/register', authController.register);
router.post('/login', authController.login, dashboardController.getProducts, (req, res) => {
    const products = req.products; // Obtener los productos desde el objeto req
    res.render('dashInicio', { 
        alert: true,
        alertTitle: "Conexión exitosa",
        alertMessage: "¡Inicio de sesión correcto!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 800,
        ruta: '',
        products 
    }); // Renderizar la vista con los productos
});
router.get('/logout', authController.logout);

router.post('/upload', authController.isAuthenticated, uploadController.createProduct);

export default router;
