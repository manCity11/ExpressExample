module.exports = flashMiddleware;

/* ################# */
/* ##### IMPL ##### */
/* ################# */
function flashMiddleware(request, response, next) {

    //if we have flash message
    if(request.session.flash) {

        response.locals.flash = request.session.flash;
        request.session.flash = undefined;
    }

    request.flash = (type, content) => {

        if(!request.session.flash){

            request.session.flash = {};
        }
        request.session.flash[type] = content;
    };
    next();
}