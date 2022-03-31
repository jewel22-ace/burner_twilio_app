$(function () {
  var speakerDevices = document.getElementById('speaker-devices');
  var ringtoneDevices = document.getElementById('ringtone-devices');
  var outputVolumeBar = document.getElementById('output-volume');
  var inputVolumeBar = document.getElementById('input-volume');
  var volumeIndicators = document.getElementById('volume-indicators');

  log('Requesting Capability Token...');
  $.getJSON('https://coral-herring-7015.twil.io/capability-token')
  //Paste URL HERE
    .done(function (data) {
      log('Got a token.');
      console.log('Token: ' + data.token);

      // Setup Twilio.Device
      Twilio.Device.setup(data.token);

      Twilio.Device.ready(function (device) {
        log('Twilio.Device Ready!');
        document.getElementById('call-controls').style.display = 'block';
      });

      Twilio.Device.error(function (error) {
        log('Twilio.Device Error: ' + error.message);
      });

      Twilio.Device.connect(function (conn) {
        log('Successfully established call!');
        document.getElementById('button-call').style.display = 'none';
        document.getElementById('button-hangup').style.display = 'inline';
        volumeIndicators.style.display = 'block';
        bindVolumeIndicators(conn);
      });

      Twilio.Device.disconnect(function (conn) {
        log('Call ended.');
        document.getElementById('button-call').style.display = 'inline';
        document.getElementById('button-hangup').style.display = 'none';
        volumeIndicators.style.display = 'none';
      });

      Twilio.Device.incoming(function (conn) {
        log('Incoming connection from ' + conn.parameters.From);
        var archEnemyPhoneNumber = '+12099517118';

        if (conn.parameters.From === archEnemyPhoneNumber) {
          conn.reject();
          log('It\'s your nemesis. Rejected call.');
        } else {
          // accept the incoming connection and start two-way audio
          conn.accept();
        }
      });

      setClientNameUI(data.identity);

      Twilio.Device.audio.on('deviceChange', updateAllDevices);

      // Show audio selection UI if it is supported by the browser.
      if (Twilio.Device.audio.isSelectionSupported) {
        document.getElementById('output-selection').style.display = 'block';
      }
    })
    .fail(function () {
      log('Could not get a token from server!');
    });

  // Bind button to make call
  document.getElementById('button-call').onclick = function () {
    // get the phone number to connect the call to
    var params = {
      To: document.getElementById('phone-number').value
    };

    console.log('Calling ' + params.To + '...');
    Twilio.Device.connect(params);
  };

  // Bind button to hangup call
  document.getElementById('button-hangup').onclick = function () {
    log('Hanging up...');
    Twilio.Device.disconnectAll();
  };

  document.getElementById('get-devices').onclick = function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(updateAllDevices);
  };

  speakerDevices.addEventListener('change', function() {
    var selectedDevices = [].slice.call(speakerDevices.children)
      .filter(function(node) { return node.selected; })
      .map(function(node) { return node.getAttribute('data-id'); });
    
    Twilio.Device.audio.speakerDevices.set(selectedDevices);
  });

  ringtoneDevices.addEventListener('change', function() {
    var selectedDevices = [].slice.call(ringtoneDevices.children)
      .filter(function(node) { return node.selected; })
      .map(function(node) { return node.getAttribute('data-id'); });
    
    Twilio.Device.audio.ringtoneDevices.set(selectedDevices);
  });

  function bindVolumeIndicators(connection) {
    connection.volume(function(inputVolume, outputVolume) {
      var inputColor = 'red';
      if (inputVolume < .50) {
        inputColor = 'green';
      } else if (inputVolume < .75) {
        inputColor = 'yellow';
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + 'px';
      inputVolumeBar.style.background = inputColor;

      var outputColor = 'red';
      if (outputVolume < .50) {
        outputColor = 'green';
      } else if (outputVolume < .75) {
        outputColor = 'yellow';
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + 'px';
      outputVolumeBar.style.background = outputColor;
    });
  }

  function updateAllDevices() {
    updateDevices(speakerDevices, Twilio.Device.audio.speakerDevices.get());
    updateDevices(ringtoneDevices, Twilio.Device.audio.ringtoneDevices.get());
  }
});

// Update the available ringtone and speaker devices
function updateDevices(selectEl, selectedDevices) {
  selectEl.innerHTML = '';
  Twilio.Device.audio.availableOutputDevices.forEach(function(device, id) {
    var isActive = (selectedDevices.size === 0 && id === 'default');
    selectedDevices.forEach(function(device) {
      if (device.deviceId === id) { isActive = true; }
    });

    var option = document.createElement('option');
    option.label = device.label;
    option.setAttribute('data-id', id);
    if (isActive) {
      option.setAttribute('selected', 'selected');
    }
    selectEl.appendChild(option);
  });
}

// Activity log
function log(message) {
  var logDiv = document.getElementById('log');
  logDiv.innerHTML += '<p>&gt;&nbsp;' + message + '</p>';
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Set the client name in the UI
function setClientNameUI(clientName) {
  var div = document.getElementById('client-name');
  div.innerHTML = 'Call without any sim card. <strong>'  +
    '</strong>';
}


/*
  Eventually by HTML5 UP
  html5up.net | @ajlkn
  Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function() {

  "use strict";

  var $body = document.querySelector('body');

  // Methods/polyfills.

    // classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
      !function(){function t(t){this.el=t;for(var n=t.className.replace(/^\s+|\s+$/g,"").split(/\s+/),i=0;i<n.length;i++)e.call(this,n[i])}function n(t,n,i){Object.defineProperty?Object.defineProperty(t,n,{get:i}):t.__defineGetter__(n,i)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var i=Array.prototype,e=i.push,s=i.splice,o=i.join;t.prototype={add:function(t){this.contains(t)||(e.call(this,t),this.el.className=this.toString())},contains:function(t){return-1!=this.el.className.indexOf(t)},item:function(t){return this[t]||null},remove:function(t){if(this.contains(t)){for(var n=0;n<this.length&&this[n]!=t;n++);s.call(this,n,1),this.el.className=this.toString()}},toString:function(){return o.call(this," ")},toggle:function(t){return this.contains(t)?this.remove(t):this.add(t),this.contains(t)}},window.DOMTokenList=t,n(Element.prototype,"classList",function(){return new t(this)})}}();

    // canUse
      window.canUse=function(p){if(!window._canUse)window._canUse=document.createElement("div");var e=window._canUse.style,up=p.charAt(0).toUpperCase()+p.slice(1);return p in e||"Moz"+up in e||"Webkit"+up in e||"O"+up in e||"ms"+up in e};

    // window.addEventListener
      (function(){if("addEventListener"in window)return;window.addEventListener=function(type,f){window.attachEvent("on"+type,f)}})();

  // Play initial animations on page load.
    window.addEventListener('load', function() {
      window.setTimeout(function() {
        $body.classList.remove('is-preload');
      }, 100);
    });

  // Slideshow Background.
    (function() {

      // Settings.
        var settings = {

          // Images (in the format of 'url': 'alignment').
            images: {
              'images/bg01.jpg': 'center',
              'images/bg02.jpg': 'center',
              'images/bg03.jpg': 'center',
              'images/bg04.jpg': 'center',
              'images/bg05.jpg': 'center',
              'images/bg06.jpg': 'center',
              'images/bg07.jpg': 'center',
              'images/bg08.jpg': 'center',
              'images/bg09.jpg': 'center',
              'images/bg10.jpg': 'center',
              'images/bg11.jpg': 'center',
              'images/bg12.jpg': 'center',
              'images/bg13.jpg': 'center',
              'images/bg14.jpg': 'center',
              'images/bg15.jpg': 'center',
              'images/bg16.jpg': 'center',
              'images/bg17.jpg': 'center',
              'images/bg18.jpg': 'center',
              'images/bg19.jpg': 'center',
              'images/bg20.jpg': 'center',
              'images/bg21.jpg': 'center',
              'images/bg22.jpg': 'center',
              'images/bg23.jpg': 'center',
              'images/bg24.jpg': 'center',
              'images/bg25.jpg': 'center',
              'images/bg26.jpg': 'center',
              'images/bg27.jpg': 'center',
              'images/bg28.jpg': 'center',
            },

          // Delay.
            delay: 6000

        };

      // Vars.
        var pos = 0, lastPos = 0,
          $wrapper, $bgs = [], $bg,
          k, v;

      // Create BG wrapper, BGs.
        $wrapper = document.createElement('div');
          $wrapper.id = 'bg';
          $body.appendChild($wrapper);

        for (k in settings.images) {

          // Create BG.
            $bg = document.createElement('div');
              $bg.style.backgroundImage = 'url("' + k + '")';
              $bg.style.backgroundPosition = settings.images[k];
              $wrapper.appendChild($bg);

          // Add it to array.
            $bgs.push($bg);

        }

      // Main loop.
        $bgs[pos].classList.add('visible');
        $bgs[pos].classList.add('top');

        // Bail if we only have a single BG or the client doesn't support transitions.
          if ($bgs.length == 1
          ||  !canUse('transition'))
            return;

        window.setInterval(function() {

          lastPos = pos;
          pos++;

          // Wrap to beginning if necessary.
            if (pos >= $bgs.length)
              pos = 0;

          // Swap top images.
            $bgs[lastPos].classList.remove('top');
            $bgs[pos].classList.add('visible');
            $bgs[pos].classList.add('top');

          // Hide last image after a short delay.
            window.setTimeout(function() {
              $bgs[lastPos].classList.remove('visible');
            }, settings.delay / 2);

        }, settings.delay);

    })();

  // Signup Form.
    (function() {

      // Vars.
        var $form = document.querySelectorAll('#signup-form')[0],
          $submit = document.querySelectorAll('#signup-form input[type="submit"]')[0],
          $message;

      // Bail if addEventListener isn't supported.
        if (!('addEventListener' in $form))
          return;

      // Message.
        $message = document.createElement('span');
          $message.classList.add('message');
          $form.appendChild($message);

        $message._show = function(type, text) {

          $message.innerHTML = text;
          $message.classList.add(type);
          $message.classList.add('visible');

          window.setTimeout(function() {
            $message._hide();
          }, 3000);

        };

        $message._hide = function() {
          $message.classList.remove('visible');
        };

      // Events.
      // Note: If you're *not* using AJAX, get rid of this event listener.
        $form.addEventListener('submit', function(event) {

          event.stopPropagation();
          event.preventDefault();

          // Hide message.
            $message._hide();

          // Disable submit.
            $submit.disabled = true;

          // Process form.
          // Note: Doesn't actually do anything yet (other than report back with a "thank you"),
          // but there's enough here to piece together a working AJAX submission call that does.
            window.setTimeout(function() {

              // Reset form.
                $form.reset();

              // Enable submit.
                $submit.disabled = false;

              // Show message.
                $message._show('success', 'Thank you!');
                //$message._show('failure', 'Something went wrong. Please try again.');

            }, 750);

        });

    })();

})();
