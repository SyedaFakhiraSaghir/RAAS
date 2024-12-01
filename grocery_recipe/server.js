const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 5001;

// Middleware
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.use("/public", express.static(path.join(__dirname, "public")));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "database_project",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database.");
});

const createTable = `
    CREATE TABLE IF NOT EXISTS groceries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50),
    brand VARCHAR(50),
    userId INT,
    FOREIGN KEY (userId) REFERENCES signup(id) ON DELETE CASCADE
);`;

db.query(createTable, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table checked/created');
    }
});

// Middleware to simulate user authentication and retrieve user_id
// Replace this with actual user authentication (e.g., JWT) in production
app.use((req, res, next) => {
    req.userId = req.headers['user-id']; // Default for testing
    console.log('User ID:', req.userId);
    next();
});


// 1. Display All Grocery Items for the User
app.get("/", (req, res) => {
    const userId = req.userId; // Get user ID from middleware
    db.query("SELECT * FROM groceries WHERE userId = ?", [userId], (err, results) => {
        if (err) throw err;
        res.json(results); // Return results as JSON to the frontend
    });
});

// 2. Show Add Form
app.get("/add", (req, res) => {
    res.render("add-grocery");
});

// 3. Add New Grocery Item
app.post("/add", (req, res) => {
    const { item, quantity, unit, brand } = req.body;
    const userId = req.userId; // Get user ID from middleware
    db.query(
        "INSERT INTO groceries (item, quantity, unit, brand, userId) VALUES (?, ?, ?, ?, ?)",
        [item, quantity, unit, brand, userId],
        (err) => {
            if (err) throw err;
            res.redirect("/");
        }
    );
});

// 4. Show Edit Form
app.get("/edit/:id", (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Get user ID from middleware
    db.query(
        "SELECT * FROM groceries WHERE id = ? AND userId = ?",
        [id, userId],
        (err, results) => {
            if (err) throw err;
            if (results.length === 0) return res.status(404).send("Not found.");
            res.render("edit-grocery", { grocery: results[0] });
        }
    );
});

// 5. Update Grocery Item
app.post("/edit/:id", (req, res) => {
    const { id } = req.params;
    const { item, quantity, unit, brand } = req.body;
    const userId = req.userId; // Get user ID from middleware
    db.query(
        "UPDATE groceries SET item = ?, quantity = ?, unit = ?, brand = ? WHERE id = ? AND userId = ?",
        [item, quantity, unit, brand, id, userId],
        (err) => {
            if (err) throw err;
            res.redirect("/");
        }
    );
});

// 6. Delete Grocery Item
app.get("/delete/:id", (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Get user ID from middleware
    db.query("DELETE FROM groceries WHERE id = ? AND userId = ?", [id, userId], (err) => {
        if (err) throw err;
        res.redirect("/");
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});