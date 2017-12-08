$(document).ready(function() {

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
    var num = 2;
    var trainName;
    var destinantion;
    var firstTrainTime;
    var frequency;
    var nextTrain;
    var nextTrainFormatted;
    var minutesAway;

    //----------------------
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
            "<td>" + "<input type='submit' value='Delete' class='btn btn-danger btn-sm' id='remove-train'>" + "</td>" +
            "</tr>"));

    });

    // Deleting row and data from database
    $("body").on("click", "#remove-train", function(){
     // Remove row from page
     $(this).closest ('tr').remove();
     
     // Remove row from database
     var childKey = $(this).parent().parent().attr('id');
     console.log(childKey);
     database.ref().child(childKey).remove();
	});
});