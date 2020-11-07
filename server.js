const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;


const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("./public"));



mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/budgetTracker',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// routes
app.use(require("./routes/api"));

if ('serviceWorker' in navigator) {
  // we are checking here to see if the browser supports the service worker api
   window.addEventListener('load', function() {
     navigator.serviceWorker.register('./public/service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('Service Worker registration was successful with scope: ', registration.scope);
       }, function(err) {
         // registration failed :(
         console.log('ServiceWorker registration failed: ',
         err);
       });
    });     
}


app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
  
