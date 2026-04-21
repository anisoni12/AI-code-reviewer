const password = "admin123";
const db = require('mysql');

function getUser(id) {
    const query = "SELECT * FROM users WHERE id = " + id;
    db.query(query, function (err, result) {
        console.log(result);
    });
}

function divide(a, b) {
    return a / b;
}
eval("console.log('hello')");