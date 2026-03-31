const mongoose = require('mongoose');
const User = require('./schemas/users');

mongoose.connect('mongodb+srv://anhkhoanguyenhoang14042004_db_user:brOkxMOKBRcQEQK0@cluster0.hm8luix.mongodb.net/NNPTUD-C3?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
    const users = await User.find({ username: { $in: ['testuser1', 'testuser2'] } });
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
