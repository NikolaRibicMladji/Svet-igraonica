const dotenv = require("dotenv");
const path = require("path");
const nodemailer = require("nodemailer");

// Load env
dotenv.config({ path: path.join(__dirname, "../../.env") });

const testEmail = async () => {
  try {
    console.log("📧 Testiranje email konfiguracije...\n");

    const { EMAIL_USER, EMAIL_PASS } = process.env;

    console.log("Email user:", EMAIL_USER || "❌ NEDOSTAJE");
    console.log("Email pass:", EMAIL_PASS ? "✔ postoji" : "❌ NEDOSTAJE");

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("\n❌ Email podaci nedostaju u .env fajlu!");
      console.log("Dodaj:");
      console.log("EMAIL_USER=your_email@gmail.com");
      console.log("EMAIL_PASS=your_app_password\n");
      process.exit(1);
    }

    // Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Verify konekcije
    await transporter.verify();
    console.log("✅ Email konekcija uspešna!\n");

    // Send mail
    const info = await transporter.sendMail({
      from: `"Svet Igraonica" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "✅ Test email - Svet Igraonica",
      html: `
        <div style="font-family: Arial; max-width: 600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px;">
          <h2 style="color:#ff6b4a;">🎉 Email radi!</h2>
          <p>Ovo je test email sa tvoje platforme <strong>Svet Igraonica</strong>.</p>
          <p>Sve je spremno za slanje notifikacija korisnicima.</p>
          <hr>
          <p style="font-size:12px;color:#666;">
            ${new Date().toLocaleString("sr-RS")}
          </p>
        </div>
      `,
    });

    console.log("📨 Email uspešno poslat!");
    console.log("ID:", info.messageId);
    console.log("Na:", EMAIL_USER);
  } catch (error) {
    console.error("\n❌ GREŠKA:");
    console.error(error.message);
    process.exit(1);
  } finally {
    console.log("\n🏁 Završeno.");
    process.exit(0);
  }
};

testEmail();
