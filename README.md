# BlueWolf API

This is the API for a T-shirt store called BlueWolf. The API is built with Node.js, Express, and MongoDB. It provides endpoints for user authentication, product management, order management, and payment processing.

## Installation

1. Clone the repository.
2. Install the dependencies using the `npm install` command.
3. Create a `.env` file with the following environment variables:

   ```
   PORT=<port_number>
   DB_URL=<database_uri>
   JWT_SECRET=<jwt_secret_key>
   JWT_EXPIRE=<jwt_token_expiry_time>
   CLOUD_NAME=<cloudinary_cloud_name>
   CLOUD_API_KEY=<cloudinary_api_key>
   CLOUD_API_SECRET=<cloudinary_api_secret>
   CLOUD_ENV_VAR=<stripe_secret_key>
   SMTP_HOST=<mailtrap_smtp_host>
   SMTP_PORT=<mailtrap_smtp_port>
   SMTP_USER=<mailtrap_smtp_user>
   SMTP_PASS=<mailtrap_smtp_password>
   STRIPE_KEY=<stripe_key_id>
   STRIPE_SECRET=<stripe_key_secret>
   ```
   Replace the `<...>` with the appropriate values.

4. Start the server using the `npm start` or `npm run dev` command.

## Usage

The API provides the following endpoints:

### Authentication

- [POST] `/api/v1/user/signup` - Register a new user.
- [POST] `/api/v1/user/login` - Log in an existing user.
- [GET] `/api/v1/user/logout` - Log out the current user.
- [POST] `/api/v1/user/forgotpassword` - Send an email to reset the user's password.
- [POST] `/api/v1/user/resetpassword/:resetToken` - Reset the user's password.

### Users

- [GET] `/api/v1/user/profile` - Get the profile of the current user.
- [PUT] `/api/v1/user/updatepassword` - Update the password of the current user.
- [PUT] `/api/v1/user/profile/update` - Update the profile of the current user.
- [GET] `/api/v1/user/list` - Get a list of all users (admin only).
- [GET] `/api/v1/user/:id` - Get the profile of a user by ID (admin only).
- [PUT] `/api/v1/user/:id/update` - Update the profile of a user by ID (admin only).
- [PUT] `/api/v1/user/delete/:id` - Delete the profile of a user by ID (admin only).
- [GET] `/api/v1/user/normalusers` - Get a list of all normal users (manager only).

### Products

- [GET] `/api/v1/product/` - Get a list of all products.
- [GET] `/api/v1/product/:id` - Get the details of a product by ID.
- [PUT] `/api/v1/product/reviews` - Get the reviews of a product by ID.
- [PUT] `/api/v1/product/review` - Add a review to a product (authenticated user only).
- [DELETE] `/api/v1/product/review` - Delete a review from a product (authenticated user only).
- [POST]`/api/v1/product/add` - Create a new product (admin only).
- [GET] `/api/v1/product/foradmin` - Get a list of all products for admin (admin only).
- [GET] `/api/v1/product/:id` - Get the details of a product by ID (admin only).
- [PUT] `/api/v1/product/update/:id` - Update the details of a product by ID (admin only).
- [PUT] `/api/v1/product/delete/:id` - Delete a product by ID (admin only).

### Orders

- [GET] `/api/v1/order/admin/all` - Get a list of all orders(admin only).
- [PUT] `/api/v1/order/admin/:id` - Get the details of an order by ID (admin only).
- [DELETE] `/api/v1/order/admin/:id` - Delete an order by ID (admin only).
- [POST] `/api/v1/order/new` - Create a new order (authenticated user only).
- [GET] `/api/v1/order/myorders` - Get a list of all orders of the current user (authenticated user only).
- [GET] `/api/v1/order/:id` - Get the details of an order by ID (authenticated user only).

### Payments

- [GET] `/api/v1/payment/send-stripe-key` - Process a payment (authenticated user only).
- [POST] `/api/v1/payment/stripe` - Make a payment (authenticated user only).

## Important Links:

- **Base URL:** https://redwolf.onrender.com
- **Documentation:** https://redwolf.onrender.com/api-docs