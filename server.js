require('dotenv').config();
require('./config/database')
require('./model/user')
const express = require('express');
const swaggerUi = require('swagger-ui-express')
const swagger = require('./swagger')
const PORT = process.env.PORT || 7070;
const express_session = require('express-session')
const {passport} = require('./middleware/passport')
const cors = require('cors')


const router = require('./routes/userRouter')
const groupRouter = require('./routes/groupRouter')
const paymentRouter = require('./routes/paymentRouter')

const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	limit: 2, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests, please try again after 5 minutes',
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	// store: ... , // Redis, Memcached, etc. See below.
})


const app = express();
app.use(express.json());
app.use(cors())
app.use('/api/v1/login', limiter)
app.use('/api/v1/reset-password', limiter)


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
