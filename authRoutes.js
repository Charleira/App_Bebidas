const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
//Lista de produtos
router.get('/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    dbConnection.query(sql, (err, results) => {
       if (err) throw err;
       res.json(results);
    });
   });

// Adicionar Produtos   
router.post('/add-product', (req, res) => {
    let product = req.body;
    let sql = 'INSERT INTO products SET ?';
    db.query(sql, product, (err, result) => {
        if (err) throw err;
        res.send('Product added...');
    });
    });

// Adicionar ao carrinho
router.post('/addToCart', async (req, res) => {
    try {
        // Access the product from the database
        const product = await Product.findById(req.body.productId);

        // Access the cart from the user's session
        let cart = req.session.cart;

        // If there is no cart, create an empty cart
        if (!cart) {
            cart = [];
        }

        // Add the product to the cart
        let productInCart = cart.find(item => item.productId == req.body.productId);
        if (productInCart) {
            productInCart.quantity += req.body.quantity;
        } else {
            cart.push({ productId: req.body.productId, quantity: req.body.quantity });
        }

        // Update the session
        req.session.cart = cart;

        // Return a response to the client
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, error: err.toString() });
    }
});

//Adicionar Pedido
router.post('/addOrder', (req, res) => {
    const orderData = req.body;
   
    connection.query('INSERT INTO orders SET ?', orderData, (error, results, fields) => {
       if (error) throw error;
   
       res.send({ message: 'Order added successfully!', data: results });
    });
   });

module.exports = router;
