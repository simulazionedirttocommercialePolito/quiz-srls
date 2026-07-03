import { createClient } from '@supabase/supabase-js';

// Inizializziamo il client una sola volta per migliorare le performance
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    // Telegram invia i webhook tramite POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { message } = req.body;

    // Verifichiamo se è un pagamento riuscito
    if (message?.successful_payment) {
        const userId = message.from.id;

        try {
            // Usiamo upsert: se l'ID esiste già non succede nulla, 
            // se non esiste lo crea. È più sicuro di insert.
            const { error } = await supabase
                .from('utenti_paganti')
                .upsert(
                    { telegram_id: userId },
                    { onConflict: 'telegram_id' }
                );

            if (error) throw error;

            console.log(`Pagamento confermato per l'utente: ${userId}`);
            return res.status(200).json({ status: 'success', message: 'User added' });

        } catch (err) {
            console.error('Errore durante l\'aggiornamento del DB:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Se Telegram invia altri tipi di messaggi (che non sono pagamenti),
    // rispondiamo comunque 200 per dire "abbiamo ricevuto, tutto ok"
    return res.status(200).json({ status: 'ignored' });
}