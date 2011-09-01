    function value_in_array (the_value, the_array) {
        if (the_array == null) {
            return false;
        }
        
        var i = 0;
        var is_in_array = false;
        while ((!is_in_array) && (i < the_array.length)) {
            if (the_array[i] == the_value) {
                is_in_array = true;
            }
            i++;
        }
        return is_in_array;
    }
    
     function replace_value_in_array (former_value, new_value, the_array) {
        for (var i = 0;  i < the_array.length; i++) {
            if (the_array[i] == former_value) {
                the_array[i] = new_value;
            }
        }
    }

    function arrayToText(theArray) {
        if (theArray.length == 1) {
            return " "+theArray[0];
        } else {
            var theText = "";
            for (var i = 0;  i < theArray.length; i++) {
                theText += " " + theArray[i];
                if (i == (theArray.length - 1)) {
            
                } else if (i == (theArray.length - 2)) {
                    theText += " and"
                } else {
                    theText += " ,"
                }
            }

            return theText;
        }
    }

var MethodScheduler = Class.create({
    initialize: function(
        theStartIntervalLength,
        theMethodToSchedul
    ) {        
        this.startIntervalLength = theStartIntervalLength;
        this.intervalLength = this.startIntervalLength;
        this.sMethod = theMethodToSchedul;

        this.intervalID = 0;
    },

    periodaclllyCheckStatus: function() {
      this.resetIntervalLength();
      this.intervalID = setInterval(this.checkStatus, this.intervalLength);   //
    },

    checkStatus: function() {
        // this.clearInterval();
        this.sMethod.call();

        // this.intervalLength = 1.05 * this.intervalLength;
        // this.intervalID = setInterval(this.checkStatus, this.intervalLength);
    },

    clearInterval: function() {
        clearInterval(this.intervalID);
    },

    resetIntervalLength: function() {
        this.intervalLength = this.startIntervalLength;
    }
});

MethodScheduler.callMethod = function() {
    
}
