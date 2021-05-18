(function() {
  // used to fade elements in and out
  // https://stackoverflow.com/questions/30206054/vanilla-javascript-fadein-fadeout-without-jquery

  // adding a _ method on which we can attach utility functions
  function _(el) {
    if (!(this instanceof _)) {
      return new _(el);
    }

    this.el = typeof el === 'string' ? document.querySelectorAll(el) : el;
  }

  _.prototype._applyFunc = function(func) {
    var slicedArgs = Array.prototype.slice.call(arguments, 1); // all arguments except the function name

    if(typeof this.el.forEach === 'function') { // el is an array
      this.el.forEach(function(el) {
        this['_' + func].apply(this, [el].concat(slicedArgs));
      }.bind(this));
    } else { // el is a single item
      this['_' + func].apply(this, [this.el].concat(slicedArgs));
    }
  };

  _.prototype.fade = function(type, ms) {
    this._applyFunc('fade', type, ms);
  };

  _.prototype._fade = function(el, type, ms) {
    var isIn = type === 'in',
      opacity = isIn ? 0 : 1,
      interval = 10,
      duration = ms,
      gap = interval / duration,
      self = this;

    if(isIn) { // fading in
      if(el.style.display === 'none')
        el.style.display = '';
      el.style.opacity = opacity;
    }

    function func() {
      opacity = isIn ? opacity + gap : opacity - gap;
      el.style.opacity = opacity;

      if(opacity <= 0) {
        el.style.display = 'none';
        el.style.opacity = 1;
      }

      if(opacity <= 0 || opacity >= 1) {
        window.clearInterval(fading);
      }
    }

    var fading = window.setInterval(func, interval);
  };

  function Kudo(element) {
    this.element = element;
    this.heartButton = element.querySelector('.kudo-button');
    this.postId = element.getAttribute('data-post-id');

    this.loadKudos();
    if (!storageSupported()) {
      this.heartButton.style.display = 'none';
      return;
    }

    this.isKudoed = !!getKudos()[this.postId];
    if (this.isKudoed) {
      this.displayKudoed();
    } else {
      this.displayNotKudoed();
    }

    this.bindEvents();
  }

  Kudo.prototype.bindEvents = function() {
    var self = this;
    this.heartButton.addEventListener('click', function() {
      if (self.isKudoed) {
        self.removeKudo();
      } else {
        self.addKudo();
      }
    });
  };

  Kudo.prototype.loadKudos = function() {
    this.postRef = firebase.database().ref('/posts/' + this.postId);

    // will listen for updates
    this.postRef.on(
      'value',
      function(snapshot) {
        if (!snapshot.val()) {
          this.postRef.set({ kudos_count: 0 });
        }

        this.postData = snapshot.val() || { kudos_count: 0 };
        this.kudosCount = parseInt(this.postData.kudos_count);
        this.updateKudoCountDisplay(this.kudosCount);
        _(this.element).fade('in', 100);
      }.bind(this)
    );
  };

  Kudo.prototype.addKudo = function() {
    var kudos = getKudos();
    kudos[this.postId] = true;
    localStorage.setItem('kudos', JSON.stringify(kudos));
    this.toggleKudo('add');
    this.displayKudoed();
    this.displayKudoThanks();
  };

  Kudo.prototype.displayKudoed = function() {
    this.isKudoed = true;
    this.element.classList.add('kudoed');
    this.heartButton.setAttribute('aria-pressed', true);
  };

  Kudo.prototype.toggleKudo = function(operation) {
    var self = this;

    // perform kudo update in a transaction. if the count
    // has been updated since the user was on the page, then
    // it will fail and retry until it succeeds
    this.postRef.transaction(function(post) {
      if (post) {
        if (operation === 'add') {
          post.kudos_count = post.kudos_count || 0;
          post.kudos_count++;
        } else {
          post.kudos_count = post.kudos_count || 1;
          post.kudos_count--;
        }

        self.kudosCount = post.kudos_count;
        self.updateKudoCountDisplay(self.kudosCount);
      }

      return post;
    });
  };

  Kudo.prototype.removeKudo = function() {
    var kudos = getKudos();
    delete kudos[this.postId];
    localStorage.setItem('kudos', JSON.stringify(kudos));
    this.toggleKudo('remove');
    this.updateKudoCountDisplay(this.kudosCount);
    this.displayNotKudoed();
  };

  Kudo.prototype.displayNotKudoed = function() {
    this.isKudoed = false;
    this.element.classList.remove('kudoed');
    this.heartButton.setAttribute('aria-pressed', false);
  };

  Kudo.prototype.displayKudoThanks = function() {
    var self = this;
    this.element.querySelector('.kudo-count-message').style.display = 'none'; // hide count
    this.element.querySelector('.kudo-thanks').style.display = 'block'; // display thanks

    setTimeout(function() {
      _(self.element.querySelector('.kudo-thanks')).fade('out', 100);
      setTimeout(function() {
        _(self.element.querySelector('.kudo-count-message')).fade('in', 100);
      }, 110);
    }, 1500);
  };

  Kudo.prototype.updateKudoCountDisplay = function(count) {
    this.element.querySelector('.kudo-count').textContent = count;
    var kudoWord = count === 1 ? 'kudo' : 'kudos';
    this.element.querySelector('.kudo-word').textContent = kudoWord;
  };

  function getKudos() {
    if (storageSupported()) {
      var kudos = JSON.parse(localStorage.getItem('kudos'));
      if (!kudos) {
        kudos = {};
        localStorage.setItem('kudos', JSON.stringify(kudos));
      }
      return kudos;
    }
  }

  function getStorage(postId) {
    if (storageSupported()) {
      return localStorage.getItem(postId);
    }
  }

  function storageSupported() {
    return typeof Storage !== 'undefined';
  }

  document.querySelectorAll('.kudo-container').forEach(function(kudoContainer) {
    new Kudo(kudoContainer);
  });
})();
