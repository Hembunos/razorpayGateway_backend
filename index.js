const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto')
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
require("dotenv").config();


const app = express();
const PORT = process.env.PORT || '8000';


app.use(cors());
app.use(bodyParser.json());


app.post('/createOrder', (req, res) => {

  const razorpayInstance = new Razorpay({

    key_id: process.env.RAZORPAY_ID,

    key_secret: process.env.RAZORPAY_SECRET 
  });


  const options = {
    amount: Number(req.body.money * 100),
    currency: "INR",
  }
  razorpayInstance.orders.create(options,
    (err, order) => {

      if (!err)
        res.json(order)
      else
        res.send(err);
    }
  )
});


app.post('/verifyOrder', (req, res) => {


  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.response;

  const key_secret = 'dHdAdECvx1VLYXHadmulfAtJ';
  let hmac = crypto.createHmac('sha256', key_secret);

  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');


  if (razorpay_signature === generated_signature) {

    res.json({ success: true, message: "Payment has been verified" })
  }
  else
    res.json({ success: false, message: "Payment verification failed" })
});


app.post('/sendMail', (req, res) => {


  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'unityyfoundation@gmail.com',
      pass: 'xdjq qmts zjga ygrc'
    }
  });

  const mailOptions = {
    from: 'unityyfoundation@gmail.com',
    to: req.body.formData.email,
    subject: 'Thank You for Your Generous Donation!',
    text: `Dear ${req.body.formData.name},\n\n` +
      `Thank you so much for your generous donation of ₹${req.body.formData.money} to Unity Foundation. ` +
      'Your support is instrumental in helping us achieve our mission. ' +
      'We truly appreciate your commitment to making a positive impact in the community.\n\n' +
      'Best regards,\n' +
      'Unity Foundation Team'
  };


  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.send(transporter.id)
      console.log('Email sent: ' + info.response);
    }
  });
});

app.listen(PORT, () => {
  console.log("Server is Listening on Port ", PORT);
}); 
