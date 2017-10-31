  function Loader(target) {
    this.loader = $('<div></div>')
                .addClass('loader-wrapper')
                .append("<div class='loader'></div>");
    this.target = $(target);
    this.start = function() {
    this.target.html('').append(this.loader);
    }
    this.stop = function() {
      this.loader.remove();
    }
  }