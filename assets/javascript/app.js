$(document).ready(function() {
    $("[data-toggle=tooltip]").tooltip();

    // Check JS file linked
    console.log("Hello Kal..your JS file is correctly linked ;) !");

    // Calling Firebase database
    var config = {
        apiKey: "AIzaSyAAEEqHTM5T949wCEB97hC-PhR0cSF_85Y",
        authDomain: "train-scheduler-a18a9.firebaseapp.com",
        databaseURL: "https://train-scheduler-a18a9.firebaseio.com",
        projectId: "train-scheduler-a18a9",
        storageBucket: "train-scheduler-a18a9.appspot.com",
        messagingSenderId: "179864822003"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    //Declaring my global variables
    var num = 1;
    var trainName;
    var destinantion;
    var firstTrainTime;
    var frequency;
    var nextTrain;
    var nextTrainFormatted;
    var minutesAway;
    var keyToUpdate;
    var indexToUpdate;

    //Declaring variables for time calculation

    var firstTimeConverted;
    var currentTime;
    var diffTime;
    var tRemainder;
    var minutesTillTrain;

    // Pushing values to the database when submit is clicked
    $("#submit-button").on("click", function(event) {
        event.preventDefault();

        // Taking values from the form & assigning to variables
        trainName = $("#nameInput").val().trim();
        destination = $("#destinationInput").val().trim();
        firstTrainTime = $("#timeInput").val().trim();
        frequency = $("#frequencyInput").val().trim();

        console.log(trainName, destination, firstTrainTime, frequency);

        // Calculating "Next Arrival" and "Minutes Avay"
        firstTimeConverted = moment(firstTrainTime, "hh:mm").subtract(1, "years");
        currentTime = moment();
        diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        tRemainder = diffTime % frequency;
        minutesTillTrain = frequency - tRemainder;
        nextTrain = moment().add(minutesTillTrain, "minutes");
        nextTrainFormatted = moment(nextTrain).format("hh:mm A");

        console.log(nextTrainFormatted, minutesTillTrain);

        // Pushing the values to the database
        database.ref().push({
            trainName: trainName,
            destination: destination,
            firstTrainTime: firstTrainTime,
            frequency: frequency,
            nextTrainFormatted: nextTrainFormatted,
            minutesTillTrain: minutesTillTrain
        })
    });


    // Appending new records from the database
    database.ref().on("child_added", function(snapshot) {

        console.log(snapshot.val());
        console.log(snapshot.key);

        var newPost = snapshot.val();

        console.log("Train name from database: " + newPost.trainName);
        console.log("Destination from database: " + newPost.destination);
        console.log("1st train time from database: " + newPost.firstTrainTime);
        console.log("Frequency from database: " + newPost.frequency);
        console.log("nextArrival calculated: " + newPost.nextTrainFormatted);
        console.log("minutesAway calculated: " + newPost.minutesTillTrain);


        // Building a new row and appending with values from the database
        $('#myTable').last().append($(

            "<tr class='table-row' id=" + "'" + snapshot.key + "'" + ">" +
            "<td>" + num++ + "</td>" +
            "<td>" + newPost.trainName + "</td>" +
            "<td>" + newPost.destination + "</td>" +
            "<td>" + newPost.frequency + "</td>" +
            "<td>" + newPost.nextTrainFormatted + "</td>" +
            "<td>" + newPost.minutesTillTrain + "</td>" +
            // "<td>" + "<input type='submit' value='Delete' class='btn btn-danger btn-sm' id='remove-train'>" + "</td>" +
            "<td>" + '<p data-placement="top" data-toggle="tooltip" title="Edit"><button class="btn btn-primary btn-xs update" data-title="Edit" data-toggle="modal" data-target="#edit"><span class="glyphicon glyphicon-pencil"></span></button></p>' + "</td>" +
            "<td>" + '<p data-placement="top" data-toggle="tooltip" title="Delete"><button id="remove-train"class="btn btn-danger btn-xs delete" data-title="Delete" data-toggle="modal" data-target="#delete"><span class="glyphicon glyphicon-trash"></span></button></p>' +
            "</tr>"));

    });

    //Capturing the key to update and the row index when edit is clicked
    $("body").on("click", ".update", function() {
        keyToUpdate = $(this).parent().parent().parent().attr('id');
        indexToUpdate = $(this).parent().parent().parent().index();
        console.log(keyToUpdate);
        console.log($("#edit-form").children());


        // Calling row values from Database
        var databaseRow = database.ref().child(keyToUpdate);
        databaseRow.on("value", function(snapshot) {
            var row = snapshot.val();
            console.log(row.destination);

            //Populating form fields from database row
            $("#modal-trainName").val(row.trainName);
            $("#modal-trainDestination").val(row.destination);
            $("#modal-trainTime").val(row.nextTrainFormatted.split(" ")[0]);
            console.log(row.nextTrainFormatted.split(" "));
            $("#modal-trainFrequeny").val(row.frequency);
            console.log(row.frequency);

        });

    });


    //Capturing the key to update and the row index when delete is clicked
    $("body").on("click", ".delete", function() {
        keyToUpdate = $(this).parent().parent().parent().attr('id');
        indexToUpdate = $(this).parent().parent().parent().index();
        console.log(keyToUpdate);
    });

    $(".modal-footer").on("click", "#remove-train", function() {
        //Remove tr from page
        $("#myTable tbody tr:nth-child(" + (indexToUpdate + 1) + ")").remove();

        // document.getElementById("myTable").deleteRow(indexToUpdate+1);
        $("#delete").modal("hide");

        // Remove childkey from database
        database.ref().child(keyToUpdate).remove();

    });

    // Updating the database rows	
    $(".modal-footer").on("click", "#update-train", function() {

        var databaseRow = database.ref().child(keyToUpdate);
        databaseRow.on("value", function(snapshot) {

            //Getting the values from the form
            var TrainNameupdated = $("#modal-trainName").val().trim();
            var TrainDestinationupdated = $("#modal-trainDestination").val().trim();
            var TrainTimeupdated = $("#modal-trainTime").val().trim();
            var TrainFrequency = $("#modal-trainFrequeny").val().trim();

            //Populating form fields from database row
            databaseRow.update({
                'trainName': TrainNameupdated,
                'destination': TrainDestinationupdated,
                'firstTrainTime': TrainTimeupdated,
                'frequency': TrainFrequency
            });
            //Reloading the page
            location.reload();

        });

    });
});