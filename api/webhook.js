import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const update = req.body;
    console.log("DEBUG WEBHOOK:", JSON.stringify(update, null, 2));

    // 1. GESTIONE PRE-CHECKOUT (Fondamentale per le Stars)
    if (update.pre_checkout_query) {
        console.log("Ricevuta pre_checkout_query, autorizzo il pagamento...");
        
        // Rispondi a Telegram per autorizzare il pagamento
        await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pre_checkout_query_id: update.pre_checkout_query.id,
                ok: true
            })
        });
        return res.status(200).json({ status: 'ok' });
    }

    // 2. GESTIONE PAGAMENTO RIUSCITO
    if (update.message && update.message.successful_payment) {
        const userId = update.message.from.id;
        console.log(`Pagamento confermato per: ${userId}`);

        await supabase
            .from('utenti_paganti')
            .upsert({ telegram_id: userId }, { onConflict: 'telegram_id' });

        return res.status(200).json({ status: 'success' });
    }

    return res.status(200).json({ status: 'ignored' });
}