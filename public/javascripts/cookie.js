var Cookie = Class.create({
    
    initialize: function(theCookieName, theMaxAge) {
        this.cookieName = theCookieName;        
        this.maxAge = theMaxAge;

        this.valuesH = this.retriveCookie();
    },

    //Privat
    storeCookie: function() {
        var cookieS = ""+this.cookieName+"=";
        var firstElement = true
        this.valuesH.each(function(pair) {
            if (firstElement) {
                firstElement = false;
            } else {
                cookieS+= "&";
            }
            
            cookieS+= ""+pair.key+":"+encodeURIComponent(pair.value);
        });

        cookieS += "; max-age="+this.maxAge;

        document.cookie = cookieS;
    },
    
    // Privat
    // Return null if a cookie with the name "theCookieName" is not found
    retriveCookie: function() {
        if (document.cookie == "") { return null; }
        
        var allCookies = document.cookie;
        
        var cookies = allCookies.split('; ');
        var aCookie = null;
        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].substring(0, this.cookieName.length+1) == (this.cookieName + "=")) {
                aCookie = cookies[i];
                break;
            }
        }

        if (aCookie == null) { return null; }

        var aValueH = new Hash();
        var allValues = aCookie.substring(this.cookieName.length+1);
        
        var keysAndValues = allValues.split('&');
        for (var i=0; i < keysAndValues.length; i++) {
            var pair = keysAndValues[i].split(':');

            if (pair.length < 2) {
                break;
            }

            aValueH.set(pair[0], decodeURIComponent(pair[1]));
        }

        return aValueH;
    },

    destroy: function() {
        this.maxAge = 0;
        this.storeCookie();
    },

    destroyValue: function(theKey) {
        this.valuesH.unset(theKey);
    },
    
    setValue: function(theKey, theValue) {
        this.valuesH.set(theKey, theValue);
        this.storeCookie();
    },

    readValue: function(theKey) {
        return this.valuesH.get(theKey);
    },

    isValue: function(theKey, theValue) {
        return (this.readValue(theKey) == theValue);
    }
});

// Class Methods (static methods)
Cookie.createCookie = function(theCookieName, theInitValues, theMaxAge) {
    document.cookie = ""+theCookieName+"="+theInitValues+"; max-age="+theMaxAge;
    return new Cookie(theCookieName, theMaxAge);
}

// Class Methods (static methods)
Cookie.uptainCookie = function(theCookieName, theMaxAge) {
    return new Cookie(theCookieName, theMaxAge);
}

// Class Methods (static methods)
Cookie.doCookieExists = function(theCookieName) {
    if (document.cookie == "") { return false; }
    var allCookies = document.cookie;
    var cookies = allCookies.split('; ');

    var isFound = false;
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].substring(0, theCookieName.length+1) == (theCookieName + "=")) {
            isFound = true;
        }
    }

    return isFound;
}

