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

        // قراءة المفاتيح بأمان من متغيرات البيئة في Netlify
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // التحقق من وجود المتغيرات
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: 'Telegram environment variables are missing on Netlify.' })
            };
        }

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
