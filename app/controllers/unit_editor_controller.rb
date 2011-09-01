class UnitEditorController < ApplicationController
  before_filter :require_admin

  def index
  
    render
  end

  def upload_unit_types_data
    print "upload_unit_types_data:\n"
    params.keys.each do |key|
      print "         param: '#{key.to_s}' => #{params[key].to_s} \n"
    end

    if request.post?
      UnitType.load_unit_type_data(params["uploaded_unit_types_data"])

    end

    redirect_to :action => "index"
  end
end
