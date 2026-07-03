import { createClient } from '@supabase/supabase-js';

// Inizializza Supabase una sola volta
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // 1. Controlla che sia un POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // 2. LOG DI DEBUG (Fondamentale!)
    // Questo ti mostrerà esattamente cosa sta arrivando da Telegram nei log di Vercel
    console.log("PAYLOAD RICEVUTO:", JSON.stringify(req.body, null, 2));

    const { message } = req.body;

    // 3. Verifichiamo se c'è un pagamento riuscito
    if (message && message.successful_payment) {
        const userId = message.from.id;

        try {
            console.log(`Tentativo inserimento DB per utente: ${userId}`);
            
            const { error } = await supabase
                .from('utenti_paganti')
                .upsert(
                    { telegram_id: userId },
                    { onConflict: 'telegram_id' }
                );

            if (error) throw error;

            console.log(`Pagamento confermato e salvato per: ${userId}`);
            return res.status(200).json({ status: 'success' });

        } catch (err) {
            console.error('Errore durante l\'aggiornamento del DB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Risposta standard per altri messaggi
    return res.status(200).json({ status: 'ignored' });
}