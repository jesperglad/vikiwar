var imStatusIntervalld = null;
var imStartIntervalLength = 10000;
var imIntervalLength = imStartIntervalLength;

function imPeriodaclllyCheckStatus() {
    imResetIntervalLength();
    imStatusIntervalld = setInterval(imCheckStatus, imIntervalLength);   //
}

function imCheckStatus () {
  clearImInterval();
  
  new Ajax.Updater(
    'im_messages_history',
    '/im/im_pull_messages',
    {asynchronous:true, evalScripts:true, onFailure: function(){}
  });
  
  imIntervalLength = 1.05 * imIntervalLength;
  imStatusIntervalld = setInterval(imCheckStatus, imIntervalLength);
}

function clearImInterval() {
    clearInterval(imStatusIntervalld);
}

function imResetIntervalLength() {
    imIntervalLength = imStartIntervalLength;
}


