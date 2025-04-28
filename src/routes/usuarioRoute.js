import usuarioController from "../controllers/usuarioController.js";
import autenticarUsuarioMiddleware from "../middlewares/autenticarUsuarioMiddleware.js";

export default (app) => {
    app.get('/usuario', usuarioController.get);
    app.get('/usuario/get-data-by-token', autenticarUsuarioMiddleware, usuarioController.getDataByToken);
    app.get('/usuario/:id', usuarioController.get);
    app.post('/usuario', usuarioController.persist);
    app.post('/usuario/login', usuarioController.login);
    app.post('/usuario/esqueci-minha-senha', usuarioController.recuperarSenha);
    app.post('/usuario/redefinir-senha', usuarioController.redefinirSenha);
    app.patch('/usuario/:id', usuarioController.persist);
    app.delete('/usuario/:id', usuarioController.destroy);
}