const mongoose = require('mongoose');
const User = require('./schemas/users');
const Cart = require('./schemas/carts');

mongoose.connect('mongodb+srv://anhkhoanguyenhoang14042004_db_user:brOkxMOKBRcQEQK0@cluster0.hm8luix.mongodb.net/NNPTUD-C3?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let newUser = new User({
            username: 'testuser2',
            password: 'Abc@1234',
            email: 'testuser2@gmail.com',
            role: '69b6231b3de61addb401ea26'
        });
        await newUser.save({ session });
        let newCart = new Cart({ user: newUser._id });
        await newCart.save({ session });
        await session.commitTransaction();
        await session.endSession();
        console.log("Created testuser2 with ID: " + newUser._id);
        process.exit(0);
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        console.error(err.message);
        process.exit(1);
    }
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
