import dotenv from 'dotenv';
dotenv.config();

export type BotReply = {
    text: string;
    raw?: any;
};

export const botFunction = async (prompt: string, context: Array<{sender: string; text: string}> = []): Promise<BotReply> => {
   try{
        const fullUrl = `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`;

        
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{  
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });
        if (!response.ok) {
            const message = `API Error: ${response.status} ${response.statusText} `;
            console.error(message);
            throw new Error(message);
        }

        const data = await response.json() as any;
        
        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid API response structure');
        }
        const finalComment = data.candidates[0].content.parts[0].text.trim();

        return { text: finalComment, raw: data };
   }catch(err){
       console.error('Error in botFunction:', err);
       const fallback = "I'm having trouble reaching the AI service right now. Please try again in a moment.";
       return { text: fallback, raw: err };
   }
};