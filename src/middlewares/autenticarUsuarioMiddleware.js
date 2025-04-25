import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        if(!token) {
            return res.status(400).send({ 
                message: 'token nao existe' 
            });
        }

        const user = jwt.verify(token, process.env.TOKEN_KEY);

        req.user = user;
        next();
        console.log('funcionou');

    } catch (error) {
        return res.status(500).send({
            error: error.message
        });
    }
}