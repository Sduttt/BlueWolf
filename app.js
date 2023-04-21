const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml');

//Routes:
const home = require('./route/home');
const user = require('./route/user');
const product = require('./route/productRoute');
const payment = require('./route/payment');
const order = require('./route/orderRoute');


//middlewares:
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

//View engine:
app.set('view engine', 'ejs');

app.get('/signup', (req, res) => {
    res.render('signup');
});

//Router middlewares:
app.use("/api/v1", home);
app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/payment", payment);
app.use("/api/v1/order", order);

module.exports = app;