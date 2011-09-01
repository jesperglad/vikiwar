class NewsItemController < ApplicationController
  layout nil 
  
  def index
    @news = NewsItem.find(:all)

    render :layout => false
    # response.headers["Content-Type"] = "application/xml; charset=utf-8"
  end

  def new
    @news = NewsItem.find(:all)
  end

  def dynamic_news
    # puts "*** NewsItem.dynamic_news ****"
    # puts "*** params: "
    # params.keys.each do |key|
    #  puts "         param: '#{key.to_s}' => #{params[key].to_s} "
    # end

    tag = params["tag"]
    start_index = params["start_index"].to_i
    
    the_news = NewsItem.find(:all, :conditions => ["tag = ? and id > ?", tag, start_index], :order => 'id DESC', :limit => 10)
    return render(:text => the_news.to_json);
  end
  
  def create
    @news_item = NewsItem.create(
      :title => params[:title],
      :news_date => Time.now,
      :tag => "headline-news",
      :content => params[:content])
    
    if @news_item.save
      flash[:notice] = "CREATED"
      redirect_to :controller => "news_item", :action => "index";
    else
        render :action => "new"
    end
  end
end
