export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { userId } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
        return res.status(500).json({ error: "BOT_TOKEN non configurato" });
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "Accesso Quiz",
                description: "Accesso illimitato al quiz",
                payload: "user_payment_" + userId,
                currency: "XTR", 
                prices: [{ label: "Accesso", amount: 50 }] 
            })
        });

        const data = await response.json();
        
        // --- QUESTO È IL CONTROLLO CHE MANCAVA ---
        if (!data.ok) {
            console.error("Errore da Telegram:", data.description);
            return res.status(500).json({ error: "Telegram ha rifiutato la richiesta: " + data.description });
        }
        // ------------------------------------------

        return res.status(200).json({ url: data.result });

    } catch (err) {
        console.error("Errore server:", err);
        return res.status(500).json({ error: err.message });
    }
}