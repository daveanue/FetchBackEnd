# Fetch Rewards Coding Exercise - Backend Software Engineering
A back end REST API web service that accepts HTTP requests and returns responses based on conditions outlined in the section below. 

## Conditions
* There is a `user` that can have `points` in their account from various `payers`.
* Payers submit `transactions` to add or subtract points from a user.
  * Transactions are stored in memory on the back end.
  * A payer's total points can't go below 0.
* The user can `spend` points.
  * The user's total points can't go below 0.
  * When spending points, the oldest points are spent first based on their transaction's timestamp, regardless of payer.

## Dependencies/Tools
* [Node](https://nodejs.org/) - Open-source, cross-platform JavaScript runtime environment
* [Express](https://expressjs.com/) - Back end Node.js server framework for building web apps and APIs
* [Express-Validator](https://express-validator.github.io/docs/) - Express.js middleware library for server-side data validation
* [Mocha](https://mochajs.org/) - JavaScript testing framework that runs on Node.js and in the browser
* [Chai](https://www.chaijs.com/) - Test asseertion library for Node.js and the browser
* [Chai HTTP](https://www.npmjs.com/package/chai-http) - Chai plugin for testing RESTful APIs


## Getting Started
1) You must have [Node](https://nodejs.org/) version v10.0.0 or higher installed.  
  Verify Node version
    ```
    node --version
    ```
2) Clone repo locally
    ```
    git clone https://github.com/daveanue/FetchBackEnd.git
    ```
3) Install dependencies
    ```
    npm install
    ```
4) Start the server
    ```
    npm start
    ```
    Your terminal should read:
    ```
    currently listening on port 3000
    ```

## Making API calls
Because this server doesn't use any durable data store, there will be no data in the backend whenever the server is started, which means:
* The user will initially have no points
* There will be no payer transactions

We will be using **Postman** to make calls to the API.  
* Go to the [Postman](https://www.postman.com/) site.
* Create an account or log in.
* From your acount's home screen, create or use an existing `Workspace` by clicking on `Workspace` in the top left menu bar.
* Once you're in a workspace, click on `Create a request` on the right under `Getting started`.
* Your interface should look like the image below.
>![Postman 1](/images/postman-1.png)
* Let's start by adding some transactions

## POST Route "/addTransaction" - Add Payer Transaction
***REQUEST BODY FORMAT*** 
```
{"payer": <str>, "points": <int>, "timestamp": <ISO8601>}
```
* Click the dropdown that says `GET` and select `POST`.
* Enter the server port with the `/points` endpoint.
>![Postman 2](/images/postman-2.png)
* Under the URL, select `Body`, check the `raw` radio button, and select `JSON` from the dropdown.
>![Postman 3](/images/postman-3.png)




When a `payer` adds a negative amount of `points` and the payer has enough points to cover the negative amount, the negative points will be deducted to 0 and removed; and the positive point will be reduced.

## POST route "/spendPoints" - Spend User Points
***REQUEST BODY FORMAT***
```
{"points": <str>}
```
* Make sure the request type is set to `POST`.
* Enter the server port with the `/points/spend` endpoint.
* Under the URL, select `Body` and  check the `raw` radio button and select `JSON` from the dropdown.
* Enter a valid request body in the section below.
* Click  `Send` and if the user has enough points, you'll receive a `Status: 200 OK` response in the body section below along with a list showing how many points were spend from each `payer`.
>![Postman 4](/images/postman-4.png)
* The response above is the result of sending sending `{"points": 5000}` to `"/points/spend'` after the following transactions have been added by payers:
  ```
  {"payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z"}
  {"payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z"}
  {"payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z"}
  {"payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z"}
  {"payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z"}
  ```

## GET route "/points" - Get Points Available Per Payer
* This route gives the user their remaining available `points` per `payer`.
>![Postman 5](/images/postman-5.png)

## Running Tests
Run tests in [test.js](test/test.js) from the project's main directory:
```
npm test
```
Tests check that the app should:
* `POST` a new transaction
* NOT `POST` a new transaction with incorrect request body
* `GET` all points by payer
* `POST` spend points available
* NOT `POST` spend an unavailable amount of points
* NOT `POST` transaction with negative points if it would make the payer's points go negative
* `POST` transactions with negative points if payer has enough points to cover the negative amount
