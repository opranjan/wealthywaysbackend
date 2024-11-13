const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define the transporter for sending the email using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // For TLS, set to true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST route to receive form data and send email
app.post("/send-email", (req, res) => {
  const { firstname, lastname, mobile, email, trading, segment, investment } =
    req.body;

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: [ process.env.SMTP_USER],
    // process.env.RECIPIENT_EMAIL,
    subject: "Form Submission Details",
    text: `Form Details:
    - First Name: ${firstname}
    - Last Name: ${lastname}
    - Mobile: ${mobile}
    - Email: ${email}
    - Currently Trading?: ${trading}
    - Segment: ${segment}
    - Investment: ${investment}
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email", error });
    } else {
      return res.status(200).json({ message: "Email sent successfully", info });
    }
  });
});



// POST route to receive form data and send email
app.post("/enquiry-now", (req, res) => {
  const { name, email, phone,  subject, message } =
    req.body;

  // Email content
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: [ process.env.SMTP_USER],
    // process.env.RECIPIENT_EMAIL,
    subject: "Form Submission Details",
    text: `Form Details:
    - Name: ${name}
    - Email: ${email}
    - Mobile: ${phone}
    - Subject: ${subject}
    - Message: ${message}
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: "Error sending email", error });
    } else {
      return res.status(200).json({ message: "Email sent successfully", info });
    }
  });
});

// POST route to receive user consent form data with images uploaded as files
app.post(
  "/user-consent",
  upload.fields([
    { name: "panCardImage", maxCount: 1 },
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("Received request body:", req.body); // Log the incoming request body
    const { fullname, email, phone, agentAddress } = req.body;

    // Access the uploaded files
    const panCardImage = req.files["panCardImage"]
      ? req.files["panCardImage"][0]
      : null;
    const aadharFront = req.files["aadharFront"]
      ? req.files["aadharFront"][0]
      : null;
    const aadharBack = req.files["aadharBack"]
      ? req.files["aadharBack"][0]
      : null;

    // Define attachments for the email
    const attachments = [];

    if (panCardImage) {
      attachments.push({
        filename: panCardImage.originalname,
        content: panCardImage.buffer, // File buffer
        contentType: panCardImage.mimetype, // File mime type
      });
    }

    if (aadharFront) {
      attachments.push({
        filename: aadharFront.originalname,
        content: aadharFront.buffer,
        contentType: aadharFront.mimetype,
      });
    }

    if (aadharBack) {
      attachments.push({
        filename: aadharBack.originalname,
        content: aadharBack.buffer,
        contentType: aadharBack.mimetype,
      });
    }

    // Email content for user consent
    const userMailOptions = {
      from: process.env.SMTP_USER,
      to: [email], // Send the email to the user who submitted the form
      subject: "User Consent Confirmation",
      html: `
      <h1>Dear ${fullname}</h1>
      <p>Please read the below User Consent along with all the Terms and Conditions and policies of our firm carefully provided below. Once you have read the User Consent along with all the Terms and Conditions and policies of our firm carefully <span>provided below please click on the ‘I Agree’ button at the bottom of this email to confirm your acceptance and agreement </span>to the User Consent along with all the Terms and Conditions and policies of our firm carefully provided below.</p>

      <h2>User Consent Details :-</h2>
      <p>Full Name: ${fullname}</p>
      <p>Email: ${email}</p>
      <p>Phone: ${phone}</p>
      <p>Agent Address: ${agentAddress}</p>
      <p>Please review the attached documents below:</p>

  <div id="agreementDetails" >
        <p   >
    By visiting/using/accessing our website (http://wealthyways.in/) and making payment for a subscription to any of our research services, you are agreeing to be bound by the following terms and conditions, and all other terms and conditions, legal disclaimers, disclosures, policies, and user consents of the wealthyways firm mentioned on our official website (http://wealthyways.in/).

The term "wealthyways firm" (http://wealthyways.in/) is used throughout this entire document to refer to the website, its owners/proprietor, and the employees and associates of the owner. The words ‘You’ refer to the viewer/user/subscriber of the wealthyways firm website/research services.

You understand and accept that trading is a risky activity that involves the risk of loss of partial or complete capital, and that there is no guarantee of profits or returns after subscribing to any of wealthyways's research alerts services.

You understand and accept that the service provided by wealthyways is general trading technical analysis research and is not investment advice. The final decision to take or not to take any trade is completely yours. Additionally, the decision to trade the quantity of stocks/FNO lots based on our research reports/alerts will also be entirely yours. You accept full responsibility for any gains or losses that arise from your trading activities.

You understand and agree that wealthyways Research Analyst firm and/or its owner/proprietor/managers/employees/associates do not provide any assurance or guarantee of accuracy or consistency of any of our research alerts/services. Any accuracy level communicated to the user, either in written or verbal form or in our advertisements/website, is merely for indicative purposes only. You understand and agree that the accuracy level/percentage of any of our research services/alerts may vary from time to time, and there is no commitment from wealthyways Research Analyst firm and/or its owner/proprietor/managers/employees/associates to deliver research services/alerts with a fixed accuracy level/percentage.

You understand that for any/all trades taken by you, you will be held responsible for the outcome of the trade/investment, whether resulting in a gain or loss. You are willing to take complete responsibility for the outcome of all the trades placed in your Demat account/trading account (Broker Account) during your subscription period with wealthyways.

You understand that the service provided by wealthyways firm is only a research service and is meant solely for reference. You understand and accept that the service provided by wealthyways firm is not investment advice and that all decisions to trade/invest in any stock/instrument are solely yours. Any loss/gain that may arise from such trades/investments is your sole responsibility/liability.

You agree to all terms and conditions, disclosures, disclaimers, policies, and user consent of wealthyways firm. You acknowledge that you are aware of the risks associated with trading and investing in the stock market and still wish to subscribe to the research services of wealthyways. You have been fully informed about all aspects of the services provided by wealthyways firm, including the risks associated with trading and investing in the stock market. You confirm and agree that you have subscribed to the research services of wealthyways firm after fully understanding the risks involved in trading and investing. You confirm and accept that you do not expect a fixed return or guaranteed return from the research alerts service you subscribed to, and you fully understand that you can/might lose your partial or entire capital in trading & investing by referring to the research services/reports/alerts of wealthyways firm.

You have read and accepted all terms & conditions, legal disclaimers, refund policy, privacy policy, and user consent of wealthyways firm mentioned on our official website at http://wealthyways.in/. You have read, understood, and accepted the risks mentioned in the disclaimer on the website of wealthyways firm at http://wealthyways.in/.

You understand and accept that trading in the stock market is subject to market risk, and you may lose some or all of your capital in the stock market trading/investing activities. Therefore, wealthyways firm or its proprietor/owner cannot be held responsible for any losses in the stock market that you may incur, and managing trades is completely your responsibility. You confirm that you have not been asked for your Demat/Trading Account login ID & password by any of the employees/representatives of wealthyways firm or anyone associated with wealthyways firm, and your Demat/Trading Account login credentials are not disclosed or known to anyone except yourself.

You understand and accept that you have been sufficiently informed of the risks of trading/investing in the stock market, and you have still decided to subscribe to wealthyways's trading research alerts services. You declare that you will be trading/investing with your own personal capital and that you will not be trading/investing with capital that has been taken on a loan or capital belonging to someone other than yourself.

You declare that wealthyways firm and its proprietor/owner/employees/associates have not guaranteed or assured you any returns or profits by trading and investing in the stock market. You understand and accept that wealthyways firm and its proprietor/owner/employees/associates do not provide any order execution services for trading/investing purposes.

You understand and accept that the amount paid to wealthyways firm is a fee for providing you with a research alerts service, and this amount is not an investment in the stock market itself. The fee paid by you is non-refundable under any circumstances. You understand and accept that the fees paid by you are only for research services and that wealthyways firm and its proprietor/owner/employees/associates will not invest any amount on your behalf in the stock market. You have been clearly informed about this by the employees/representatives/associates of wealthyways firm. You agree and accept that you have understood and agreed to take the risks involved in trading/investing, and that any loss that might arise from any such trading activity done by you, whether or not based on wealthyways firm's research reports or guidance, means that you accept that you cannot and will not file any legal complaint or legal notice against wealthyways firm and its proprietor/owner/employees/associates.

You accept that you have read all the text in this document carefully and in detail, and you have understood and accepted all the mentioned terms and conditions as well as all the terms and conditions including all the disclaimers, disclosures, and policies mentioned on the official website of wealthyways firm (http://wealthyways.in/). You officially accept all the terms and conditions laid down by wealthyways firm in a digital confirmation/consent via this document. The confirmation/consent provided by you may act as final notification & confirmation and implies that you have understood and accepted all the risks involved in the trading/investing activity in the stock market.

We request you to acknowledge and confirm all the terms and conditions mentioned above in this document by clicking on the “Yes I Agree” button below. wealthyways firm will consider these details and your consent/acceptance of all the above terms and conditions to be final and will be taken on an as-is basis for all our services and products to which you may subscribe with us. Upon receipt or non-receipt of your confirmation to the terms and conditions of the above document, the above consent/confirmation will be considered true and will be used in all our active records.
  </p>

</div>

  
  <p>
   <a href="mailto:${process.env.SMTP_USER}?subject=User%20Consent%20Agreement&body=Dear%20wealthyways%20Team,%0D%0A%0D%0A%20I%20hereby%20acknowledge%20that%20I%20have%20carefully%20read%20and%20understood%20the%20User%20Consent,%20Terms%20%26%20Conditions,%20and%20Privacy%20Policy%20provided%20by%20wealthyways.%20By%20continuing%20to%20use%20your%20services%20and%20accessing%20your%20website,%20I%20confirm%20my%20acceptance%20and%20agreement%20to%20abide%20by%20these%20policies.%0D%0A%0D%0A%20I%20understand%20that%20it%20is%20my%20responsibility%20to%20comply%20with%20the%20terms%20outlined%20in%20these%20documents,%20and%20I%20agree%20to%20adhere%20to%20them%20in%20all%20interactions%20with%20wealthyways.%0D%0A%0D%0A%20Should%20I%20have%20any%20questions%20or%20require%20further%20clarification%20regarding%20these%20policies,%20I%20will%20not%20hesitate%20to%20reach%20out%20to%20your%20team%20for%20assistance.%0D%0A%0D%0A%20Thank%20you%20for%20your%20attention%20to%20this%20matter."
  style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
  Agree
</a>
  </p>
      <p>Thank you!</p>
    `,
      attachments, // Attach the uploaded files
    };

    // Email content for user consent
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: [process.env.SMTP_USER], // Send the email to the user who submitted the form
      subject: "User Consent Confirmation",
      html: `
      <h2>User Consent Details :-</h2>
      <p>Full Name: ${fullname}</p>
      <p>Email: ${email}</p>
      <p>Phone: ${phone}</p>
      <p>Agent Address: ${agentAddress}</p>
      <p>Please review the attached documents below:</p>
      <p>Thank you!</p>
    `,
      attachments, // Attach the uploaded files
    };

    console.log("Sending email with the following options:", adminMailOptions); // Log email options

    // Send email for user consent
    // Send the user email
    transporter.sendMail(userMailOptions, (userError, userInfo) => {
      if (userError) {
        console.error("Error sending user email:", userError);
        return res
          .status(500)
          .json({ message: "Error sending user email", error: userError });
      } else {
        console.log("User email sent successfully:", userInfo);

        // Send admin email after user's email is sent
        transporter.sendMail(adminMailOptions, (adminError, adminInfo) => {
          if (adminError) {
            console.error("Error sending admin email:", adminError);
            return res
              .status(500)
              .json({
                message: "Error sending admin email",
                error: adminError,
              });
          } else {
            console.log("Admin email sent successfully:", adminInfo);
            return res
              .status(200)
              .json({
                message: "Emails sent successfully to both user and admin.",
              });
          }
        });
      }
    });
  }
);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
