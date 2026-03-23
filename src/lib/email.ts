import { BrevoClient } from '@getbrevo/brevo';

let client: BrevoClient | null = null;

function getClient() {
    if (!client) {
        client = new BrevoClient({
            apiKey: import.meta.env.BREVO_API_KEY || process.env.BREVO_API_KEY || '',
        });
    }
    return client;
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:4321';
    const resetLink = `${siteUrl}/reset-password?token=${token}`;
    const senderEmail = import.meta.env.SENDER_EMAIL || process.env.SENDER_EMAIL || 'onboarding@brevo.com';
    const apiKey = import.meta.env.BREVO_API_KEY || process.env.BREVO_API_KEY;
    
    console.log(`[Email Service] BREVO_API_KEY present: ${!!apiKey}`);
    console.log(`[Email Service] SENDER_EMAIL: ${senderEmail}`);
    
    // In development without an API key, we just log the link
    if (!apiKey || apiKey === 'mock') {
        console.log("-----------------------------------------");
        console.log("MOCK EMAIL SENT (BREVO MODE)");
        console.log(`To: ${email}`);
        console.log(`From: ${senderEmail}`);
        console.log(`Link: ${resetLink}`);
        console.log("-----------------------------------------");
        return { success: true, mock: true };
    }

    try {
        const brevo = getClient();
        const response = await brevo.transactionalEmails.sendTransacEmail({
            subject: "پاس ورڈ ری سیٹ کریں - فکرِ اسلام",
            htmlContent: `
                <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #065f46;">فکرِ اسلام - پاس ورڈ ری سیٹ</h1>
                    <p>آپ نے اپنے اکاؤنٹ کا پاس ورڈ ری سیٹ کرنے کی درخواست کی ہے۔</p>
                    <p>پاس ورڈ تبدیل کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">پاس ورڈ ری سیٹ کریں</a>
                    </div>
                    <p style="margin-top: 20px; color: #64748b; font-size: 14px;">اگر آپ نے یہ درخواست نہیں کی تو براہ کرم اس ای میل کو نظر انداز کریں۔</p>
                    <p style="color: #64748b; font-size: 14px;">یہ لنک 1 گھنٹے کے لیے کارآمد ہے۔</p>
                </div>
            `,
            sender: { name: "Fikr Islam", email: senderEmail },
            to: [{ email: email }]
        });

        console.log('[Brevo] Email sent successfully:', response);
        return { success: true, messageId: response.messageId || 'sent' };
    } catch (err) {
        console.error("[Brevo Error]", err);
        throw err;
    }
}
