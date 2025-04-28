import jwt from 'jsonwebtoken';
import Usuario from '../models/UsuarioModel.js';
import Cargo from '../models/CargoModel.js';

export async function admin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(400).send({ 
                message: 'token não existe' 
            });
        }

        const user = jwt.verify(token, process.env.TOKEN_KEY);

        const usuario = await Usuario.findOne({
            where: { id: user.idUsuario },
            include: [{
                model: Cargo,
                as: 'cargo',
                attributes: ['descricao']
            }]
        });

        if (!usuario) {
            return res.status(404).send({ 
                message: 'usuário não encontrado' 
            });
        }

        if (!usuario.cargo || usuario.cargo.descricao !== 'admin') {
            return res.status(403).send({
                message: 'sem permissão'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).send({
            error: error.message
        });
    }
}
