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
    let metaTagLength = $('meta[name="generator"]', html).length;

    const metaContent = [];
    for (let i = 0; i < metaTagLength; i++) {
        //req.json($('script', html).json());
        if ($('meta[name="generator"]', html)[i].attribs.content !== undefined) {
            metaContent.push($('meta[name="generator"]', html)[i].attribs.content);
            console.log(metaContent);
        }
    }
    return metaContent;
}
let thePlatformName = null;

checkEcommercePlatformOfWebsite = (htmlContent) => {
    // For Shopify, Bigcommerce, WooCommerce, Volusion Platforms Check Link tag
    // For  Platform Check head > script tag
    thePlatformName = null;
    thePlatformObject.website.platform = null;
    thePlatformObject.website.platform_icon = null;
    let LINK_TAG_SIZE = $('link', htmlContent).length;
    let SCRIPT_TAG_SIZE = $('script', htmlContent).length;

    
    if ($('script[type="text/x-magento-init"]', htmlContent).length > 0) {
        
        thePlatformName = "Magento"
        thePlatformObject.website.platform = "Magento";
        thePlatformObject.website.platform_icon = "/platform_icons/magento-icon.png";
        console.log("This website is Magento");
    }
    else if($('meta[name="generator"]', htmlContent).length > 0) {
       
        for (let i = 0; i < $('meta[name="generator"]', htmlContent).length; i++) {
            if ($('meta[name="generator"]', htmlContent)[i].attribs.content.match(/woocommerce/gi) !== null) {
                if (Array.isArray($('meta[name="generator"]', htmlContent)[i].attribs.content.match(/woocommerce/gi))) {
                    thePlatformName = "Woocommerce"
                    thePlatformObject.website.platform = "Woocommerce";
                    thePlatformObject.website.platform_icon = "/platform_icons/woocommerce-icon.png";
                    console.log("This website is Woocommerce");
                    break;
                    // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi)[0])
                } else {
                    thePlatformName = "Woocommerce"
                    thePlatformObject.website.platform = "Woocommerce";
                    thePlatformObject.website.platform_icon = "/platform_icons/woocommerce-icon.png";
                    console.log("This website is Woocommerce");
                    break;
                    // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi))
                }
            }else if ($('meta[name="generator"]', htmlContent)[i].attribs.content.match(/wix/gi) !== null) {
                if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/wix/gi))) {
                    thePlatformName = "Wix"
                    thePlatformObject.website.platform = "Wix";
                    thePlatformObject.website.platform_icon = "/platform_icons/wix-icon.png";
                    console.log("This website is Wix");
                    break;
                    // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi)[0])
                } else {
                    thePlatformName = "Wix"
                    thePlatformObject.website.platform = "Wix";
                    thePlatformObject.website.platform_icon = "/platform_icons/wix-icon.png";
                    console.log("This website is Wix");
                    break;
                    // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi))
                }
            }
        }
    }
    else {
        
        if (thePlatformName === null) {
            for (let i = 0; i < LINK_TAG_SIZE; i++) {
                // console.log($('link', htmlContent)[i].attribs.href.match(/a\/c\/default\.css+/gi));
                
                if ($('link', htmlContent)[i].attribs.href !== undefined) {
                    if ($('link', htmlContent)[i].attribs.href.match(/shopify/gi) !== null) {
                        if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/shopify/gi))) {
                            thePlatformName = "Shopify"
                            thePlatformObject.website.platform = "Shopify";
                            thePlatformObject.website.platform_icon = "/platform_icons/shopify-icon.png";
                            console.log("This website is Shopify");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi)[0])
                        } else {
                            thePlatformName = "Shopify"
                            thePlatformObject.website.platform = "Shopify";
                            thePlatformObject.website.platform_icon = "/platform_icons/shopify-icon.png";
                            console.log("This website is Shopify");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi))
                        }
                    } else if ($('link', htmlContent)[i].attribs.href.match(/bigcommerce/gi) !== null) {
    
                        if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/bigcommerce/gi))) {
                            thePlatformName = "Bigcommerce"
                            thePlatformObject.website.platform = "Bigcommerce";
                            thePlatformObject.website.platform_icon = "/platform_icons/bigcommerce-icon.png";
                            console.log("This website is Bigcommerce");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi)[0])
                        } else {
                            thePlatformName = "Bigcommerce"
                            thePlatformObject.website.platform = "Bigcommerce";
                            thePlatformObject.website.platform_icon = "/platform_icons/bigcommerce-icon.png";
                            console.log("This website is Bigcommerce");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/shopify/gi))
                        }
                    }
                    else if ($('link', htmlContent)[i].attribs.href.match(/a\/c\/default\.css+/gi) !== null) {
    
                        if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/a\/c\/default\.css+/gi))) {
                            thePlatformName = "Volusion"
                            thePlatformObject.website.platform = "Volusion";
                            thePlatformObject.website.platform_icon = "/platform_icons/volusion-icon.png";
                            console.log("This website is volusion");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi)[0])
                        } else {
                            thePlatformName = "Volusion"
                            thePlatformObject.website.platform = "Volusion";
                            thePlatformObject.website.platform_icon = "/platform_icons/volusion-icon.png";
                            console.log("This website is volusion");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi))
                        }
                    }else if ($('link', htmlContent)[i].attribs.href.match(/vcart=/gi) !== null) {
    
                        if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/vcart=/gi))) {
                            thePlatformName = "3dCart"
                            thePlatformObject.website.platform = "3dCart";
                            thePlatformObject.website.platform_icon = "/platform_icons/3dcart-icon.png";
                            console.log("This website is 3dCart");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi)[0])
                        } else {
                            thePlatformName = "3dCart"
                            thePlatformObject.website.platform = "3dCart";
                            thePlatformObject.website.platform_icon = "/platform_icons/3dcart-icon.png";
                            console.log("This website is 3dCart");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi))
                        }
                    }else if ($('link', htmlContent)[i].attribs.href.match(/skin\/frontend\/+/g) !== null) {
    
                        if (Array.isArray($('link', htmlContent)[i].attribs.href.match(/skin\/frontend\/+/g))) {
                            thePlatformName = "Magento"
                            thePlatformObject.website.platform = "Magento";
                            thePlatformObject.website.platform_icon = "/platform_icons/magento-icon.png";
                            console.log("This website is Magento");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi)[0])
                        } else {
                            thePlatformName = "Magento"
                            thePlatformObject.website.platform = "Magento";
                            thePlatformObject.website.platform_icon = "/platform_icons/magento-icon.png";
                            console.log("This website is Magento");
                            break;
                            // console.log( $('link', htmlContent)[i].attribs.href.match(/woocommerce/gi))
                        }
                    }
                    
                }
            }
    
            if (thePlatformName === null) {
                thePlatformName = "Standalone"
                thePlatformObject.website.platform = "Standalone Application";
                thePlatformObject.website.platform_icon = "/platform_icons/standalone-icon.png";
                console.log("This website is Standalone Application");
            }
            
        }
    }


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
        checkEcommercePlatformOfWebsite(html);
    }).then(() => {
        res.json(thePlatformObject);
    }).catch(function (err) {
        //handle error
        if (err.statusCode === 403) {
            res.json({ error: { status_code: 403, message: "The website is unreachacble or using cloudflare firewall." } });
        } else {
            res.json({ error: err });
        }
        console.log(err.statusCode)
    });

});

app.listen(process.env.PORT || 3000, () => console.log(`Web Analyzer API is working on ${port}!`))
