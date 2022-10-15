const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Oauth2Schema = Schema({

    email: {
        type: String,
        ref: 'User'
    },
    provider: {
        type: String
    },
    subject: {
        type: String
    }

}, { timestamps: true });



const Oauth2 = mongoose.model('Oauth2', Oauth2Schema);
module.exports = { Oauth2 };
