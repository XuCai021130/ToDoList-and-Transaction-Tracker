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
        const sortBy = req.query.sortBy
        let items = []
        if(sortBy=='amount'){
            items =
                await TransactionItem.find({ userId: req.user._id }).sort({ amount: -1 })
        } else if(sortBy=='category'){
            items =
                await TransactionItem.find({ userId: req.user._id }).sort({ category: 1 })
        } else if(sortBy=="description"){
            items =
                await TransactionItem.find({ userId: req.user._id }).sort({ description: 1 })
        } else if(sortBy=="date"){
            items =
                await TransactionItem.find({ userId: req.user._id }).sort({ date: -1 })
        } else {
            items =
                await TransactionItem.find({ userId: req.user._id })
        }

        res.render('transaction', { items });
    }
)

//* add the value in the body to the list associated to the key *
router.post('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
     const new_date = new Date(req.body.year, req.body.month-1, req.body.day);
      const transaction= new TransactionItem(
        {description : req.body.description,
         amount : parseInt(req.body.amount) ,
         category : req.body.category,
         date : new_date,
         userId: req.user._id,
         username: req.user.username
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


router.get('/transaction/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      const item = await TransactionItem.findById({_id:req.params.itemId});
      res.locals.item = item
      res.render('edit')
});


router.post('/transaction/updateItem',
    isLoggedIn,
    async (req, res, next) => {
        const { itemId, description, amount, category} = req.body;
        const date = new Date(req.body.year, req.body.month-1, req.body.day);
        await TransactionItem.findOneAndUpdate(
            { _id: itemId },
            { $set: { description, amount, category, date } });
        res.redirect('/transaction')
    }
);


router.get('/transaction/groupByCategory',
    isLoggedIn,
    async (req, res, next) => {
        let results =
            await TransactionItem.aggregate(
                [
                    {
                        $match: { username: req.user.username }
                    },
                    {
                        $group: {
                            _id: '$category',
                            total: { $sum: '$amount' },
                        }
                    },
                    {
                        $sort: { total: -1 }
                    }
                ]
            )
        res.render('summarize', { results })
    }
)

module.exports = router;
