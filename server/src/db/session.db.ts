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

// Helper: create a new conversation for a user
export const createConversation = async (userId: string) => {
    const conv = new Conversation({ userId, messages: [] });
    await conv.save();
    return conv;
};

// Helper: append message to conversation
export const appendMessage = async (conversationId: string, sender: 'user' | 'bot', text: string) => {
    const conv = await Conversation.findById(conversationId);
    if(!conv) throw new Error('Conversation not found');
    conv.messages.push({ sender, text, timestamp: new Date() } as any);
    await conv.save();
    return conv;
};

export const getConversation = async (conversationId: string) => {
    const conv = await Conversation.findById(conversationId).lean();
    return conv;
};

export const endConversation = async (conversationId: string) => {
    // Marking end can be done by deleting or tagging; we'll tag by adding a meta message
    const conv = await Conversation.findById(conversationId);
    if(!conv) throw new Error('Conversation not found');
    conv.messages.push({ sender: 'bot', text: '[Conversation ended]', timestamp: new Date() } as any);
    await conv.save();
    return conv;
};