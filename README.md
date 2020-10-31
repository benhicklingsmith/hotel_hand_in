# hotel_website_webdev_group_project

## Overview

Group project for UEA MSc Computer Science website development coursework (3 Students). Website was developed over the course of about 2-3 weeks along side lectures and other assigned coursework at the time.

The task was to develop a fully functioning website for a hotel with a working front and back end capable of allowing guests to book a room, view their booking and manage their booking. We had to consider edge cases when making their booking such as offering alternative options if their original request was unavailable. We also had to allow them to make payments at the end of their stay and the backend had to be capable of offering a staff portal for hotel management tasks such as viewing the status of every room and managing all bookings. 


Key Lessons Learnt

-> Server is a mess - explore using Express for the next project we undertake.

-> Loading all code at once made the index file large and tricky to make changes to as the project developed. Possibly investigate dynamic loading of code in future.

-> CSS is a nightmare.

## Dependencies

(Required)

Node.js

(Optional)

Postgresql

## Usage

### To view the website:

Download code

Open terminal and navigate to /server

Run ```node server.js```

Open browser and navigate to localhost:8081

### To use with backend:

Create a new postgres database using the hotel_schema.txt file.

Edit the database information in the top of the server.js file.

Restart server.js if it is already running.
