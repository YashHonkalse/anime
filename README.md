# anime
Cloud_computing_assignment
# Must Watch Anime

## Overview

**Must Watch Anime** is a web application that showcases a list of must-watch anime titles, along with their genres, brief descriptions, and cover images. The application is built using Node.js and serves data from a MySQL database hosted on Amazon RDS, while images are stored in an Amazon S3 bucket.

## Features

- Displays a list of anime titles with their genres and descriptions.
- Fetches data from a MySQL database hosted on AWS RDS.
- Stores cover images in an Amazon S3 bucket.
- Responsive design for optimal viewing on various devices.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MySQL (Amazon RDS)
- **Storage**: Amazon S3
- **Hosting**: Amazon EC2

## Setup 
- Running an EC2 instance with ubuntu os version 22.
- Security Group confiugred to allow HTTP, HTTPS and Trafiic on port 3000 from anywhere
- Created an RDS of my sql on AWS and connected with AWS EC2.
- Created an autoscaling Group for scaling of instances in case of increase in traffic
- Set the sfcaling from minimum to 1 and maximum to 2
- Using the metric of CPU usage that scales instances if cpu usage is greater than 70%
- Created

