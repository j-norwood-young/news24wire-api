# AFP API

This app grabs articles from News24Wire via Gallo and posts them on to an API. You will need a Gallow/News24Wire account to use it.

It doesn't stay resident, so I suggest putting it into a cron. It can take a while to go through all the articles, so I suggest a cron time of around 5 mins to be safe.

## Installing

`npm i`

## Setup

Create a `.env` file with the following in it:

```
USERNAME=<your AFP username>
PASSWORD=<your AFP password>
URL=http://www.galloimages.co.za/NewsWire?sitegroupID=20
LOGIN_URL=http://www.galloimages.co.za/Account/LogOn
API_USERNAME=<your RESTful API username>
API_PASSWORD=<your RESTful API password>
API_ENDPOINT=<url to the API's endpoint to store the articles>
```

## Running

`npm start`
