import type { APIRoute } from 'astro';
import clientPromise from '../../../lib/mongodb';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();

        if (!email) {
            return new Response('ای میل ضروری ہے۔', { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('fikreislam');
        const users = db.collection('users');

        // 1. Check if user exists
        const user = await users.findOne({ email });
        if (!user) {
            // security best practice: don't reveal if user exists
            return new Response(JSON.stringify({ success: true }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // 3. Store hashed token in DB
        await users.updateOne(
            { email },
            { 
                $set: { 
                    resetToken: hashedToken,
                    resetTokenExpires: expires
                } 
            }
        );

        // 4. Send Email (non-hashed token)
        await sendPasswordResetEmail(email, token);

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("[Request Reset Error]", error);
        return new Response('سسٹم میں خرابی۔ دوبارہ کوشش کریں۔', { status: 500 });
    }
}
