

// import { createTransport } from "nodemailer";
// const sendMail = async (to, subject, html) => {
//     console.log("Starting sendMail function..."); 
//     console.log(to);

// try {
    
//     const transport = createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.USER_ID,
//             pass: process.env.USER_PASS,
//         },
//         debug:true,
//         logger:true,
//         connectionTimeout:30000,
//     });

//     console.log("Transporter created"); // Debug

//     const mailOptions = {
//         from:`"GROUP MUSIC" <${process.env.USER_ID}>`,
//         to,
//         subject,
//         html,
//     };
//     console.log("Sending email to:", to); // Debug

//     const info =await transport.sendMail(mailOptions);

//     console.log("Email sent successfully!");
//     console.log('email sent :',info);
//     return info
// } catch (error) {
//     console.error('error sending message :',error);
//     throw error
// }};

// export default sendMail;

import sgMail from "@sendgrid/mail"


const sendMail = async ( to, subject, html)=>{
    
    try {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error("SENDGRID_API_KEY is missing");
        }
        
        if (!process.env.SENDER_ID) {
            throw new Error("SENDER_ID is missing");
        }
        
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg={
            to,
          from:` GROUP MUSIC <${process.env.SENDER_ID}>`,
         subject,
          html,
        }

        return await sgMail.send(msg);

    } catch (error) {
        console.error("Error sending email:", error.response?.body || error);
        throw error;
    }
}

export default sendMail