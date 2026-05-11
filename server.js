require('dotenv').config();
require('./config/database')
require('./model/user')
const express = require('express');
const swaggerUi = require('swagger-ui-express')
const swagger = require('./swagger')
const PORT = process.env.PORT || 7070;
const express_session = require('express-session')
const {passport} = require('./middleware/passport')

const router = require('./routes/userRouter')
const groupRouter = require('./routes/groupRouter')
const paymentRouter = require('./routes/paymentRouter')


const app = express();
app.use(express.json());


app.use(express_session({
    secret: 'Oshio-Ella',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/apisDocs', swaggerUi.serve, swaggerUi.setup(swagger));

app.use('/api/v1', router);
app.use('/api/v1/group', groupRouter);
app.use('/api/v1', paymentRouter);

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    })
})

app.use((err, req, res, next) => {
    res.status(500).json({
        message: err.message
    })
})

app.use((err, req, res, next) => {

    if (err.name === 'TokenExpireError') {
        return res.status(401).json({
            message:"Session expired: Please login to continue"
        })
    }

    if (err.name === 'MulterError') {
        return res.staus(400).json({
            message: err.message
        })
    }

    console.log(err.message)
    res.status(500).json({
        message: 'Something went wrong'
    })
})

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('Database is connected');
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
}).catch((error)=>{
    console.log('Unable to connect:', error.message);
    
})
