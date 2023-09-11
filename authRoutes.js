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

// Recovery Password
router.post('/recovery', async (req, res) => {
    let email = req.body.email;

    const [userRows] = await pool.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = userRows[0];

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    } else {
        var message = {
            from: process.env.SMTP_USERNAME,
            to: email,
            subject: `Recuperação de Senha`,
            text: "",
            html: `
                <div>
                    <h1>Recuperação de Senha</h1>
                    <h2>Senha de recuperação atual: ${user.password}</h2>
                </div>`
        };

        smtpTransport.sendMail(message, (error, response) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email enviado: " + response.message);
                smtpTransport.close();
                res.redirect("../index.html");
            }
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validations
    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória' });
    }

    // Check if user exists
    const [userRows] = await pool.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const user = userRows[0];

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Check if password matches
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(404).json({ msg: 'Senha inválida' });
    }

    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user.id }, secret);

        if (res.status(200)) {
            res.redirect('./../bebidas.html');
        }
    } catch (err) {
        console.log(error);
        res.status(500).json({
            msg: 'Infelizmente ocorreu um erro com o servidor, tente novamente mais tarde!'
        });
    }
});

module.exports = router;
