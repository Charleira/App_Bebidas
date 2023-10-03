const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { pool, connection } = require('./db'); // Assuming you have a database connection pool in a separate file

// Register User
router.post('/register', async (req, res) => {
    const { nome, email, senha, confirmpassword, endereco, telefone } = req.body;

    console.log(req.body)
    if (!email.includes("@") && !email.includes(".")) {
        return res.status(422).json({ msg: 'Insira um email válido' });
    }

    // Validations
    if (!nome) {
        return res.status(422).json({ msg: 'O nome é obrigatório' });
    }

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' });
    }

    if (!senha) {
        return res.status(422).json({ msg: 'A senha é obrigatória' });
    }

    if (senha !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas devem ser iguais' });
    }

    // Check if user exists
    const [userRows] = await connection.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const userExists = userRows[0];

    if (userExists) {
        return res.status(422).json({ msg: 'Email já utilizado, tente outro por favor' });
    }

    // Create password hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(senha, salt);

    // Create user
    try {
        await connection.promise().query('INSERT INTO usuarios (nome, email, senha, endereco, telefone) VALUES (?, ?, ?, ?, ?)', [nome, email, passwordHash, endereco, telefone]);
        res.redirect('');
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Infelizmente ocorreu um erro com o servidor, tente novamente mais tarde!'
        });
    }
});

// Rota para iniciar o processo de recuperação de senha
router.post('/recovery', async (req, res) => {
    const email = req.body.email;

    try {
        // Buscar o ID do usuário pelo email
        const [userRows] = await connection.promise().query('SELECT id FROM usuarios WHERE email = ?', [email]);
        const user = userRows[0];

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        // Redirecionar para a página de redefinição de senha com o ID na URL
        res.redirect(`/NovaSenha.html?userId=${user.id}`);
    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
        res.status(500).json({ msg: 'Ocorreu um erro ao buscar o usuário.' });
    }
});
// Update Password
router.post('/passwordUpdate', async (req, res) => {
    const { senha, confirmpassword } = req.body;
    const userId = req.query.userId;

    if (!senha || senha !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas devem ser iguais' });
    }

    try {
        // Verificar se a senha é a mesma que a senha atual
        const [userRows] = await connection.execute('SELECT senha FROM usuarios WHERE id = ?', [userId]);

        if (userRows.length === 0) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        const user = userRows[0];

        if (senha || null === user.senha) {
            return res.status(200).json({ msg: 'A senha é a mesma, nenhum update necessário.' });
        }

        // Atualizar a senha
        const result = await connection.execute('UPDATE usuarios SET senha = ? WHERE id = ?}}', [senha || null, userId ]);

        if (result[0].affectedRows === 1) {
            return res.status(200).json({ msg: 'Senha atualizada com sucesso' });
        } else {
            return res.status(404).json({ msg: 'Usuário não encontrado ou senha já é a atual.' });
        }
    } catch (error) {
        console.error('Erro ao atualizar a senha no banco de dados:', error);
        res.status(500).json({ msg: 'Ocorreu um erro ao atualizar a senha.' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ msg: 'E-mail e senha são obrigatórios' });
    }

    try {
        // Verifique se o usuário existe
        const [userRows] = await connection.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = userRows[0];

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        // Verifique se a senha corresponde
        const checkPassword = await bcrypt.compare(password, user.senha);
        if (!checkPassword) {
            return res.status(404).json({ msg: 'Senha inválida' });
        }

        // Gere um token JWT
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user.id }, secret);

        // Redirecione para a página de bebidas após o login bem-sucedido
        res.redirect('/bebidas.html');

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Ocorreu um erro no servidor, tente novamente mais tarde'
        });
    }
});

module.exports = router;
