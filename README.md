# MERN Stack Authentication App

**Secure & Seamless User Access**

Empower your users with flexible and secure authentication options, providing effortless access and simplified account management.

[Explore Now](https://mernapp-auth.vercel.app)

## Tech Stack

**Client:** React, Redux-toolkit, React-Query, Bootstrap, React-Bootstrap, Vite

**Server:** Node, Express, MongoDB, Mongoose

**Others:** Vercel, Brevo


## Features

- **Sign up/Login:** Quick and secure user registration and login with personalized account access.
- **Reset password:** Easily reset forgotten passwords with secure email verification.
- **Email authentication:** Verify user identity through secure email-based confirmation OTP.
- **OTP based authentication:** Authenticate users with one-time passwords sent to their email.
- Live previews
- Fullscreen mode
- Cross platform


## API Reference

### Auth api

#### Register new user

| Api route            | Method   | Description                |
| :------------------- | :------- | :------------------------- |
| `/api/auth/register` | `POST`   | **Required**. Your API key |

#### Login existing user

| Api route            | Method   | Description                |
| :------------------- | :------- | :------------------------- |
| `/api/auth/login`    | `POST`   | **Required**. Your API key |

#### Logout the user

| Api route            | Method   | Description                |
| :------------------- | :------- | :------------------------- |
| `/api/auth/logout`   | `POST`   |Your API key                |

#### Verify the user email

| Api route                    | Method   | Description                |
| :--------------------------- | :------- | :------------------------- |
| `/api/auth/send-verify-otp`  | `POST`   |Send otp to the email to verify the account|

| Api route                    | Method   | Description                |
| :--------------------------- | :------- | :------------------------- |
| `/api/auth/verify-account`   | `POST`   |Verify the account by using email and otp|

#### Reset password

| Api route                       | Method   | Description                |
| :------------------------------ | :------- | :------------------------- |
| `/api/auth/send-reset-otp`      | `POST`   |Send otp to the email to reset the password|

| Api route                       | Method   | Description                |
| :-------------------------------| :------- | :------------------------- |
| `/api/auth/reset-password`      | `POST`   |Reset the password with new one|


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`

`ANOTHER_API_KEY`


    
## Run Locally

Clone the project

```bash
  git clone https://github.com/mearyansingh/auth-app-backend.git
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run server
```


## Related

Here are some related projects

[BookShelf](https://github.com/mearyansingh/BookShelf-frontend)
[TaskQuik](https://github.com/mearyansingh/TaskQuik)
[TicketTrek](https://github.com/mearyansingh/TicketTrek)


## Authors

- [@mearyansingh](https://www.github.com/mearyansingh)


## Feedback

If you have any feedback, please reach out to us at [devaryan.me](https://devaryan.me)


## License

[MIT](https://choosealicense.com/licenses/mit/)

