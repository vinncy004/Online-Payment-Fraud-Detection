<?php
$host='localhost';
$user='root';
$pass= '';
$db='registration';
$conn=new mysqli($host,$user,$pass,$db);
if ($conn->connect_error) {
    die("Error connecting to database".$conn->connect_error);

}


?>