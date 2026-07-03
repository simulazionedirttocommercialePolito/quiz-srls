export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { userId } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!BOT_TOKEN) {
        console.error("ERRORE: BOT_TOKEN non trovato nelle variabili di ambiente!");
        return res.status(500).json({ error: "Configurazione server mancante" });
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
                prices: [{ label: "Accesso", amount: 1 }]
            })
        });

        const data = await response.json();
        
        // Logga la risposta di Telegram per debuggare
        console.log("Risposta da Telegram:", data);

        if (!data.ok) {
             console.error("Telegram ha risposto con errore:", data.description);
             return res.status(500).json({ error: data.description });
        }

        res.status(200).json({ url: data.result });
        
    } catch (error) {
        console.error("Errore fatale:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
}