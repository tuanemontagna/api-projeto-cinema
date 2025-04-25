import cargoController from "../controllers/cargoController.js";
import tempoMiddleware from "../middlewares/tempoMiddleware.js";

export default (app) => {
    app.get('/cargo', tempoMiddleware, cargoController.get);
    app.get('/cargo/:id', tempoMiddleware, cargoController.get);
    app.post('/cargo', tempoMiddleware, cargoController.persist);
    app.patch('/cargo/:id', tempoMiddleware, cargoController.persist);
    app.delete('/cargo/:id', tempoMiddleware, cargoController.destroy);
}