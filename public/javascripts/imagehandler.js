 function ImageHandler(image_names, location, post_fix, image_loaded_callback) {
   // store the call-back
   this.image_loaded_callback = image_loaded_callback; 

   // initialize internal state.
   this.num_image_loaded = 0;
   this.num_image_processed = 0;
   this.images = new Array;

   // record the number of images.
   this.num_images = image_names.length;
 
   // for each image, call preload()
   for ( var i = 0; i < image_names.length; i++ ) {
      this.preload(image_names[i], location, post_fix);
   }
}
 
ImageHandler.prototype.preload = function(image_name, location, post_fix) {
   // create new Image object and add to array
   var the_image = new Image;
   this.images[image_name]=the_image;

   // set up event handlers for the Image object
   the_image.onload = ImageHandler.prototype.onload;
   the_image.onerror = ImageHandler.prototype.onerror;
   the_image.onabort = ImageHandler.prototype.onabort;
  
   // assign pointer back to this.
   the_image.the_ImageHandler = this;
   the_image.is_loaded = false;  

   // assign the .src property of the Image object
   the_image.src = location+image_name+post_fix;
}

ImageHandler.prototype.onComplete = function() {
   this.num_image_processed++;
   if ( this.num_image_processed == this.num_images ) {

      this.image_loaded_callback(this.images, this.num_image_loaded);
   }
}

ImageHandler.prototype.onload = function()  {
   this.is_loaded = true;
   this.the_ImageHandler.num_image_loaded++;
   this.the_ImageHandler.onComplete();
}

ImageHandler.prototype.onerror = function() {
   this.is_error = true;
   this.the_ImageHandler.onComplete();
}

ImageHandler.prototype.onabort = function() {
   this.is_abort = true;
   this.the_ImageHandler.onComplete();
}