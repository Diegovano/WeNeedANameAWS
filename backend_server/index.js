const express = require("express");
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors({
    origin: '*'
}));
app.use(cors({
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.get("/tableData33", (req, res) => {

    res.json(
        {

            "tableData33": [
                ['Ed', 15 + Math.floor(Math.random() * 35), 'Male'],
                ['Mia', 15 + Math.floor(Math.random() * 35), 'Female'],
                ['Max', 15 + Math.floor(Math.random() * 35), 'Male']
            ]
        })
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});