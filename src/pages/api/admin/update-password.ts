import type { APIRoute } from 'astro';
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const user = locals.user;
        if (!user) {
            return new Response('آپ لاگ ان نہیں ہیں۔', { status: 401 });
        }

        const formData = await request.formData();
        const currentPassword = formData.get('currentPassword')?.toString();
        const newPassword = formData.get('newPassword')?.toString();
        const confirmPassword = formData.get('confirmPassword')?.toString();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return new Response('نامکمل معلومات۔', { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return new Response('پاس ورڈ مطابقت نہیں رکھتے۔', { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('fikreislam');
        const users = db.collection('users');

        // 1. Find the user in DB
        const dbUser = await users.findOne({ email: user.email });
        if (!dbUser) {
            return new Response('صارف نہیں ملا۔', { status: 404 });
        }

        // 2. Verify current password
        const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isMatch) {
            return new Response('موجودہ پاس ورڈ غلط ہے۔', { status: 400 });
        }

        // 3. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // 4. Update password
        await users.updateOne(
            { _id: dbUser._id },
            { $set: { password: hashedPassword } }
        );

        return new Response(JSON.stringify({ success: true, message: 'پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔' }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("[Update Password Error]", error);
        return new Response('سسٹم میں خرابی۔ دوبارہ کوشش کریں۔', { status: 500 });
    }
}
