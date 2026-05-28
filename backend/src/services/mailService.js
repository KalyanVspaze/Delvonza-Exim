const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async (email, otp) => {

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'OTP Verification',
    html: `
      <div style="font-family:sans-serif">
        <h2>Your OTP Code</h2>

        <h1 style="letter-spacing:5px;">
          ${otp}
        </h1>

        <p>
          Valid for 10 minutes.
        </p>
      </div>
    `
  };

  await sgMail.send(msg);
};

module.exports = {
  sendOtpEmail
};