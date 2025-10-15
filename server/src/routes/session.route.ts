import { Router, Request, Response } from 'express';
import { botFunction } from '../lib/llm.js';
import { createConversation, appendMessage, getConversation, endConversation } from '../db/session.db.js';
import { listConversations } from '../db/session.db.js';

const router = Router();


router.post('/new', async (req: Request, res: Response) => {
    try{
        console.log('Request body:', req.body);
        const { userId } = req.body;
        if(!userId) return res.status(400).json({ error: 'userId is required' });
        // validate format to avoid Mongoose CastError
        const mongoose = (await import('mongoose')).default
        if(!mongoose.Types.ObjectId.isValid(String(userId))) return res.status(400).json({ error: 'userId must be a valid ObjectId' });

        const conv = await createConversation(userId);
        return res.status(201).json({ sessionId: conv._id });
    }catch(err){
        console.error('Error creating session', err);
        return res.status(500).json({ error: 'Unable to create session' });
    }
});


router.post('/chat', async (req: Request, res: Response) => {
    try{
        const { message, sessionId } = req.body;
        if(!message || !sessionId) return res.status(400).json({ error: 'message and sessionId are required' });

        // persist user message
        await appendMessage(sessionId, 'user', message);

        // fetch history for context
        const conv = await getConversation(sessionId) as any;
        // conv may be an object or an array depending on how .lean() behaved; handle both shapes
        const rawMessages = Array.isArray(conv) ? (conv[0]?.messages || []) : (conv?.messages || []);
        const context = (rawMessages || []).slice(-20).map((m: any) => ({ sender: m.sender, text: m.text }));

        // prepare prompt
        const prompt = `You are a customer support assistant. Use the conversation context to answer the user's question and provide 3 possible next questions. If you cannot answer, say so and recommend escalation.`;

        // call LLM
        console.log("prompt:",prompt, "context:",context);
        const botReply = await botFunction(prompt + '\n\nUser: ' + message, context);
        console.log('Bot reply:', botReply);
        const replyText = botReply.text || 'Sorry, I could not produce a response.';

        // simple escalation detection
        const escalationIndicators = ['i don\'t know', 'unable to', 'cannot', 'escalate', 'not sure', 'transfer to'];
        const needsEscalation = escalationIndicators.some(ind => replyText.toLowerCase().includes(ind));

        // persist bot reply
        await appendMessage(sessionId, 'bot', replyText);

        return res.status(200).json({ reply: replyText, escalation: needsEscalation, raw: botReply.raw });
    }catch(err){
        console.error('Error in /chat', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try{
        const sessionId = req.params.id;
        const conv = await getConversation(sessionId);
        if(!conv) return res.status(404).json({ error: 'Session not found' });
        return res.status(200).json(conv);
    }catch(err){
        console.error('Error fetching session', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// list conversations for a user (client should pass userId; in production derive from auth)
router.get('/list/:userId', async (req: Request, res: Response) => {
    try{
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({ error: 'userId is required' });
        const mongoose = (await import('mongoose')).default
        if(!mongoose.Types.ObjectId.isValid(String(userId))) return res.status(400).json({ error: 'userId must be a valid ObjectId' });
        const convs = await listConversations(userId);
        return res.status(200).json({ conversations: convs });
    }catch(err){
        console.error('Error listing sessions', err);
        return res.status(500).json({ error: 'Unable to list sessions' });
    }
});

router.post('/session/:id/end', async (req: Request, res: Response) => {
    try{
        const sessionId = req.params.id;
        const conv = await endConversation(sessionId);
        return res.status(200).json({ success: true, session: conv });
    }catch(err){
        console.error('Error ending session', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



export default router;