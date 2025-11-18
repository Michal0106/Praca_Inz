import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Reset hasła - Training App",
      html: `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <style>
 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
 .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
 .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
 .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
 .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
 </style>
 </head>
 <body>
 <div class="container">
 <div class="header">
 <h1> Training App</h1>
 </div>
 <div class="content">
 <h2>Reset hasła</h2>
 <p>Otrzymaliśmy prośbę o reset hasła do Twojego konta. Kliknij w poniższy przycisk, aby ustawić nowe hasło:</p>
 <div style="text-align: center;">
 <a href="${resetUrl}" class="button">Zresetuj hasło</a>
 </div>
 <p>Lub skopiuj i wklej poniższy link do przeglądarki:</p>
 <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
 <p><strong>Link jest ważny przez 1 godzinę.</strong></p>
 <p>Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
 </div>
 <div class="footer">
 <p>&copy; 2024 Training App. Wszystkie prawa zastrzeżone.</p>
 </div>
 </div>
 </body>
 </html>
 `,
      text: `
 Reset hasła - Training App
 
 Otrzymaliśmy prośbę o reset hasła do Twojego konta.
 Kliknij w poniższy link, aby ustawić nowe hasło:
 ${resetUrl}
 
 Link jest ważny przez 1 godzinę.
 
 Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość.
 `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Witaj w Training App! ",
      html: `
 <!DOCTYPE html>
 <html>
 <head>
 <meta charset="utf-8">
 <style>
 body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
 .container { max-width: 600px; margin: 0 auto; padding: 20px; }
 .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
 .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
 .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
 .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
 .feature { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
 </style>
 </head>
 <body>
 <div class="container">
 <div class="header">
 <h1> Training App</h1>
 <p>Witaj ${firstName || "w naszej społeczności"}!</p>
 </div>
 <div class="content">
 <h2>Twoje konto jest aktywne! </h2>
 <p>Cieszymy się, że do nas dołączyłeś! Teraz możesz w pełni korzystać z naszej aplikacji.</p>
 
 <h3>Co możesz zrobić?</h3>
 <div class="feature">
 <strong> Połącz ze Stravą</strong><br>
 Zsynchronizuj swoje treningi i zyskaj dostęp do zaawansowanych analiz.
 </div>
 <div class="feature">
 <strong> Analizuj postępy</strong><br>
 Zobacz swoje krzywe mocy, tempo, mapy ciepła i wykresy kondycji.
 </div>
 <div class="feature">
 <strong> Osiągnięcia</strong><br>
 Zdobywaj odznaki za swoje treningi i wytrwałość.
 </div>
 <div class="feature">
 <strong> Plany treningowe</strong><br>
 Twórz i śledź swoje cele treningowe.
 </div>
 
 <div style="text-align: center;">
 <a href="${process.env.CLIENT_URL}/dashboard" class="button">Przejdź do panelu</a>
 </div>
 </div>
 <div class="footer">
 <p>&copy; 2024 Training App. Wszystkie prawa zastrzeżone.</p>
 </div>
 </div>
 </body>
 </html>
 `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
  }
}

export const emailService = new EmailService();
