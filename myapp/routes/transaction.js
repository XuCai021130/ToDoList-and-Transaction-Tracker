/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const TransactionItem = require('../models/TransactionItem')
const User = require('../models/User')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
    res.locals.items = await TransactionItem.find({userId:req.user._id})
    res.render('transaction');
});


//* add the value in the body to the list associated to the key *
router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
     const new_date = new Date(req.body.year, req.body.month-1, req.body.day);
      const transaction= new TransactionItem(
        {description : req.body.description,
         amount : parseInt(req.body.amount) ,
         category : req.body.category,
         date : new_date,
         userId: req.user._id
        })
      await transaction.save();
      res.redirect('/transaction')
});  


router.get('/transaction/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/remove/:itemId")
      await TransactionItem.deleteOne({_id:req.params.itemId});
      res.redirect('/transaction')
});

router.get('/transaction/complete/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo/complete/:itemId")
      await TransactionItem.findOneAndUpdate(
        {_id:req.params.itemId},
        {$set: {completed:true}} );
      res.redirect('/toDo')
});

router.get('/todo/uncomplete/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /todo/complete/:itemId")
      await TransactionItem.findOneAndUpdate(
        {_id:req.params.itemId},
        {$set: {completed:false}} );
      res.redirect('/toDo')
});

router.get('/transaction/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /trsnsaction/edit/:itemId")
      const item = await TransactionItem.findById({_id:req.params.itemId});
      res.locals.item = item
      res.render('edit')
});



module.exports = router;
