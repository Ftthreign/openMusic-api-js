const nodemailer = require("nodemailer");
const { ClientError } = require("../../openmusic-api/src/utils/index");

const MailSender = {
  sendEmail: async (targetEmail, content) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: "OpenMusic Admin Apps",
        to: targetEmail,
        subject: `Expor Playlist dari OpenMusic <${process.env.SMTP_USER}>`,
        text: "Terlampir hasil dari ekspor lagu",
        attachments: [
          {
            filename: "playlists.json",
            content,
            contentType: "application/json",
          },
        ],
      });
      console.log("Email sent : ", info.messageId);
    } catch (e) {
      console.error("Failed to send email", e);
      throw e;
    }
  },
};

module.exports = MailSender;
