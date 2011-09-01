// +++++++++++++++++++++++++++++
// SoftScrollList Class
// +++++++++++++++++++++++++++++
function SoftScrollList(theScrollPaneId, theNewsDataId, theTag, theNewsItemHight, theMaxNumOfItems) {
  this.animationOn = "-webkit-transition: top 2s ease-in-out; -moz-transition: top 2s ease-in-out; -o-transition: top 2s ease-in-out; transition: top 2s ease-in-out;";
  this.animationOff = "-webkit-transition: top 0s ease-in-out; -moz-transition: top 0s ease-in-out; -o-transition: top 0s ease-in-out; transition: top 0s ease-in-out;";
  this.scrollPaneId = theScrollPaneId;
  this.newsDataId = theNewsDataId;
  this.newsItemHight = theNewsItemHight;
  this.maxNumOfItem = theMaxNumOfItems;
  this.tag = theTag;
  this.maxHeight = 249;
  
  this.numOfAddItems = 0;
  this.newsIndex = 0;
  this.updateCounter = 0;
  this.offsetH = 12;

}

SoftScrollList.prototype.createListHTML = function() {
    this.numOfAddItems = 0;
    $(this.newsDataId).normalize();
    var theNews =  $A(eval("("+$(this.newsDataId).firstChild.data+")"));
    var html = "";

    // Create html for the new items
    var latestNews = theNews.first();
    if ((latestNews != undefined) && (this.newsIndex < latestNews.id)) {
      var d =  latestNews.id - this.newsIndex;      
      for (var i = 0; (i <= (d-1) && (i < this.maxNumOfItem) && (i < theNews.size())); i++) {
        var theNewsItem = theNews[i];
        if ((theNewsItem.news_date != null) && (theNewsItem.title != null)  && (theNewsItem.content != null)) {
            html += "<div id='actions_item'><p><b>"+theNewsItem.news_date+": "+theNewsItem.title+"</b><br/>"+theNewsItem.content+"</p></div>";
            this.numOfAddItems += 1;
        }
      }
      this.newsIndex = latestNews.id;
    }
    
    return html;
}

SoftScrollList.prototype.reduceNewsItems = function(theMaxNumOfNewsItems, theMaxHeight) {
    var childs = $(this.scrollPaneId).childElements();
    var numOfChilds = childs.size();
    var h = 0;

    for (var i = 0; i < numOfChilds; i++) {
        var aChild = childs[i];
        h += aChild.getHeight();

        if ((h > theMaxHeight) || (i > theMaxNumOfNewsItems )) {
            Element.remove(aChild);
        }
    }
  }

SoftScrollList.prototype.heightOfAddedItems = function() {
    // this.numOfAddItems
    var childs = $(this.scrollPaneId).childElements();
    var h = 0;
    
    for (var i = 0; i < this.numOfAddItems; i++) {
        var aChild = childs[i];
        h += aChild.getHeight() + this.offsetH;
    }

    return h;
}

SoftScrollList.prototype.scrollList = function() {
    // this.updateCounter += 1;
    this.reduceNewsItems(this.maxNumOfItem, this.maxHeight);        
    $(this.scrollPaneId).setStyle(this.animationOff);
    var html = this.createListHTML();    
    $(this.scrollPaneId).insert({top: html}); // Insert new elements in the top
    
    var dh = this.heightOfAddedItems();        
    
    // $(this.scrollPaneId).setStyle("top: "+(-this.newsItemHight*this.numOfAddItems)+"px;");
    $(this.scrollPaneId).setStyle("top: "+(-dh)+"px;");
    
    // theActionScrollPane.setStyle(_animationOn);
   // "$('actions_scrollpane').setStyle(_animationOn); $('actions_scrollpane').setStyle('top: 0px;');"
   var fktCall = "$('"+this.scrollPaneId+"').setStyle('"+this.animationOn+"'); $('"+this.scrollPaneId+"').setStyle('top: 0px;');";

    setTimeout(
       fktCall,
       500
     );
}

SoftScrollList.prototype.ajaxCallBackCheckStatus = function(aSoftScrollList) {
    aSoftScrollList.scrollList();
}

SoftScrollList.prototype.checkStatus = function() {
    var theThis = this;
    var theParameters = "tag="+encodeURIComponent(this.tag) + "&start_index="+encodeURIComponent(this.newsIndex);
    new Ajax.Updater(
      this.newsDataId,
      '/news_item/dynamic_news',
      {asynchronous:true, evalScripts:true, onComplete:function(request){SoftScrollList.prototype.ajaxCallBackCheckStatus(theThis);}, parameters:theParameters}
    );
}

// -----------------------------
// END SoftScrollList Class
// -----------------------------


