# Form Handler though AWS Lambda, Node.js from Webhook URL
AWS Lambda for WordPress form which sends Text and/or Email when form is submitted and saves the Data in MongoDB which looks like
![chrome_Is2yfXn54t](https://user-images.githubusercontent.com/7530693/84812809-98649680-b02c-11ea-9f13-f0dc0da498e2.png)



***Basic Dependencies/packages required like Node.js***



Intructions to deploy it via serverless:

```
serverless create --template aws-nodejs --path "(PATH to create serverless template)"

git clone https://github.com/Shubham8037/wp-forms-lambda-handler.git
```

Copy files into the serverless template folder you just created.
In this case provider is AWS and you need to generate your key and secret from AWS

```
serverless config credentials --provider provider --key key --secret secret

npm install

serverless deploy -v
```

Use the API endpoint from terminal as a webhook URL in the form

To use your email you have to enable something called [less secure apps](https://myaccount.google.com/lesssecureapps)

In AWS Lambda, make Environment variables as following (or you can use [dotenv](https://www.npmjs.com/package/dotenv) like I am):
![chrome_2XftIagdPS](https://user-images.githubusercontent.com/7530693/84813722-ff367f80-b02d-11ea-9001-7650d9536618.png)

Fill out the Form and you should receive Text and/or Email!
