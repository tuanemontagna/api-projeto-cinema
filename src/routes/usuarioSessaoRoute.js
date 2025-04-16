import usuarioSessaoController from "../controllers/usuarioSessaoController.js";

export default (app) => {
    app.get('/usuariosessao', usuarioSessaoController.get);
    app.get('/usuariosessao/:id', usuarioSessaoController.get);
    app.post('/usuariosessao', usuarioSessaoController.persist);
    app.patch('/usuariosessao/:id', usuarioSessaoController.persist);
    app.delete('/usuariosessao/:id', usuarioSessaoController.destroy);
}