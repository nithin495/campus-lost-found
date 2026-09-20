require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {

    if (err) {
        console.log("MySQL connection failed!");
        console.log(err.message);
        return;
    }

    console.log("MySQL connected successfully!");

});


// Function to send JSON
function sendJSON(res, statusCode, data) {

    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}


// Create server
const server = http.createServer((req, res) => {


    // HOME PAGE
    if (req.url === "/" && req.method === "GET") {

        const filePath = path.join(__dirname, "index.html");

        fs.readFile(filePath, (err, data) => {

            if (err) {
                res.writeHead(500);
                res.end("Error loading website");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(data);

        });

    }


    // CSS
    else if (req.url === "/style.css" && req.method === "GET") {

        const filePath = path.join(__dirname, "style.css");

        fs.readFile(filePath, (err, data) => {

            res.writeHead(200, {
                "Content-Type": "text/css"
            });

            res.end(data);

        });

    }


    // JAVASCRIPT
    else if (req.url === "/script.js" && req.method === "GET") {

        const filePath = path.join(__dirname, "script.js");

        fs.readFile(filePath, (err, data) => {

            res.writeHead(200, {
                "Content-Type": "application/javascript"
            });

            res.end(data);

        });

    }


    // GET ALL ITEMS
    else if (req.url === "/api/items" && req.method === "GET") {

        const sql = "SELECT * FROM items ORDER BY id DESC";

        db.query(sql, (err, results) => {

            if (err) {

                console.log(err.message);

                sendJSON(res, 500, {
                    message: "Error loading items"
                });

                return;
            }

            sendJSON(res, 200, results);

        });

    }


    // ADD NEW ITEM
    else if (req.url === "/api/items" && req.method === "POST") {

        let body = "";

        req.on("data", (chunk) => {

            body += chunk;

        });


        req.on("end", () => {

            try {

                const data = JSON.parse(body);

                const sql = `
                    INSERT INTO items
                    (
                        item_type,
                        item_name,
                        category,
                        description,
                        location,
                        item_date,
                        photo
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;


                const values = [

                    data.type,
                    data.name,
                    data.category,
                    data.description,
                    data.location,
                    data.date,
                    data.photo

                ];


                db.query(sql, values, (err, result) => {

                    if (err) {

                        console.log(err.message);

                        sendJSON(res, 500, {
                            message: "Error saving item"
                        });

                        return;
                    }


                    sendJSON(res, 200, {
                        message: "Item reported successfully!",
                        id: result.insertId
                    });

                });

            }

            catch (error) {

                sendJSON(res, 400, {
                    message: "Invalid data"
                });

            }

        });

    }


    // DELETE ITEM
    else if (
        req.url.startsWith("/api/items/") &&
        req.method === "DELETE"
    ) {

        const id = req.url.split("/")[3];

        const sql = "DELETE FROM items WHERE id = ?";


        db.query(sql, [id], (err, result) => {

            if (err) {

                console.log(err.message);

                sendJSON(res, 500, {
                    message: "Error deleting item"
                });

                return;
            }


            sendJSON(res, 200, {
                message: "Item deleted successfully!"
            });

        });

    }
   // MARK ITEM AS RECOVERED
else if (
    req.url.startsWith("/api/items/") &&
    req.method === "PUT"
) {

    const id = req.url.split("/")[3];

    const sql =
        "UPDATE items SET status = 'Recovered' WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log(err.message);

            sendJSON(res, 500, {
                message: "Error updating item"
            });

            return;
        }

        sendJSON(res, 200, {
            message: "Item marked as recovered!"
        });

    });

}

    // TEST DATABASE
    else if (req.url === "/api/test" && req.method === "GET") {

        db.query("SELECT 1", (err) => {

            if (err) {

                sendJSON(res, 500, {
                    message: "Database connection failed"
                });

                return;
            }


            sendJSON(res, 200, {
                message: "MySQL is connected!"
            });

        });

    }


    // PAGE NOT FOUND
    else {

        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("Page not found");

    }

});


// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
