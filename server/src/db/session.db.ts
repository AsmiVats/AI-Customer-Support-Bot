import mongoose from 'mongoose';

const MessageSchema: any = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'bot'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ConversationSchema: any = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [MessageSchema]
}, { timestamps: true });

export const Conversation = mongoose.model('Conversation', ConversationSchema);

//create a new conversation/session
export const createConversation = async (userId: string) => {
    const conv = new Conversation({ userId, messages: [] });
    await conv.save();
    return conv;
};

//add a message to an existing conversation/session
export const appendMessage = async (conversationId: string, sender: 'user' | 'bot', text: string) => {
    const conv = await Conversation.findById(conversationId);
    if(!conv) throw new Error('Conversation not found');
    conv.messages.push({ sender, text, timestamp: new Date() } as any);
    await conv.save();
    return conv;
};

//get conversation by id
export const getConversation = async (conversationId: string) => {
    const conv = await Conversation.findById(conversationId).lean();
    return conv;
};

//end a conversation/session
export const endConversation = async (conversationId: string) => {
    const conv = await Conversation.findById(conversationId);
    if(!conv) throw new Error('Conversation not found');
    conv.messages.push({ sender: 'bot', text: '[Conversation ended]', timestamp: new Date() } as any);
    await conv.save();
    return conv;
};

// list conversations for a given user
export const listConversations = async (userId: string) => {
    const convs = await Conversation.find({ userId, 'messages.0': { $exists: true } }).sort({ updatedAt: -1 }).lean();
    return convs;
};