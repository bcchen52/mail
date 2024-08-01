# mail

Mail is a single-page email application that allows users to send emails to each other through API calls.

Users send and interact with emails through the front-end and JavaScript, which makes API calls with Django. Users can send, archive, and reply to emails.

Mail is project 3 from Harvard University's CS50W. 

## Table of contents


## Functionality and Features

This project meets all requirements specified by CS50W, listed [here.](https://cs50.harvard.edu/web/2020/projects/3/mail/)

This includes...
- **Mail**, **Sent**, and **Archived** mailboxes
- The ability for users to send emails to multiple recipients through JavaScript and Django API calls
- The ability for users to archive emails
- The ability for users to continually reply to each other with automatic timestamps

## Requirements

This project requires Django to be installed.

Run

    $ pip install -r requirements.txt

## How To Use

This repository contains an empty Mail application. 

Clone and enter the repository.

When running for the first time, create migrations with the following.

    $ python manage.py makemigrations mail
    $ python manage.py migrate

After migrations have been created, run the app with 

    $ python manage.py runserver
