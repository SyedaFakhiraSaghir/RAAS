const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = 5002;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Files
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
  CREATE TABLE IF NOT EXISTS recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_name VARCHAR(100) NOT NULL,
    ingredients TEXT NOT NULL,
    recipe TEXT NOT NULL,
    author VARCHAR(50),
    userId INT,
    FOREIGN KEY (userId) REFERENCES signup(id) ON DELETE CASCADE
);`;

db.query(createTable, (err) => {
    if (err) console.error("Error creating table:", err);
    else console.log("Table checked/created");
});

// Routes

// 1. Display All Recipes
app.get("/", (req, res) => {
    db.query("SELECT * FROM recipes", (err, results) => {
        if (err) throw err;
        res.render("recipes", { recipes: results });
    });
});

// 2. Show Add Recipe Form
app.get("/add", (req, res) => {
    res.render("add-recipe");
});

// 3. Add New Recipe
app.post("/add-recipe", (req, res) => {
    const { recipe_name, ingredients, recipe, author } = req.body;
    db.query(
        "INSERT INTO recipes (recipe_name, ingredients, recipe, author) VALUES (?, ?, ?, ?)",
        [recipe_name, ingredients, recipe, author],
        (err) => {
            if (err) throw err;
            res.redirect("/");
        }
    );
});

// 4. Show Edit Recipe Form
app.get("/edit/:id", (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM recipes WHERE id = ?", [id], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.render("edit-recipe", { recipe: results[0] });
        } else {
            res.status(404).send("Recipe Not Found");
        }
    });
});

// 5. Update Recipe
app.post("/edit/:id", (req, res) => {
    const { id } = req.params;
    const { recipe_name, ingredients, recipe, author } = req.body;
    db.query(
        "UPDATE recipes SET recipe_name = ?, ingredients = ?, recipe = ?, author = ? WHERE id = ?",
        [recipe_name, ingredients, recipe, author, id],
        (err) => {
            if (err) throw err;
            res.redirect("/");
        }
    );
});

// 6. Delete Recipe
app.get("/delete/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM recipes WHERE id = ?", [id], (err) => {
        if (err) throw err;
        res.redirect("/");
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
