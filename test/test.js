const { expect } = require('chai');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const server  =  require('../index');

const API = 'http://localhost:3000';

chai.should();

chai.use(chaiHTTP);

describe('Points API',  () => {

  // POST transaction route
  describe("POST /addTransaction", () => {
    it("Should POST a new transaction", (done) => {
      const transaction = {"payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z"}
      chai.request(API)
          .post("/addTransaction")
          .send(transaction)
          .end((err, res) => {
            res.should.have.status(201);
            expect(res.body.transaction).to.deep.equal(transaction);
          done();
          });
    });


  // POST spend points route
  describe("POST /spendPoints", () => {
    it("Should spend points available", (done) => {
      const spend = {"points":  200}
      const response  = {"payer": "DANNON", "points": -200}
      chai.request(API)
        .post("/spendPoints")
        .send(spend)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          expect(res.body).to.deep.equal(response)
        done();
        });
    });
  });

  // POST spend points route
  describe("POST /spendPoints", () => {
    it("Should not spend unavailable  points", (done) => {
      const spend = {"points": 200}
      chai.request(API)
        .post("/spendPoints")
        .send(spend)
        .end((err, res) => {
          res.should.have.status(422);
        done();
        });
    });
  });

  // GET points route
  describe("GET /getBalances", () => {
    it("Should GET all the points", (done) => {
      const points = {"DANNON":  300};
      chai.request(API)
        .get("/getBalances")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body).to.deep.equal(points);
        done();
        });
    });
  });

  });
});