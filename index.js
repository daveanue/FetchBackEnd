var app = require('./server');

var PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`currently listening on port ${PORT}`);
})