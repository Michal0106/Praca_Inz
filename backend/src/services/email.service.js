import nodemailer from "nodemailer";

let transporter = null;

if (process.env.SMTP_HOST) {
  console.log("[Email] Configuring SMTP transporter with host:", process.env.SMTP_HOST);

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

} else {
  console.log("[Email] SMTP_HOST not set – using mock logger instead of real SMTP.");
}




export const sendPasswordResetEmail = async (to, resetUrl) => {
  const from = process.env.EMAIL_FROM || "Training App <no-reply@example.com>";

  if (!transporter) {
    console.log("[Email mock] Password reset link for %s: %s", to, resetUrl);
    return;
  }

  const mailOptions = {
    from,
    to,
    subject: "Reset hasła – Training App",
    text: `Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.

Kliknij w poniższy link, aby ustawić nowe hasło (link jest ważny przez 1 godzinę):

${resetUrl}

Jeśli to nie Ty inicjowałeś tę operację, zignoruj tę wiadomość.`,
    html: `
      <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
      <p>Kliknij w poniższy przycisk lub link, aby ustawić nowe hasło
      (link jest ważny przez 1 godzinę):</p>
      <p>
        <a href="${resetUrl}" 
           style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;
                  text-decoration:none;border-radius:6px;font-weight:600;">
          Ustaw nowe hasło
        </a>
      </p>
      <p>Jeśli przycisk nie działa, skopiuj ten link do przeglądarki:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <hr />
      <p>Jeśli to nie Ty inicjowałeś tę operację, zignoruj tę wiadomość.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("[Email] Password reset mail sent to %s, messageId=%s", to, info.messageId);
  } catch (err) {
    console.error("[Email] Error sending password reset mail to %s:", to, err);
  }
};
