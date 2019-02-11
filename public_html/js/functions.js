var newId = 0;
var totalCost = 0;

//submit button 
function checkAvailability() {
    saveForm();
    var storedData = getObject('form1Data');
    if (storedData.checkin === "" || storedData.checkout === "") {
        alert("please enter dates");
    } else {
        var bookings = [];
        for (var key in sessionStorage) {
            if (key.includes("roomBooking")) {
                bookings.push(getObject(key));
            }
        }
        storedData.currentBookings = bookings;
        $('#main_content').collapse('hide');
        availForm('http://localhost:8081/avail_form', storedData);
    }
}
;

//saves data locally to browser storage
function saveForm() {
    var form1Data = {};
    form1Data.checkin = $('#startingDate').val();
    form1Data.checkout = $('#endingDate').val();
    form1Data.nights = ((new Date($('#endingDate').val())) - (new Date($('#startingDate').val()))) / 86400000;
    setObject('form1Data', form1Data);
}
;

// submit data for storage by using AJAX (to be implemented) 
function availForm(path, data) {
    // convert the parameters to a JSON data string
    var json = JSON.stringify(data);
    $.ajax({
        url: path,
        type: "POST",
        data: json,
        success: function (rt) {
            var json = JSON.parse(rt);


            var sup_d_data = {};
            sup_d_data.numberOfRooms = 0;
            sup_d_data.pricePerNight = 77;
            sup_d_data.roomNumbers = [];

            var sup_t_data = {};
            sup_t_data.numberOfRooms = 0;
            sup_t_data.pricePerNight = 75;
            sup_t_data.roomNumbers = [];

            var std_d_data = {};
            std_d_data.numberOfRooms = 0;
            ;
            std_d_data.pricePerNight = 65;
            std_d_data.roomNumbers = [];

            var std_t_data = {};
            std_t_data.numberOfRooms = 0;
            std_t_data.pricePerNight = 62;
            std_t_data.roomNumbers = [];

            for (i in json) {
                switch (json[i].r_class) {
                    case 'sup_d':
                        sup_d_data.numberOfRooms++;
                        sup_d_data.roomNumbers.push(json[i].r_no);
                        break;
                    case 'sup_t':
                        sup_t_data.numberOfRooms++;
                        sup_t_data.roomNumbers.push(json[i].r_no);
                        break;
                    case 'std_d':
                        std_d_data.numberOfRooms++;
                        std_d_data.roomNumbers.push(json[i].r_no);
                        break;
                    case 'std_t':
                        std_t_data.numberOfRooms++;
                        std_t_data.roomNumbers.push(json[i].r_no);
                        break;
                }
            }

            displayRoom('sup_d', sup_d_data);
            displayRoom('sup_t', sup_t_data);
            displayRoom('std_d', std_d_data);
            displayRoom('std_t', std_t_data);

            $('#availableRooms').collapse('show');
            location.href = "#availableRooms";
        },
        error: function () {
            console.log("error");
            alert("error");
        }
    });
}
;

function displayRoom(id, data) {
    $('#' + id + '_button').show();
    $('#' + id + '_price').empty();
    $('#' + id + '_ppn').empty();
    if (data.numberOfRooms > 0) {
        var nights = getObject("form1Data").nights;
        $('#' + id + '_price').append("£" + (data.pricePerNight * nights));
        $('#' + id + '_ppn').append("£" + data.pricePerNight + "/ppn");
    } else {
        $('#' + id + '_price').append(" Not available during these dates ");
        $('#' + id + '_ppn').append(" - ");
        $('#' + id + '_button').hide();
    }
    setObject(id, data);
}


function submitPayment() {

    var newBooking = true;
    for (var key in sessionStorage) {
        if (key.includes("b_ref")) {
            newBooking = false;
        }
    }
    console.log(newBooking);

    if (newBooking === true) {
        var paymentData = {};
        paymentData.c_name = $('#c_name').val();
        paymentData.c_email = $('#c_email').val();
        paymentData.c_address = $('#addr_line').val() + ", " + $('#city').val() + ", " + $('#postcode').val();
        paymentData.c_cardtype = $('#c_cardtype').val();
        paymentData.c_cardexp = $('#c_cardexp').val();
        paymentData.c_cardno = $('#c_cardno').val();
//        paymentData.c_name = "fred flintstone";
//        paymentData.c_email = "bigstone@gmail.com";
//        paymentData.c_address = "seriously stoney house, stonesville sv69 3bd";
//        paymentData.c_cardtype = "V";
//        paymentData.c_cardexp = "12/19";
//        paymentData.c_cardno = 1234567890123456;
        paymentData.bookings = [];
        paymentData.b_ref = -1;
        for (var key in sessionStorage) {
            if (key.includes("roomBooking") && getObject(key).bookingType === "notInDatabase") {
                var newBooking = {};

                newBooking.checkin = getObject(key).checkin;
                newBooking.checkout = getObject(key).checkout;
                newBooking.b_cost = getObject(key).cost;
                newBooking.r_no = getObject(key).roomNo;
                paymentData.bookings.push(newBooking);
            } else if (key.includes("b_ref") && getObject(key).bookingType === "inDatabase") {
                paymentData.b_ref = getObject(key);
            }
        }

        paymentForm('http://localhost:8081/submit_form', paymentData);
    } else if (newBooking === false) {
        var paymentData = {};
        paymentData.bookings = [];
        for (var key in sessionStorage) {
            if (key.includes("roomBooking") && getObject(key).bookingType === "notInDatabase") {
                var newBooking = {};

                newBooking.checkin = getObject(key).checkin;
                newBooking.checkout = getObject(key).checkout;
                newBooking.b_cost = getObject(key).cost;
                newBooking.r_no = getObject(key).roomNo;
                paymentData.bookings.push(newBooking);
                console.log(paymentData);
            } else if (key.includes("b_ref")) {
                console.log(getObject("b_ref"));
                var ref = getObject("b_ref");
                console.log(ref);
                paymentData.b_ref = ref;
            }
        }
        paymentForm('http://localhost:8081/submit_form', paymentData);
    }
}
;
// submit payment details
function paymentForm(path, data) {
    // convert the parameters to a JSON data string
    var json = JSON.stringify(data);
    console.log(json);
    $.ajax({
        url: path,
        type: "POST",
        data: json,
        success: function (rt) {
            console.log("success");
            console.log(rt);
            var json = JSON.parse(rt);
            $('#payment').collapse('hide');
            $('#basket').collapse('hide');
            $('#basket_bookings').empty();
            $('#availableRooms').collapse('hide');
            $('#successful_payment').collapse('show');
            $('#successful_payment_content').empty();
            $('#booking_conf_details').empty();

            if (json.customerName !== "no") {
                $('#successful_payment_content').append("<h2>Thank you " + json.customerName + "</h2><br> \n\
            <h4>Your booking has been made successfully. Please quote your <b>customer number</b>\n\
             (" + json.customerNumber + ") " + "and <b>booking reference number</b> (" + json.bookingRef + ")\n\
             " + "if you would like to make changes to your booking.</h4><br><br>");
            } else {
                $('#successful_payment_content').append("<h2>Thank you. </h2><br> \n\
            <h4>Your booking has been made successfully. Please quote your <b>booking reference number</b> (" + json.bookingRef + ")\n\
             " + "if you would like to make changes to your booking.</h4><br><br>");
            }
            for (var key in sessionStorage) {
                console.log(key);
                if (key.includes("roomBooking")) {
                    var newBooking = {};
                    newBooking.checkin = getObject(key).checkin;
                    newBooking.checkout = getObject(key).checkout;
                    newBooking.b_cost = getObject(key).cost;
                    newBooking.r_class = getObject(key).r_class;

                    var typeOfRoom = "";
                    switch (newBooking.r_class) {
                        case 'sup_d':
                            typeOfRoom = "Supreme Double";
                            break;
                        case 'sup_t':
                            typeOfRoom = "Supreme Twin";
                            break;
                        case 'std_d':
                            typeOfRoom = "Standard Double";
                            break;
                        case 'std_t':
                            typeOfRoom = "Standard Twin";
                            break;
                    }
                    $('#booking_conf_details').append('<tr><th scope="row">' + typeOfRoom + '</th><td>' + newBooking.checkin + '</td><td>' + newBooking.checkout + '</td><td>' + newBooking.b_cost + '</td></tr>');
                }
            }

            clearStorage();
        },
        error: function () {
            console.log("error");
            alert("error");
        }
    });
}
function addRoom(r_class) {
    //create new id
    newId++;
    var bookingKey = "roomBooking" + newId;

    //create booking data
    var bookingData = {};
    bookingData.bookingType = "notInDatabase";
    bookingData.r_class = r_class;
    bookingData.checkin = getObject('form1Data').checkin;
    bookingData.checkout = getObject('form1Data').checkout;
    bookingData.nights = getObject('form1Data').nights;
    bookingData.cost = (getObject('form1Data').nights) * (getObject(r_class).pricePerNight);
    bookingData.roomNo = getObject(r_class).roomNumbers[0];//selects room number from the list
    //
    //set booking object
    setObject(bookingKey, bookingData);

    //removes the room aquired above for this booking from the list
    var r_class_Obj = getObject(r_class);
    r_class_Obj.roomNumbers.shift();

    //check to see if there are still rooms of this type still avialble to display
    var r_class_total = r_class_Obj.numberOfRooms - 1;
    if (r_class_total > 0) {
        var nights = getObject("form1Data").nights;
        $('#' + r_class + '_price').empty();
        $('#' + r_class + '_ppn').empty();
        $('#' + r_class + '_price').append("£" + (r_class_Obj.pricePerNight * nights));
        $('#' + r_class + '_ppn').append("£" + r_class_Obj.pricePerNight + "/ppn");
        $('#' + r_class + '_button').show();
    } else {
        $('#' + r_class + '_price').empty();
        $('#' + r_class + '_ppn').empty();
        $('#' + r_class + '_price').append(" Not available during these dates ");
        $('#' + r_class + '_ppn').append(" - ");
        $('#' + r_class + '_button').hide();
    }

    r_class_Obj.numberOfRooms = r_class_total;
    setObject(r_class, r_class_Obj);
    var typeOfRoom = "";
    switch (r_class) {
        case 'sup_d':
            typeOfRoom = "Supreme Double";
            break;
        case 'sup_t':
            typeOfRoom = "Supreme Twin";
            break;
        case 'std_d':
            typeOfRoom = "Standard Double";
            break;
        case 'std_t':
            typeOfRoom = "Standard Twin";
            break;
    }

    $('#basket_content').append('<div id="' + bookingKey + '"class="row"><div class="well well-sm"><div class="row"><div class="col-md-3"> ' + typeOfRoom + ' </div><div class="col-md-2">From - ' + bookingData.checkin + '</div><div class="col-md-2">Until - ' + bookingData.checkout + '</div><div class="col-md-2">Cost - ' + bookingData.nights * (r_class_Obj.pricePerNight) + '</div><div class="col-md-2"><button class="btn" onclick="removeFromBasket(\'' + bookingKey + '\')">Remove</button></div></div></div></div>');
    $('#basket').collapse('show');
    totalCost += bookingData.nights * (r_class_Obj.pricePerNight);
    $('#total_cost').empty();
    $('#total_cost').append(totalCost);
}

function removeFromBasket(id) {
    var r_class = getObject(id).r_class;
    var r_class_Obj = getObject(r_class);
    var r_class_total = r_class_Obj.numberOfRooms + 1;


    r_class_Obj.roomNumbers.push(getObject(id).roomNo);
    $('#' + r_class + '_p').empty();
    if (r_class_total > 0) {
        var nights = getObject("form1Data").nights;
        $('#' + r_class + '_price').empty();
        $('#' + r_class + '_ppn').empty();
        $('#' + r_class + '_price').append("£" + (r_class_Obj.pricePerNight * nights));
        $('#' + r_class + '_ppn').append("£" + r_class_Obj.pricePerNight + "/ppn");
        $('#' + r_class + '_button').show();
    } else {
        $('#' + r_class + '_price').empty();
        $('#' + r_class + '_ppn').empty();
        $('#' + r_class + '_price').append(" Not available during these dates ");
        $('#' + r_class + '_ppn').append(" - ");
        $('#' + r_class + '_button').hide();
    }

    totalCost -= nights * (r_class_Obj.pricePerNight);
    $('#total_cost').empty();
    $('#total_cost').append(totalCost);

    r_class_Obj.numberOfRooms = r_class_total;
    setObject(r_class, r_class_Obj);
    $('#' + id).remove();
    clearObject(id);

    var close = 0;
    for (var key in sessionStorage) {
        if (key.includes("roomBooking")) {
            close++;
        }
    }
    if (close == 0) {
        $('#basket').collapse('hide');
    }
}

function payNow() {
    var newBooking = true;
    for (var key in sessionStorage) {
        if (key.includes("b_ref")) {
            newBooking = false;
        }
    }
    console.log(newBooking);
    if (newBooking === true) {
        $('#payment').collapse('show');
    } else if (newBooking === false) {
        submitPayment();
    }
}

function navBarClicked(id) {
    try {
        $('.thing_to_collapse').collapse('hide');
        $('#navbar').collapse('hide');
        $('#' + id).collapse('show');
    } catch (e) {
        console.log("not in mobile mode");
    }
}


function findBooking() {
    $('#myBookingHeader3').empty();
    $('#myBookingHeader3').append("Booking");
    $('#myBooking_content').empty();

    var bookingsInStorage = 0;
    for (var key in sessionStorage) {
        if (key.includes("roomBooking")) {
            console.log(getObject(key).bookingType);
            if (getObject(key).bookingType === "notInDatabase") {
                console.log("error");
                $('#findBookingError').modal('show');
                bookingsInStorage++;
            } else if (getObject(key).bookingType === "inDatabase") {
                console.log(key);
                clearObject(key);
            }
        }
    }
    if (bookingsInStorage === 0) {
        var b_ref = $('#b_ref').val();
        setObject("b_ref", b_ref);
        var data = {};
        data.b_ref = b_ref;
        var json = JSON.stringify(data);
        $.ajax({
            url: 'http://localhost:8081/find_booking',
            type: "POST",
            data: json,
            success: function (rt) {
                //console.log(rt);
                var json = JSON.parse(rt);
                //console.log(json);
                $('#findMyBooking').collapse('hide');
                $('#myBookingHeader3').append(' - ' + json[0].b_ref);
                for (x in json) {
                    json[x].checkin = json[x].checkin.substring(0, 10);
                    json[x].checkout = json[x].checkout.substring(0, 10);
                    var typeOfRoom = "";
                    switch (json[x].r_class) {
                        case 'sup_d':
                            typeOfRoom = "Supreme Double";
                            break;
                        case 'sup_t':
                            typeOfRoom = "Supreme Twin";
                            break;
                        case 'std_d':
                            typeOfRoom = "Standard Double";
                            break;
                        case 'std_t':
                            typeOfRoom = "Standard Twin";
                            break;
                    }
                    //$('#myBooking_content').append('<div class="row"><div class="well well-sm"><div class="row"><div class="col-md-3"> ' + json[x].b_ref + ' </div><div class="col-md-2">From - ' + json[x].checkin + '</div><div class="col-md-2">Until - ' + json[x].checkout + '</div><div class="col-md-2">Cost - ' + json[x].nights + '</div><div class="col-md-2"><button class="btn">Remove</button></div></div></div></div>');
                    $('#myBooking_content').append('<tr><th scope="row">' + typeOfRoom + '</th><td>' + json[x].checkin + '</td><td>' + json[x].checkout + '</td><td>' + json[x].r_cost + '</td></tr>');
                    //create new id
                    newId++;
                    var bookingKey = "roomBooking" + newId;

                    var bookingData = {};
                    bookingData.bookingType = "inDatabase";
                    bookingData.r_class = json[x].r_class;
                    bookingData.checkin = json[x].checkin;
                    bookingData.checkout = json[x].checkout;
                    bookingData.nights = (((new Date(json[x].checkout)) - (new Date(json[x].checkin))) / 86400000);
                    bookingData.pricePerNight = json[x].r_cost / bookingData.nights;
                    bookingData.cost = json[x].r_cost;
                    bookingData.roomNo = json[x].r_no;

                    //set booking object
                    setObject(bookingKey, bookingData);

                    //console.log(json[x]);
                }
                $('#myBooking').collapse('show');
            },
            error: function () {
                console.log("error");
                alert("error");
            }
        });
    }
}

function resolveBookingSearch() {
    for (var key in sessionStorage) {
        if (key.includes("roomBooking")) {
            clearObject(key);
        }
    }
}

function addRoomsToOldBooking() {
    $('#main_content').collapse('hide');
    $('#myBooking').collapse('hide');

    for (var key in sessionStorage) {
        if (key.includes("roomBooking")) {
            var bookingData = getObject(key);
            var typeOfRoom = "";
            switch (bookingData.r_class) {
                case 'sup_d':
                    typeOfRoom = "Supreme Double";
                    break;
                case 'sup_t':
                    typeOfRoom = "Supreme Twin";
                    break;
                case 'std_d':
                    typeOfRoom = "Standard Double";
                    break;
                case 'std_t':
                    typeOfRoom = "Standard Twin";
                    break;
            }

            $('#basket_bookings').append('<div id="' + key + '"class="row"><div class="well well-sm"><div class="row"><div class="col-md-3"> ' + typeOfRoom + ' </div><div class="col-md-2">From - ' + bookingData.checkin + '</div><div class="col-md-2">Until - ' + bookingData.checkout + '</div><div class="col-md-2">Cost - ' + (bookingData.nights) * (bookingData.pricePerNight) + '</div><div class="col-md-2"></div></div></div></div>');
            $('#basket').collapse('show');
            totalCost += (bookingData.nights * bookingData.pricePerNight);
            $('#total_cost').empty();
            $('#total_cost').append(totalCost);
        }
    }

}

function printPage() {
    $('.collapse-print').collapse("hide");
    window.print();
    $('.collapse-print').collapse("show");
}

function returnToHome() {
    location.href = '';
}