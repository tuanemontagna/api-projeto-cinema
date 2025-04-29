import fs from "fs";
import Filme from "../models/FilmeModel.js";
import uploadFile from '../utils/uploadFile.js';

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await Filme.findAll({
                order: [['id', 'desc']],
            });

            return res.status(200).send({
                message: 'dados encontrados',
                data: response,
            });
        }

        const response = await Filme.findOne({
            where: { id }
        });

        if (!response) {
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
};

const create = async (corpo, req, res) => {
    try {
        const { nome, descricao, autor, duracao } = corpo;

        const filmeCriado = await Filme.create({
            nome,
            descricao,
            autor,
            duracao,
        });

        const cartaz = req.files.cartaz;
        const upload = await uploadFile(
            cartaz,
            { id: filmeCriado.id, tipo: 'imagem', tabela: 'filme' },
            res
        );

        if (upload.type === 'erro') {
            await filmeCriado.destroy(); 
            return res.send({ 
                message: upload.message
            });
        }

        const caminhoImagem = upload.message.replace('public/', '');
        filmeCriado.caminhoImagem = caminhoImagem;
        await filmeCriado.save();

        return filmeCriado;

    } catch (error) {
        throw new Error(error.message);
    }
};



const update = async (corpo, id, req) => {
    try {
        const response = await Filme.findOne({ where: { id } });

        if (!response) {
            throw new Error('Filme não encontrado');
        }

        if (req.files && req.files.cartaz) {
            const cartaz = req.files.cartaz;
            const upload = await uploadFile(cartaz, { id: Date.now(), tipo: 'imagem', tabela: 'filme' });

            if (upload.type === 'erro') {
                throw new Error(upload.message);
            }

            if (response.caminhoImagem) {
                fs.unlinkSync(`./public/${response.caminhoImagem}`);
            }

            response.caminhoImagem = upload.message.replace('public/', '');
        }
        
        Object.keys(corpo).forEach((item) => {
            if (item !== 'caminhoImagem') {
                response[item] = corpo[item];
            }
        });

        await response.save();
        return response;

    } catch (error) {
        throw new Error(error.message);
    }
};


const persist = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        const corpo = req.body;

        if (!id) {
            const response = await create(corpo, req, res);
            return res.status(201).send({
                message: 'criado com sucesso',
                data: response
            });
        }

        const response = await update(corpo, id, req);
        return res.status(200).send({
            message: 'atualizado com sucesso',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};


const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            return res.status(400).send('informe please');
        }

        const response = await Filme.findOne({ where: { id } });

        if (!response) {
            return res.status(404).send('não achou');
        }

        if (response.caminhoImagem) {
            fs.unlinkSync(`./public/${response.caminhoImagem}`);
        }

        await response.destroy();

        return res.status(200).send({
            message: 'registro excluído',
            data: response
        });

    } catch (error) {
        return res.status(500).send({
            message: error.message
        });
    }
};

export default {
    get,
    persist,
    destroy,
};
