import type { APIRoute } from 'astro';
import clientPromise from '../../../lib/mongodb';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const token = formData.get('token')?.toString();
        const password = formData.get('password')?.toString();

        if (!token || !password) {
            return new Response('نامکمل معلومات۔', { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('fikreislam');
        const users = db.collection('users');

        // 1. Hash the incoming raw token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // 2. Find user with this token and ensure it hasn't expired
        const user = await users.findOne({
            resetToken: hashedToken,
            resetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return new Response('لنک غلط ہے یا اس کی مدت ختم ہو چکی ہے۔', { status: 400 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Update password and clear token
        await users.updateOne(
            { _id: user._id },
            { 
                $set: { password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpires: "" }
            }
        );

        return new Response(JSON.stringify({ success: true }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("[Reset Password Error]", error);
        return new Response('سسٹم میں خرابی۔ دوبارہ کوشش کریں۔', { status: 500 });
    }
}
