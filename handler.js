"use strict";
const nodemailer = require("nodemailer");
const querystring = require("querystring");
const libphonenumber = require("libphonenumber-js");

require("dotenv").config();

module.exports.hello = async (event) => {
  //Set it so it return something everytime
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      input: "Default Return String",
    }),
  };
  try {
    console.log("Function Called", event);
    if (event.body) {
      console.log("Fields Present", event.body);

      const body = event.body.split("&");
      const incomingString = querystring.parse(event.body);
      let contactString = "";

      const Name = incomingString.Name;
      console.log("Name", Name);

      const Email = incomingString.Email;
      console.log("Email", Email);

      const phoneNumber =
        incomingString.Cell &&
        libphonenumber.parsePhoneNumberFromString(incomingString.Cell, "US");
      console.log("phoneNumber", phoneNumber);
      const cellNumber = (phoneNumber && phoneNumber.number) || null;
      console.log("cellNumber", cellNumber);

      const phone_manufacturer = incomingString.Phone;
      const phones = require("./models/phones.json");
      const phoneOS = phones["Phone"][phone_manufacturer];
      console.log("Phones", phoneOS);

      const radioButton = body[4].split("=")[1];
      console.log("radioButton", radioButton);
      if (radioButton == "CellNumTrue" && cellNumber != null) {
        contactString = cellNumber;
        console.log("Cell Preferred and Present");

        const accountSid = process.env.SENDER_TEXT_SID;
        const authToken = process.env.SENDER_TEXT_AUTHTOKEN;
        const senderNumber = process.env.SENDER_TEXT_NUMBER;
        const client = require("twilio")(accountSid, authToken);
        const x = await client.messages
          .create({
            body: "This is body Section for Text Messages!",
            from: senderNumber,
            to: cellNumber,
          })
          .then((message) => console.log("sid", message.sid));
        console.log("Request Send");
      } else {
        contactString = Email;
        console.log("Email Preferred");
        const senderEmail = process.env.SENDER_EMAIL_EMAIL;
        const senderPass = process.env.SENDER_EMAIL_PASS;
        const serviceEmail = process.env.SENDER_EMAIL_SERVICE;
        let transporter = await nodemailer.createTransport({
          service: serviceEmail,
          auth: {
            user: senderEmail,
            pass: senderPass,
          },
        });
        let mailOptions = {
          from: senderEmail,
          to: Email,
          subject: "This is Subject Section for e-mail",
          text: "This is Body Section in the e-mail",
        };
        var mailResponse = await new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("Mail Promise reject");
              return reject(error);
            } else {
              console.log("Mail Promise Resolve");
              resolve("Email sent");
            }
          });
        });
      }

      const formName = incomingString.form_name;
      const formsURL = require("./models/formsURL.json");
      let formURL = "";

      try {
        formURL = formsURL[formName].formLink;
        console.log("Form Name", formName);
        console.log("Form URL", formURL);
      } catch (err) {
        formURL = "Form and it's URL not found";
        console.log("Form Name", formName);
        console.log("Form URL", formURL);
      }

      const MongoClient = require("mongodb").MongoClient;
      const mongodb_url = process.env.MONGODB_URL;
      const mongodb_database = process.env.MONGODB_DB_NAME;
      const mongodb_collection = process.env.MONGODB_COL_NAME;

      async function insertOne() {
        const client = await MongoClient.connect(mongodb_url, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }).catch((err) => {
          console.log(err);
        });
        try {
          const db = client.db(mongodb_database);
          let collection = db.collection(mongodb_collection);
          let query = {
            Name: Name,
            Email: Email,
            cellNumber: cellNumber,
            phoneOS: phoneOS,
            radioButton: radioButton,
            formName: formName,
            formURL: formURL,
            original_string: event.body,
          };
          let res = await collection.insertOne(query);
          console.log("Item saved in DB", res);
        } catch (err) {
          console.log(err);
        } finally {
          client.close();
        }
      }
      await insertOne();
    }

    return response;
  } catch (error) {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        input: "Server Error",
      }),
    };
    console.log("Error", error);
    console.log("resp", response);
    return response;
  }
};
