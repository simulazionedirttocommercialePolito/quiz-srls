import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { message } = req.body;

    // Telegram ci manda una conferma quando il pagamento va a buon fine
    if (message?.successful_payment) {
        const userId = message.from.id;
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
        await supabase.from('utenti_paganti').insert({ telegram_id: userId });
        return res.status(200).send('OK');
    }
    
    return res.status(200).send('Ignored');
}