import Usuario from "../models/UsuarioModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Cargo from "../models/CargoModel.js";

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if(!id) {
            const response = await Usuario.findAll({
                order: [['id', 'desc']],
            });
        
            return res.status(200).send({
                message: 'dados encontrados',
                data: response,
            });
        }

        const response = await Usuario.findOne({
            where: {
                id: id
            }
        });

        if(!response) {
            return res.status(404).send('não achou');
        }

        return res.status(200).send({
            message: 'dados encontrados',
            data: response,
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const create = async (corpo, res) => {
    try {
        const {
            nome,
            cpf,
            email,
            estudante,
            password,
            idCargo
        } = corpo

        const verificaEmail = await Usuario.findOne({
            where: {email}
        });

        if(verificaEmail) {
            return res.status(400).send({
                message: 'ja existe um usuario com esse email'
            });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);

        const response = await Usuario.create({
            nome,
            cpf,
            email,
            estudante,
            idCargo,
            passwordHash,
        });

        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const login = async (req, res) => {
    try {
        const  {
            email, 
            password,
        } = req.body;

        const user = await Usuario.findOne({
            where: {email}
        });

        if(!user) {
            return res.status(400).send({
                message: 'usuario ou senha incorretos'
            });
        }

        const comparacaoSenha = await bcrypt.compare(password, user.passwordHash);

        if(comparacaoSenha) {
            const token = jwt.sign({idUsuario: user.id, nome: user.nome, email: user.email, idCargo: user.idCargo}, process.env.TOKEN_KEY, {expiresIn: '8h'});
            return res.status(200).send({
                message: 'login efetuado',
                reponse: token
            })
        } else {
            return res.status(400).send({
                message: 'usuario ou senha incorretos'
            });
        }

    } catch (error) {
        throw new Error(error.message);
    }
}

const getDataByToken = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        if(!token) {
            return res.status(400).send({ 
                message: 'token nao existe' 
            });
        }
        const user = jwt.verify(token, process.env.TOKEN_KEY);

        const usuario = await Usuario.findOne({
            where: {id: user.idUsuario},
            include: [{
                model: Cargo,
                as: 'cargo',
                attributes: ['descricao']
            }]
        });

        if(!usuario) {
            return res.status(404).send({ 
                message: 'usuario nao encontrado' 
            });
        }
        
        return res.status(200).send({
            data: {
                nome: usuario.nome,
                email: usuario.email,
                cargo: usuario.cargo.descricao
            }
        })

    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async(corpo, id) => {
    try {
        const response = await Usuario.findOne({
            where: {
                id
            }
        });

        if(!response) {
            throw new Error('não achou');
        }
        Object.keys(corpo).forEach((item) => response[item] = corpo[item]);
        await response.save();
        return response;

    } catch (error) {
        throw new Error(error.message);
    }
}

const persist = async(req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if(!id) {
            const response = await create(req.body);
            return res.status(201).send({
                message: 'criado com sucesso',
                data: response
            });
        }

        const response = await update(req.body, id);
        return res.status(201).send({
            message: 'atualizado com sucesso',
            data: response
        });
        
    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if(!id) {
            return res.status(400).send('informe please');
        }

        const response = await Usuario.findOne({
            where: {
                id
            }
        });

        if(!response) {
            return res.status(404).send('nao achou');
        }
        await response.destroy();

        return res.status(200).send({
            message: 'registro excluido',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
}


export default {
    get,
    persist,
    destroy,
    login,
    getDataByToken,
}