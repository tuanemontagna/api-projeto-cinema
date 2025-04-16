import pessoasController from "../controllers/pessoasController.js";

export default (app) => {
    app.get('/pessoas', pessoasController.getAll);
    app.get('/pessoas/:id', pessoasController.getId);
    app.get('/pessoa/:idade', pessoasController.getMaioridade);
}