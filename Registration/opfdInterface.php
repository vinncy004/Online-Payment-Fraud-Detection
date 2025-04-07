<?php
// Initialize the session
session_start();

// Check if the user is logged in, if not then redirect him to login page
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>opfd</title>
    <style>
        *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }
        body{
            border-color: white;
            display: flex;
            flex-direction: column;
            font-size: 17px;
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        }
        .container{
            color: black;
            background-color: white;
            border:1px solid black;
            box-shadow: 0 15px 35px rgb(76, 78, 189);
            width: 75vw;
            height: 70vh;
            margin-top:10vh ;
            margin-left: 10vw;
        }
        .screen{
            width: 100%;
            height: 85%;
            border-bottom: 1px solid rgb(31, 24, 24);
        }
        button{
            color: rgb(255, 255, 255);
            width:15vw ;
            height: 30px;
            background-color: rgb(31, 31, 201);
            font-size: 16px;
            border-radius: 5px;
        }
        button:hover{
            background-color: rgb(23, 21, 155);
            color: rgb(255, 255, 255);
        }
        .container ul{
            width: 100%;
            margin: 0 auto;
        }
        .container ul li{
            list-style-type: none;
            display: inline-block;
            gap: 20px;
            margin-left: 40px;
            justify-content: space-around;
            margin-top: 20px;
        }
        #log-out{
            border: none;
            background-color: transparent;
            color: red;
            margin-left: 85%;
        }
        a{
            text-decoration: none;
            text-transform: capitalize;
            color: rgb(0, 248, 132);
        }
        a:hover{
            color: rgb(66, 255, 255);
            animation:ease-in-out .5s;
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="screen" id="screen">
            <button id="log-out"><a href="logspage.html">log out</a></button>
       <div id="reviews">
        <p>logged in at  <span id="hours"></span>:<span id="minutes"></span>:<span id="sec"></span><span id="am"></span></p>
        <p>device logged ip >><span id="ipaddress"></span></p>
        <p style="color: rgb(230, 48, 48);" id="unusualLog"></p>
        <p id="location">waiting location information...</p>
       </div>
        </div>
        <ul>
           <li> <button onclick="" id="payment"><a href="mpesa.html">payment</a></button></li>
           <li> <button onclick=""id="transactions"><a href="transcation.html">transaction</a></button></li>
           <li> <button onclick="locationChangeNotifier() "id="reviews">review</button></li>
           <li> <button onclick=""id="report">report</button></li>
        </ul>
    </div>
    
    <script type="text/javascript">
        // Function to calculate distance between two coordinates (in kilometers)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Function to get current geolocation
function getCurrentGeolocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    timestamp: new Date().getTime() // Store as milliseconds
                };
                callback(currentLocation);
            },
            (error) => {
                console.error('Error getting geolocation:', error.message);
                callback(null);
            },
            { enableHighAccuracy: true }
        );
    } else {
        console.error('Geolocation not supported.');
        callback(null);
    }
}

// Function to check and update location
function checkGeolocationChange() {
    getCurrentGeolocation((currentLocation) => {
        if (!currentLocation) return;

        // Get the previous location from localStorage
        const storedLocation = localStorage.getItem('previousLocation');
        const previousLocation = storedLocation ? JSON.parse(storedLocation) : null;

        // Get the paragraph element
        const locationPara = document.getElementById('location');

        if (previousLocation) {
            const timeDiff = (currentLocation.timestamp - previousLocation.timestamp) / 1000 / 60; // Minutes
            const distance = calculateDistance(
                previousLocation.latitude, previousLocation.longitude,
                currentLocation.latitude, currentLocation.longitude
            );

            // Check if distance > 1000 km and time < 10 minutes
            if (distance > 1000 && timeDiff <= 10) {
                const message = `Rapid movement detected! Moved ${distance.toFixed(2)} km in ${timeDiff.toFixed(2)} minutes. ` +
                                `From (Lat: ${previousLocation.latitude}, Lon: ${previousLocation.longitude}) ` +
                                `to (Lat: ${currentLocation.latitude}, Lon: ${currentLocation.longitude})`;
                if (locationPara) {
                    locationPara.textContent = message;
                }
                console.log(message);
            } else if (locationPara) {
                locationPara.textContent = `Distance: ${distance.toFixed(2)} km, Time: ${timeDiff.toFixed(2)} min (No rapid change)`;
            }
        } else if (locationPara) {
            locationPara.textContent = 'No previous location yet.';
        }

        // Store the current location as the new previous location
        localStorage.setItem('previousLocation', JSON.stringify(currentLocation));
    });
}

// Run every 5 seconds
setInterval(checkGeolocationChange, 60000);

// Initial call on page load
checkGeolocationChange();

function time(){
    const now=new Date();
    const hours=now.getHours().toString().padStart(2, '0');
    const minutes=now.getMinutes().toString().padStart(2, '0');
    const seconds=now.getSeconds().toString().padStart(2, '0');
     
    document.getElementById("hours").textContent=hours;
    document.getElementById("minutes").textContent=minutes;
    document.getElementById("sec").textContent=seconds;
    if(hours>=12){
        let a=document.getElementById('am').textContent=" PM"
        
    }else{
         a=document.getElementById('am').textContent=" AM"
    }

    

    if(hours>9){
        document.getElementById('unusualLog').textContent="unusual login detected on ("+hours+" : "+minutes+`${a}`+ ") if not you change your pasword"
       
    }
   
}
time();
function getip(){
    // Function to get IP address
async function getIPAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('ipaddress').textContent = data.ip;
        return data.ip;
    } catch (error) {
        console.error('Error fetching IP:', error);
        document.getElementById('ipaddress').textContent = 'Unable to get IP seems you lack internet connection';
    }
}

    getIPAddress();
  
}
getip();


    </script>
</body>
</html>