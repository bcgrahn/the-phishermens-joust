//imports
require('dotenv').config();
const express = require('express');

const app = express();
//howzit
app.listen(process.env.PORT, () => {
	console.log(`Server is active on port: ${process.env.PORT}`);
});
//hello
