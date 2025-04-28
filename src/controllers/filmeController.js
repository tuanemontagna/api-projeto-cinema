import fs from "fs";
import Filme from "../models/FilmeModel.js";
import uploadFile from '../utils/uploadFile.js';

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if(!id) {
            const response = await Filme.findAll({
                order: [['id', 'desc']],
            });
        
            return res.status(200).send({
                message: 'dados encontrados',
                data: response,
            });
        }

        const response = await Filme.findOne({
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

const create = async (corpo, req, res) => {
    try {
        const {
            nome,
            descricao,
            autor,
            duracao
        } = corpo

        if(req.files && req.files.cartaz) {
            const cartaz = req.files.cartaz;
            const uploadImagem = await uploadFile(cartaz, { id: Date.now(), tipo: 'imagem', tabela: 'filme' }, req.res);
            const caminhoImagem = uploadImagem.message;

            const response = await Filme.create({
                nome,
                descricao,
                autor,
                duracao,
                imagem: caminhoImagem,
            });

            return response;
        } else {
            return res.send({
                message: "enviar uma imagem de cartaz é obrigatoria",
            })
        }


    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async(corpo, id, req) => {
    try {
        const response = await Filme.findOne({
            where: {
                id
            }
        });

        if(!response) {
            throw new Error('não achou');
        }

        if(req.files && req.files.cartaz) {
            const cartaz = req.files.cartaz;
            const uploadImagem = await uploadFile(cartaz, { id: Date.now(), tipo: 'imagem', tabela: 'filme' }, req.res);
            const caminhoImagem = uploadImagem.message;

            if(response.imagem) {
                fs.unlinkSync(response.imagem);
            }

            response.imagem = caminhoImagem;
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
        let corpo = req.body;

        if(!id) {
            const response = await create(req.body);
            return res.status(201).send({
                message: 'criado com sucesso',
                data: response
            });
        }

        if (req.files && req.files.cartaz) {
            const upload = await uploadFile(req.files.cartaz, {
                tipo: 'imagem',
                tabela: 'filme',
                id: id ? id : 'temp' 
            }, res);

            if (upload.type === 'erro') {
                return res.status(400).send({ 
                    message: upload.message 
                });
            }
            corpo.caminhoImagem = upload.message.replace('public/', ''); 
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

        const response = await Filme.findOne({
            where: {
                id
            }
        });

        if(!response) {
            return res.status(404).send('nao achou');
        }

        if(response.imagem) {
            fs.unlinkSync(response.imagem);
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
}