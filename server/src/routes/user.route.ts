import { Router, Request, Response } from 'express';
import { User } from '../db/user.db.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../lib/utlis.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

router.post('/signup', async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password are required' });

        const existing = await User.findOne({ email }).lean();
        if (existing) return res.status(409).json({ error: 'User with this email already exists' });

        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        const user = new User({ username, email, password: hashed });
        await user.save();

        const token = generateToken(user,res);

        return res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        console.error('Signup error', err);
        return res.status(500).json({ error: 'Unable to create user' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, (user as any).password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken(user,res);

        return res.json({ success: true, token, user: { id: user._id, username: (user as any).username, email: (user as any).email } });
    } catch (err) {
        console.error('Login error', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});



export default router;