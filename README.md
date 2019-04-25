# Delete Google Location History

I find it useful for Google to have my recent location history (say the past week or so), but worry about the risks of them holding the data longer than that. For example, Google Location History is useful for getting [location targeted surveys](https://surveys.google.com/google-opinion-rewards/) or using [finding a lost phone](https://myaccount.google.com/intro/find-your-phone), but I don't wants ads targeted to me based on a visit from months ago.

This is a browser automation script for deleting part of your Google Location History. AFAIK, there's no API for your location history. From Google Maps, you can either delete all your history or delete a day at a time. This script uses [puppeteer](https://github.com/GoogleChrome/puppeteer/) to control Chromium and delete your history a day at a time.

The first time the script is run, it should be visible so you can log into your Google account. Your login cookie should be saved so you don't have to log in for subsequent visits.
