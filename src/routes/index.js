import clienteRoute from "./clienteRoute.js";
import livroRoute from "./livroRoute.js";
import pessoasRoute from "./pessoasRoute.js";
import emprestimoRoute from "./emprestimoRoute.js";

function Routes(app) {
    livroRoute(app);
    pessoasRoute(app);
    clienteRoute(app);
    emprestimoRoute(app);
}


export default Routes;