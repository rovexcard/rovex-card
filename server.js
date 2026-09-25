const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// قاعدة بيانات مؤقتة للحسابات والأكواد
const usersDB = []; 
const otpStore = {};

// إعدادات إرسال البريد الإلكتروني الحقيقي (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL@gmail.com', // اكتب بريدك الإلكتروني هنا
        pass: 'YOUR_APP_PASSWORD'      // اكتب كلمة مرور التطبيقات من جوجل هنا
    }
});

// 1. مسار إنشاء حساب وإرسال كود OTP حقيقي للإيميل
app.post('/api/register', async (req, res) => {
    const { email, pass } = req.body;
    
    // إنشاء كود مكون من 6 أرقام
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, pass };

    try {
        await transporter.sendMail({
            from: '"ROVEX CARD" <no-reply@rovex.com>',
            to: email,
            subject: 'كود تفعيل حسابك في متجر ROVEX CARD',
            text: `رمز التحقق الخاص بك هو: ${otp}`
        });
        res.status(200).json({ message: 'تم إرسال كود التحقق إلى بريدك الإلكتروني بنجاح' });
    } catch (err) {
        res.status(500).json({ message: 'فشل إرسال البريد الإلكتروني، تأكد من صحة الإيميل أو إعدادات السيرفر' });
    }
});

// 2. مسار تسجيل الدخول والتحقق من وجود الحساب
app.post('/api/login', (req, res) => {
    const { email, pass } = req.body;
    const user = usersDB.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'عذراً، هذا الحساب غير موجود لدينا! يرجى إنشاء حساب جديد.' });
    }
    if (user.pass !== pass) {
        return res.status(401).json({ message: 'كلمة المرور غير صحيحة!' });
    }

    res.status(200).json({ message: 'تم تسجيل الدخول بنجاح', user });
});

app.listen(3000, () => console.log('السيرفر يعمل الآن بنجاح على المنفذ 3000'));
