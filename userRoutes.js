const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../db'); // Assuming you have a database connection pool in a separate file

// Private Route
router.get("/:id", checkToken, async (req, res) => {
    const id = req.params.id;

    // Check if user exists
    const [userRows] = await pool.promise().query('SELECT * FROM users WHERE id = ?', [id]);
    const user = userRows[0];

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    res.status(200).json({ user });
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: 'Acesso Negado' });
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next();
    } catch (error) {
        res.status(400).json({ msg: 'Token Inválido' });
    }
}

module.exports = router;
