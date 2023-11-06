const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, connection } = require('./db'); // Assuming you have a database connection pool in a separate file

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, address, phone } = req.body;

    console.log(req.body)
    if (!email.includes("@") && !email.includes(".")) {
        return res.status(422).json({ msg: 'Insira um email válido' });
    }

    // Validations
    if (!name) {
        return res.status(422).json({ msg: 'O nome é obrigatório' });
    }

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'A senha é obrigatória' });
    }


    // Check if user exists
    const [userRows] = await connection.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const userExists = userRows[0];

    if (userExists) {
        return res.status(422).json({ msg: 'Email já utilizado, tente outro por favor' });
    }

    // Create password hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    try {
        await connection.promise().query('INSERT INTO usuarios (nome, email, senha, endereco, telefone) VALUES (?, ?, ?, ?, ?)', [name, email, passwordHash, address, phone]);
        res.status(201).send();
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


// Rota para redefinir a senha
router.post('/reset-password', async (req, res) => {
    const newPassword = req.body.newPassword;
    const userId = await axios.get('/recovery');
    try {
        // Verificar se o usuário existe com o ID fornecido
        console.log(userId)
        const [userRows] = await connection.promise().query('SELECT id FROM usuarios WHERE id = ?', [userId]);
        const user = userRows[0];
        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        // Atualizar a senha do usuário no banco de dados
        await connection.promise().query('UPDATE usuarios SET senha = ? WHERE id = ?', [newPassword, userId]);
        res.status(200).json({ msg: 'Senha redefinida com sucesso' });
    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        res.status(500).json({ msg: 'Ocorreu um erro ao redefinir a senha.' });
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
            console.log("ta aqui", user);
            return res.status(404).json({ msg: 'Senha inválida' });
        }

        // Gere um token JWT
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user.id }, secret);

        // Redirecione para a página de bebidas após o login bem-sucedido
        console.log({ accessToken: token, user: { id: user.id, name: user.nome, emai: user.email } });
        res.json({ accessToken: token, user: { id: user.id, name: user.name, emai: user.email, permission: user.vendedor } });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Ocorreu um erro no servidor, tente novamente mais tarde'
        });
    }
});
//Lista de produtos
router.get('/products', (req, res) => {
    const sql = 'SELECT * FROM produtos';
    const resp = connection.query(sql, (err, results) => {
        if (err) throw err;
        return res.json(results);
    });
});
router.get('/topProducts', (req, res) => {
    const sql = 'SELECT * FROM produtos ORDER BY total_vendas DESC LIMIT 3';
    const resp = connection.query(sql, (err, results) => {
        if (err) throw err;
        return res.json(results);
    });
});

// Adicionar Produtos   
router.post('/add-product', (req, res) => {
    let { name, quantity, value, img, category } = req.body;
    connection.promise().query('INSERT INTO produtos (nome, quantidade_estoque, categoria,valor, img) VALUES (?, ?, ?,?, ?)', [name, quantity, category, value, img]);

    res.status(201).send();
});
router.patch('/edit-product', (req, res) => {
    let { id, name, quantity, category, value, img } = req.body;
    connection.promise().query('UPDATE produtos SET nome = ?, quantidade_estoque = ?, categoria = ?, valor = ?, img = ? WHERE id = ?', [name, quantity, category, value, img, id])
    res.status(204).send("")
})
router.post('/delete-product', (req, res) => {
    let { id } = req.body;
    connection.promise().query('DELETE FROM produtos  WHERE id = ?', [id])
    res.status(200).send("")
})
//Adicionar Pedido
router.post('/addOrder', (req, res) => {
    const { userId, total, description, } = req.body;

    connection.promise().query('INSERT INTO pedidos (usuario_id, total,descricao) VALUES (?,?,?)', [userId, total, description]);
    res.status(201).send();
});
router.get('/addOrder', (req, res) => {
    const { userId, total, description, } = req.body;

    connection.promise().query('INSERT INTO pedidos (usuario_id, total,descricao) VALUES (?,?,?)', [userId, total, description]);
    res.status(201).send();
});
router.get('/getHistory/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT pedidos.*, usuarios.nome, usuarios.endereco FROM pedidos JOIN usuarios ON pedidos.usuario_id = usuarios.id WHERE usuario_id = ?;';
    const resp = connection.query(sql,[id], (err, results) => {
        if (err) throw err;
        return res.json(results);
    });
})
router.get('/getHistorySeller', (req, res) => {
    const sql = 'SELECT pedidos.*, usuarios.nome, usuarios.endereco FROM pedidos JOIN usuarios ON pedidos.usuario_id = usuarios.id;';
    const resp = connection.query(sql, (err, results) => {
        if (err) throw err;
        return res.json(results);
    });
})
module.exports = router;
