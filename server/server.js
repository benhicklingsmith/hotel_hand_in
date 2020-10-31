var http = require('http');
var fs = require('fs')
var user = 'postgres';
var host = 'localhost';
var database ='hotel';
var password = 'dbpassword';
var port = 5432;
// the quick and dirty trick which prevents crashing.
        process.on('uncaughtException', function (err) {
            console.error(err);
            console.log("Node NOT Exiting...");
        });
http.createServer(function (req, res) {
    console.log(req.url)
    console.log(req.method)

    // Website you wish to allow to connect
    // add this line to address the cross-domain XHR issue.
    res.setHeader('Access-Control-Allow-Origin', '*');
    switch (req.url) {
        case '/':
            if (req.method == 'GET') {
                res.writeHead(200, {'Content-Type': 'text/html'});
                fs.createReadStream('../public_html/index.html').pipe(res);
                console.log("sent")
            }
            break;
        case '/avail_form':
            if (req.method == 'POST') {
                console.log("data sent to server");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                    console.log("Partial body: " + body);
                });
                req.on('end', async function () {
                    console.log("Body: " + body);
                    var json = JSON.parse(body);
                    const {Client} = require('pg');
                    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
                    const client = new Client({
                        connectionString: connectionString,
                    });
//                    const client = new Client({
//                        user: user,
//                        host: host,
//                        database: database,
//                        password: password,
//                        port: port,
//                    })
                    await client.connect();
                    const sqlquery1 = "SET SEARCH_PATH TO hotel, hotelbooking";
                    console.log(sqlquery1);
                    const res2 = await client.query(sqlquery1);
                    for (x in json.currentBookings) {
                        var tempbooking = "INSERT INTO temp VALUES(" + json.currentBookings[x].roomNo + ", '" + json.currentBookings[x].checkin + "', '" + json.currentBookings[x].checkout + "');";
                        console.log(tempbooking);
                        var tempbooked = await client.query(tempbooking);
                    }

                    const sqlquery2 = "SELECT * FROM avail_query('" + json.checkin + "', '" + json.checkout + "');";
                    const res1 = await client.query(sqlquery2);
                    await client.end();
                    json = res1.rows;
                    var json_str_new = JSON.stringify(json);
                    console.log(json_str_new);
                    res.end(json_str_new);
                });
            }
            break;
        case '/submit_form':
            if (req.method == 'POST') {
                console.log("submit data sent to server");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                });
                req.on('end', async function () {
                    var json = JSON.parse(body);
                    console.log(json);
                    //setting search path
                    const {Client} = require('pg');
                    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
                    const client = new Client({
                        connectionString: connectionString,
                    });
                    await client.connect();
                    var SQLStatement = "SET SEARCH_PATH TO hotel, hotelbooking;";
                    var res3 = await client.query(SQLStatement);

                    var totalCost = 0.00;
                    var bookings = json.bookings;
                    //new bookings
                    console.log("\n\n" + json.b_ref + "\n\n");
                    if (json.b_ref === -1) {
                        //creating a new customer
                        SQLStatement = "SELECT COALESCE(MAX(c_no), 0) AS c_no FROM customer;";
                        console.log(SQLStatement);
                        res4 = await client.query(SQLStatement);
                        customerNumberRaw = res4.rows;
                        customerNumber = customerNumberRaw[0].c_no;
                        customerNumber += Math.round((Math.random() * 10) + 1);
                        insertCustomer = "SELECT insert_customer(" + customerNumber + ", '" + json.c_name + "', '" + json.c_email + "', '" + json.c_address + "', '" + json.c_cardtype + "', '" + json.c_cardexp + "', '" + json.c_cardno + "');"
                        console.log(insertCustomer);
                        var res5 = await client.query(insertCustomer);

                        console.log("\n\n" + json.b_ref + "\n\n");
                        SQLStatement = "SELECT COALESCE(MAX(b_ref), 0) AS b_ref FROM booking;";
                        res6 = await client.query(SQLStatement);
                        bookingReferenceRaw = res6.rows;
                        bookingReference = bookingReferenceRaw[0].b_ref;
                        bookingReference += Math.round((Math.random() * 10) + 1);
                        //totals up all the room costs
                        for (x in bookings) {
                            bookingCost = bookings[x].b_cost;
                            bookingCostInt = parseFloat(bookingCost);
                            totalCost += bookingCostInt;
                        }
                        var insertBooking = "SELECT insert_booking(" + bookingReference + ", " + customerNumber + ", " + totalCost + ", " + totalCost + ", '');";
                        console.log(insertBooking);
                        res7 = await client.query(insertBooking);
                        for (x in json.bookings) {
                            var insertRoomBooking = "INSERT INTO roombooking VALUES(" + json.bookings[x].r_no + ", " + bookingReference + ", '" + json.bookings[x].checkin + "', '" + json.bookings[x].checkout + "');";
                            console.log(insertRoomBooking);
                            res8 = await client.query(insertRoomBooking);
                        }
                        await client.end();
                        var bookingConfirmation = {};
                        bookingConfirmation.customerName = json.c_name;
                        bookingConfirmation.customerNumber = customerNumber;
                        bookingConfirmation.bookingRef = bookingReference;
                        bookingConfirmation.totalCost = totalCost;
                    } else {
                        bookingReference = json.b_ref;

                        for (x in json.bookings) {
                            console.log("\n\n\n" + json.bookings[x] + "\n\n\n\n")
                            var insertRoomBooking = "INSERT INTO roombooking VALUES(" + json.bookings[x].r_no + ", " + bookingReference + ", '" + json.bookings[x].checkin + "', '" + json.bookings[x].checkout + "');";
                            console.log(insertRoomBooking);
                            res8 = await client.query(insertRoomBooking);

                            var updateBooking = "UPDATE booking SET b_cost = b_cost + " + json.bookings[x].b_cost + ", b_outstanding = b_outstanding + " + json.bookings[x].b_cost + " WHERE b_ref = " + json.b_ref + ";";
                            console.log(updateBooking);
                            res8 = await client.query(updateBooking);


                            await client.end();
                            var bookingConfirmation = {};
                            bookingConfirmation.customerName = "no";
                            bookingConfirmation.customerNumber = 12345;
                            bookingConfirmation.bookingRef = bookingReference;
                            bookingConfirmation.totalCost = totalCost;

                        }
                    }



                    var bookingConfirmationJson = JSON.stringify(bookingConfirmation);
                    console.log(bookingConfirmationJson);
                    res.end(bookingConfirmationJson);
                });
            }
            break;
        case '/find_booking':
            if (req.method == 'POST') {
                console.log("data sent to server");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                    console.log("Partial body: " + body);
                });
                req.on('end', async function () {
                    console.log("Body: " + body);
                    var json = JSON.parse(body);
                    console.log(json);
                    //setting search path
                    const {Client} = require('pg');
                    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
                    const client = new Client({
                        connectionString: connectionString,
                    });
                    await client.connect();
                    var SQLStatement = "SET SEARCH_PATH TO hotel, hotelbooking;";
                    var res3 = await client.query(SQLStatement);
                    var b_ref = json.b_ref
                    var SQLStatement = "select * from findBooking(" + b_ref + ");";
                    console.log(SQLStatement);
                    res9 = await client.query(SQLStatement);
                    console.log(res9);
                    json = res9.rows;
                    var json_str_new = JSON.stringify(json);
                    console.log(json_str_new);
                    res.end(json_str_new);
                });
            }
            break;
        case '/housekeeping':
            if (req.method == 'POST') {
                console.log("data sent to server");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                    console.log("Partial body: " + body);
                });
                req.on('end', async function () {
                    console.log("Body: " + body);
                    var json = JSON.parse(body);
                    console.log(json);
                    //setting search path
                    const {Client} = require('pg');
                    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
                    const client = new Client({
                        connectionString: connectionString,
                    });
                    await client.connect();
                    var SQLStatement = "SET SEARCH_PATH TO hotel, hotelbooking;";
                    var setSearchPath = await client.query(SQLStatement);
                    if (json.request == 'check') {
                        SQLStatement = "SELECT r_no, r_status FROM room WHERE r_status = 'C';";
                        var queryRoomStatuses = await client.query(SQLStatement);
                        json = queryRoomStatuses.rows;
                    } else if (json.request == 'update') {
                        SQLStatement = "UPDATE room SET r_status = '" + json.r_status + "' WHERE r_no = " + json.r_no + ";";
                        var queryRoomStatuses = await client.query(SQLStatement);
                        json = queryRoomStatuses.rows;
                    }

                    var json_str_new = JSON.stringify(json);
                    console.log(json_str_new);
                    res.end(json_str_new);
                });
            }
            break;
        case '/reception':
            if (req.method == 'POST') {
                console.log("data sent to server");
                var body = '';
                req.on('data', function (data) {
                    body += data;
                    //console.log("Partial body: " + body);
                });
                req.on('end', async function () {
                    //console.log("Body: " + body);
                    var json = JSON.parse(body);
                    console.log(json);
                    //setting search path
                    const {Client} = require('pg');
                    const connectionString = 'postgresql://' + user + ':' + password + '@' + host + ':' + port + '/' + database + '';
                    const client = new Client({
                        connectionString: connectionString,
                    });
                    await client.connect();
                    var SQLStatement = "SET SEARCH_PATH TO hotel, hotelbooking;";
                    var setSearchPath = await client.query(SQLStatement);

                    switch (json.request) {
                        case 'allRooms':
                            SQLStatement = "SELECT r_no FROM room;";
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                        case 'updateRoomStatus':
                            SQLStatement = "UPDATE room SET r_status = '" + json.r_status + "' WHERE r_no = " + json.r_no + ";";
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                        case 'allBookings':
                            SQLStatement = "SELECT b_ref FROM booking;";
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                        case 'viewBooking':
                            SQLStatement = "SELECT b_cost, b_outstanding, b_notes FROM booking where b_ref = " + json.b_ref;
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                        case 'makePayment':
                            SQLStatement = "UPDATE booking SET b_outstanding = (b_outstanding - " + json.amount + "), b_notes = CONCAT(b_notes,'" + json.note + "," + json.amount + ",') WHERE b_ref = " + json.b_ref + ";";
                            console.log(SQLStatement);
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                        case 'addTransaction':
                            SQLStatement = "UPDATE booking SET b_cost = b_cost + " + json.amount + ", b_outstanding = (b_outstanding + " + json.amount + "), b_notes = CONCAT(b_notes,'" + json.note + "," + json.amount + ",') WHERE b_ref = " + json.b_ref + ";";
                            var queryRoomStatuses = await client.query(SQLStatement);
                            json = queryRoomStatuses.rows;
                            break;
                    }

                    var json_str_new = JSON.stringify(json);
                    console.log(json_str_new);
                    res.end(json_str_new);
                });
            }
            break;
        default:
            console.log('../public_html/' + req.url)
            fs.readFile('../public_html/' + req.url, function (err,data) {
                if (err) {
                    res.writeHead(404);
                    res.end(JSON.stringify(err));
                    return;
                }
                res.writeHead(200);
                res.end(data);
            });
    }
}).listen(8081); // listen to port 8081




