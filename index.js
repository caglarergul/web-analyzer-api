const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rp = require('request-promise');
const $ = require('cheerio');

const app = express();
const port = 3000;

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let isItShopify = false;
let isItBigCommerce = false;
let isItVolusion = false;
let isItMagento = false;
let isIt3dCart = false;

let thePlatformObject = {
    website: {
        platform: null,
        url: null
    },
    marketing: {
        facebook_pixel_exist: null,
        google_analytics_exist: null
    }
};

checkFacebookPixel = (html) => {
    if (html.includes("Facebook Pixel")) {
        thePlatformObject.marketing.facebook_pixel_exist = true;
    } else {
        thePlatformObject.marketing.facebook_pixel_exist = false;
    }
}

checkGoogleAnalytics = (html) => {
    if (html.includes("google-analytics") || html.includes("GoogleAnalytics") || html.includes("UA-")) {
        thePlatformObject.marketing.google_analytics_exist = true;
    } else {
        thePlatformObject.marketing.google_analytics_exist = false;
    }
}

checkScriptsToIdentifyPlatform = (html) => {
    let scriptTagLength = $('script', html).length;

    const scriptSrc = [];
    for (let i = 0; i < scriptTagLength; i++) {
        //req.json($('script', html).json());
        if ($('script', html)[i].attribs.src !== undefined) {
            scriptSrc.push($('script', html)[i].attribs.src);
        }
    }
    return scriptSrc;
}


app.post('/platform', (req, res) => {
    console.log("URL:", req.body.url)
    rp({
        url: req.body.url,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    }).then(function (html) {
        thePlatformObject.website.url = req.body.url;
        checkFacebookPixel(html);
        checkGoogleAnalytics(html);
        return checkScriptsToIdentifyPlatform(html);
    }).then((data) => {
        data.map((item) => {
            if (item.includes("cdn.shopify.com")) {
                //console.log("storefront is found");
                isItShopify = true;
                isItUnKnownPlatform = false;
                thePlatformObject.website.platform = "Shopify";
            } else if (item.includes(".bigcommerce.com")) {
                //console.log("storefront is found");
                isItBigCommerce = true;
                isItUnKnownPlatform = false;
                thePlatformObject.website.platform = "Bigcommerce";
            } else if (item.includes("vspfiles")) {
                //console.log("storefront is found");
                isItVolusion = true;
                isItUnKnownPlatform = false;
                thePlatformObject.website.platform = "Volusion";
            } else {
                if (isItShopify || isItBigCommerce ||  isItVolusion) {
                    isItUnKnownPlatform = false;
                }else {
                    isItShopify = false;
                    isItBigCommerce = false;
                    isItVolusion = false;
                    isItUnKnownPlatform = true;
                }

                
            }
        });
    }).then(() => {
        if (isItShopify) {
            console.log("This website is Shopify");
            res.json(thePlatformObject);
        }
        else if (isItBigCommerce) {
            console.log("This website is Bigcommerce");
            res.json(thePlatformObject);
        }
        else if (isItVolusion) {
            console.log("This website is Volusion");
            res.json(thePlatformObject);
        }
        else if (isItMagento) {
            console.log("This website is Magento");
            res.json(thePlatformObject);
        }
        else if (isIt3dCart) {
            console.log("This website is 3DCart Commerce");
            res.json(thePlatformObject);
        }
        else if (isItUnKnownPlatform) {
            console.log("Unknown Platform");
            thePlatformObject.website.platform = "Unknown Platform";
            res.json(thePlatformObject);
        }

    }).catch(function (err) {
        //handle error
        //console.log(err)
    });

});

app.listen(process.env.PORT || 3000, () => console.log(`Web Analyzer API is working on ${port}!`))
