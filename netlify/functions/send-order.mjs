export async function handler(event, context) {
    // قبول طلبات POST فقط
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body);
        const { telegramMessage } = body;

        // البيانات الخاصة بك
        const TELEGRAM_BOT_TOKEN = '8623966265:AAFEYGHRZ7GJbmAliGzTnTQcFHsZdSvMzv4';
        const TELEGRAM_CHAT_ID = '7161........4'; // ضع الـ Chat ID الخاص بك هنا

        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        // السيرفر يراسل تلغرام بدلاً من متصفح العميل
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage
            })
        });

        const data = await response.json();

        if (data.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, error: data.description })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
}