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

let thePlatformObject = {
    website: {
        platform: null,
        url: null,
        platform_icon: null
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

checkWooCommerceMetaContent = (html) => {
    let metaTagLength = $('meta', html).length;

    const metaContent = [];
    for (let i = 0; i < metaTagLength; i++) {
        //req.json($('script', html).json());
        if ($('meta', html)[i].attribs.content !== undefined) {
            metaContent.push($('meta', html)[i].attribs.content);
            // console.log(metaContent);
        }
    }
    return metaContent;
}

checkScriptsToIdentifyPlatform = (html) => {
    let scriptTagLength = $('script', html).length;

    const scriptSrc = [];
    for (let i = 0; i < scriptTagLength; i++) {
        //req.json($('script', html).json());
        if ($('script', html)[i].attribs.src !== undefined) {
            scriptSrc.push($('script', html)[i].attribs.src);
            // console.log(scriptSrc);
        }
    }
    return scriptSrc;
}


app.post('/platform', (req, res) => {
    let isPlatformRecognized = false;
    let isItUnKnownPlatform = false;
    let wordpressIsFound = false;
    console.log("URL:", req.body.url);

    rp({
        url: req.body.url,
        headers: {
            'User-Agent': 'Request-Promise'
        }
    }).then(function (html) {
        thePlatformObject.website.url = req.body.url;
        checkFacebookPixel(html);
        checkGoogleAnalytics(html);
        let wooCommerceMeta = checkWooCommerceMetaContent(html);
        wooCommerceMeta.map((item) => {
            if (String(item.match(/woocommerce/gi)) === "WooCommerce") {
                isPlatformRecognized = true;
                wordpressIsFound = true;
                thePlatformObject.website.platform = "WooCommerce";
                thePlatformObject.website.platform_icon = "/platform_icons/woocommerce-icon.png";
                console.log("This website is WooCommerce");
                res.json(thePlatformObject);
            }
        });
if (!isPlatformRecognized && !wordpressIsFound) {
    let scriptTags = checkScriptsToIdentifyPlatform(html);
    return scriptTags;
}else {
    return false
}
        
    }).then((data) => {
        if (data) {
            data.map((item) => {

                if (isPlatformRecognized === false) {
                    if (item.includes("cdn.shopify.com")) {
                        isPlatformRecognized = true;
                        thePlatformObject.website.platform = "Shopify";
                        thePlatformObject.website.platform_icon = "/platform_icons/shopify-icon.png";
                        console.log("This website is Shopify");
                        res.json(thePlatformObject);
                    } else if (item.includes(".bigcommerce.com")) {
                        console.log("This website is Bigcommerce");
                        isPlatformRecognized = true;
                        thePlatformObject.website.platform = "Bigcommerce";
                        thePlatformObject.website.platform_icon = "/platform_icons/bigcommerce-icon.png";
                        res.json(thePlatformObject);
                    } else if (item.includes("vspfiles")) {
                        isPlatformRecognized = true;
                        thePlatformObject.website.platform = "Volusion";
                        thePlatformObject.website.platform_icon = "/platform_icons/volusion-icon.png";
                        console.log("This website is Volusion");
                        res.json(thePlatformObject);
                    } else {
                        isPlatformRecognized = true;
                        thePlatformObject.website.platform = "Standalone Application";
                        thePlatformObject.website.platform_icon = "/platform_icons/standalone-icon.png";
                        console.log("This website is Standalone Application");
                        res.json(thePlatformObject);
                    }
                }
            });
        }else {
            console.log("skipped!")
        }



    }).catch(function (err) {
        //handle error
        if (err.statusCode === 403) {
            res.json({error: {status_code : 403, message: "The website is unreachacble or using cloudflare firewall."}});
        }else {
            res.json({error: {message: err}});
        }
        console.log(err.statusCode)
    });

});

app.listen(process.env.PORT || 3000, () => console.log(`Web Analyzer API is working on ${port}!`))
