// api/webhook.js
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
    // 1. Gestione del pagamento (Webhook di Telegram)
    if (req.body.message && req.body.message.successful_payment) {
        const userId = req.body.message.from.id;
        
        // Aggiorna Supabase
        await supabase
            .from('users')
            .upsert({ telegram_id: userId, is_paid: true });
            
        return res.status(200).send('OK');
    }
    
    // 2. Risposta base per bot
    await bot.handleUpdate(req.body);
    return res.status(200).send('Bot Running');
};