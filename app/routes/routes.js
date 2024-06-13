// HOMEPAGE //
import { Router } from "express";
import dotenv from 'dotenv';
import authController from '../controllers/authController.js';
import method from '../middlewares/authorization.js';
import fetch from "node-fetch";
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

//DASHBOARD//

router.get('/Inicio', authController.isAuthenticated, async (req, res) => {
    res.render('dashInicio');
});

router.get('/Publicaciones', authController.isAuthenticated, async (req, res) => {
    res.render('dashPublicaciones');
});

router.get('/CrearPublicacion', authController.isAuthenticated, async (req, res) => {
    res.render('dashCrearPubli');
});

router.get('/EditarPublicacion', authController.isAuthenticated, async (req, res) => {
    res.render('dashEditarPubli');
});

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

// editar perfil
router.get('/EditarPerfil', async (req, res) => {
    res.render('dashEditarPerfil');
});

//router para los métodos del controller
router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/logout', authController.logout)

export default router;
