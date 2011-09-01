// +++++++++++++++++++++++++++++
// SoftScrollList Class
// +++++++++++++++++++++++++++++
function SoftScrollList(theScrollPaneId, theNewsDataId, theNewsItemHight, theMaxNumOfItems) {
  this.animationOn = "-webkit-transition: top 2s ease-in-out; -moz-transition: top 2s ease-in-out; -o-transition: top 2s ease-in-out; transition: top 2s ease-in-out;";
  this.animationOff = "-webkit-transition: top 0s ease-in-out; -moz-transition: top 0s ease-in-out; -o-transition: top 0s ease-in-out; transition: top 0s ease-in-out;";
  this.scrollPaneId = theScrollPaneId;
  this.newsDataId = theNewsDataId;
  this.newsItemHight = theNewsItemHight;
  this.maxNumOfItem = theMaxNumOfItems;

  this.numOfAddItems = 0;
  this.battleNewsIndex = 0;
}

SoftScrollList.prototype.createListHTML = function() {
    this.numOfAddItems = 0;
    $(this.newsDataId).normalize();
    var theNews =  $A(eval("("+$(this.newsDataId).firstChild.data+")"));

    // Create html for the new items
    var latestNews = theNews.first();
    if ((latestNews != undefined) && (this.battleNewsIndex < latestNews.id)) {
      var d =  latestNews.id - this.battleNewsIndex;
      var html = "";
      for (var i = 0; (i <= (d-1) && (i < this.maxNumOfItem)); i++) {
        var theNewsItem = theNews[i];
        html += "<div id='actions_item'><p><b>"+theNewsItem.news_date+": "+theNewsItem.title+"</b><br/>"+theNewsItem.content+"</p></div>";
        this.numOfAddItems += 1;
      }
    }
    this.battleNewsIndex = latestNews.id;

    return html;
}

SoftScrollList.prototype.scrollList = function() {
    $(this.scrollPaneId).setStyle(this.animationOff);

    var html = this.createListHTML();

    $(this.scrollPaneId).setStyle("top: "+(-this.newsItemHight*this.numOfAddItems)+"px;");
    $(this.scrollPaneId).insert({top: html}); // Insert new elements in the top
    reduceNewsItems($(this.scrollPaneId), this.maxNumOfItem);
    // theActionScrollPane.setStyle(_animationOn);
   // "$('actions_scrollpane').setStyle(_animationOn); $('actions_scrollpane').setStyle('top: 0px;');"
   var fktCall = "$('"+this.scrollPaneId+"').setStyle('"+this.animationOn+"'); $('"+this.scrollPaneId+"').setStyle('top: 0px;');";

    setTimeout(
       fktCall,
       500
     );
}

SoftScrollList.prototype.checkStatus = function() {
    var battleNewsParameters = "tag="+encodeURIComponent("battle-news") + "&start_index="+encodeURIComponent(_battleNewsIndex);
    new Ajax.Updater(
      'battleNewsData',
      '/news_item/dynamic_news',
      {asynchronous:true, evalScripts:true, onComplete:function(request){updateBattleNews();}, parameters:battleNewsParameters}
    );
}

SoftScrollList.prototype.clearInterval = function() {
  clearInterval(_anStatusIntervalID);
}

// -----------------------------
// END SoftScrollList Class
// -----------------------------


