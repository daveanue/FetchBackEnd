var router = require('express').Router();
const {body, validationResult} = require('express-validator');


let totalPoint = 0;
let Alltransaction = [];
let payerAndPoints = {};

router.post('/addTransaction', [
   // validate payer exist and is a string
  body('payer').isString().toUpperCase(),
  // validate points exist and is an integer
  body('points').isInt().toInt(),
  // validate timestamp exist and is an string
  body('timestamp').isISO8601(),
],
(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  let {payer, points, timestamp} = req.body;
  let newTransaction = {payer, points, timestamp};

  // should consider only being able to add points that are non-zero
  if (points == 0) {
    return res.status(422).json({ error: 'can only add points that are positive or negative'});
  };

  // need to make sure each transaction added would not make a payer's point go negative
  // 1. can't start a payer with a transaction that is negative  2. can't have a transaction make payer go negative
  if ((!payerAndPoints[payer] && points < 0) || (payerAndPoints[payer] + points < 0)) {
    return res.status(422).json({ error: `Payer: ${payer} has insufficient balance of ${!payerAndPoints[payer] ? 0 : payerAndPoints[payer]}, unable to make current transaction`})
  }

  if (!payerAndPoints[payer]) {
    payerAndPoints[payer] = points;
  } else {
    payerAndPoints[payer] += points;
  };
  // track totalPoints
  totalPoint += points;
  Alltransaction.push(newTransaction);
  // res.status(201).send('transaction has been successfully added')
  res.status(201).json(Alltransaction);


});


router.post('/spendPoints', [
  body('points').isInt().toInt()
],
(req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  let pointsToSpend = req.body.points;

  // check if pointToSpend is greater than totalPoint user have
  if (pointsToSpend > totalPoint) {
    return res.status(422).json({ error: `Unable to spend ${pointsToSpend} points due to insufficient amount`})
  }

  // sort all transaction date time by iso8601 from oldest to newest
  Alltransaction.sort((a, b) =>
    new Date(a.timestamp) - new Date(b.timestamp)
  )

  let OneIndexLessToPay;
  let currSum = 0;
  let indexToRemove = [];
  for (let i = 0; i < Alltransaction.length; i++) {
    let currentPayerPoint = Alltransaction[i].points;
    if (currSum += currentPayerPoint > pointsToSpend) {
      OneIndexLessToPay = i - 1;
      break;
    }
  }

  // go through the transaction lists and alter balance: so negative pts can be negated if possible, and positive pts can be reduced
  for (let i = 0; i < OneIndexLessToPay; i++) {
    let currTransacPayer = Alltransaction[i].payer;
    let currTransacPoints = Alltransaction[i].points;
    let nextIndex = i + 1;
       while (nextIndex <= OneIndexLessToPay) {
        let nextTransacPayer = Alltransaction[nextIndex].payer;
        let nextTransacPoints = Alltransaction[nextIndex].points;
         if (currTransacPayer === nextTransacPayer) {
           if (currTransacPoints > 0 && nextTransacPoints < 0) {
              if (currTransacPoints + nextTransacPoints > 0) {
                Alltransaction[i].points += nextTransacPoints
                Alltransaction[nextIndex].points = 0
                indexToRemove.push(nextIndex);
              }
           } else if (currTransacPoints < 0 && nextTransacPoints > 0) {
              if (currTransacPoints + nextTransacPoints > 0) {
                Alltransaction[nextIndex].points += currTransacPoints
                indexToRemove.push(i);
              }
           }
         }
         nextIndex+=1;
       }
  }
//   // 1. if deduction from the negative points results in a positive points, and negative points become 0
//   // 2. track the index, if the negative points can be negated to 0, to remove later on

 // remove transaction that are used up by negative points
 for (let i = indexToRemove.length - 1; i >= 0; i--) {
   Alltransaction.splice(indexToRemove[i], 1);
 }


 let spendList = [];
 let removeZeroPoint = [];
 let i = 0;

  while (pointsToSpend > 0 && i < Alltransaction.length - 1) {
    let transactionPoints = Alltransaction[i].points;
    let transactionPayer = Alltransaction[i].payer;
  if (transactionPoints === pointsToSpend) {
     spendList.push({"payer" :transactionPayer, "points": -Math.abs(transactionPoints)})
     pointsToSpend = 0;
     Alltransaction[i].points = 0;
     removeZeroPoint.push(i);
     i+=1;
  } else if (transactionPoints > pointsToSpend ) {
     spendList.push({"payer" :transactionPayer, "points": -Math.abs(pointsToSpend)})
     Alltransaction[i].points -= pointsToSpend;
     pointsToSpend = 0;
     i+=1;

  } else {
    // transactionPoints is less than pointsToSpend: then we only spend the amount of transactionPayer have
    spendList.push({"payer" :transactionPayer, "points": -Math.abs(transactionPoints)})
    pointsToSpend -= transactionPoints;
    transactionPoints = 0;
    removeZeroPoint.push(i);
    i+=1;
  }
}



// clean up Alltransaction array that has zeroPoints, after spending
 for (let i = removeZeroPoint.length - 1; i >= 0; i--) {
   Alltransaction.splice(removeZeroPoint[i], 1);
 }

 console.log('transaction', Alltransaction);
 res.status(200).send(spendList);

})


router.get('/getBalances', (req, res, next) => {
  // should we handle accumulating each payer's point logic here?
  // OR should we already have a map to store and accumulate points for each payer in /addTransaction route

  let getBalances = {};

  for (let transaction of Alltransaction) {
    if (transaction.payer in getBalances) {
      getBalances[transaction.payer] += transaction.points;
    } else {
      getBalances[transaction.payer] = transaction.points;
    }
  }

  res.status(200).json(getBalances);
})



module.exports = router;