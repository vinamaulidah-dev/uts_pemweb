import express from 'express';

const router = express.Router();

router.post('/login', (req, res) => {
    const { nim, password } = req.body;
    // Dummy login validation
    if (nim && password) {
        return res.status(200).json({
            message: "Login successful",
            name: nim,
            token: "dummy-token-invofest"
        });
    }
    return res.status(401).json({ message: "Invalid credentials" });
});

router.post('/register', (req, res) => {
    const { nim, password, name } = req.body;
    if (nim && password) {
        return res.status(201).json({
            message: "Register successful",
            name: name || nim,
            token: "dummy-token-invofest"
        });
    }
    return res.status(400).json({ message: "Invalid input" });
});

export default router;
