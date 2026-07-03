export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { userId } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: "Accesso Quiz",
            description: "Accesso illimitato al quiz",
            payload: "user_payment_" + userId,
            currency: "XTR", // Questo indica che vuoi Telegram Stars
            prices: [{ label: "Accesso", amount: 50 }] // Costo: 50 Stars (cambia il numero se vuoi)
        })
    });

    const data = await response.json();
    res.status(200).json({ url: data.result });
}