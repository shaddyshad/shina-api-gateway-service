const getShinaLink = require('../services/shina-link');

function shinaLinkMiddleware(req, res, next){
    // Check if there is a link ID 
    let linkId = req.header('shina-link-id');

    console.log("Headers ", req.headers);

    if(linkId){
        // Set res headers 
        res.set('shina-link-id', linkId)
        next();
    }else{
        // Create a new link and forward
        getShinaLink()
            .then(shinaLink => {
                shinaLink.createNewLink()
                    .then(linkId => {
                        // Set request and response headers
                        res.set("shina-link-id", linkId);
                        res.end();
                    })
            })

    }

}

module.exports = shinaLinkMiddleware;