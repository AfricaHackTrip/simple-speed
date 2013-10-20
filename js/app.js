//
// HELPER FUNCTIONS
//

Array.prototype.avg = function() {
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) {
    var e = +this[i];
    if (!e && this[i] !== 0 && this[i] !== '0') { e--; }
    if (this[i] === e) { av += e; cnt++; }
  }
  return av/cnt;
};

var doTimer = function(length, resolution, oninstance, oncomplete) {
  var steps = (length / 100) * (resolution / 10),
      speed = length / steps,
      count = 0,
      start = new Date().getTime();

  function instance() {
    if (count++ === steps) {
      oncomplete(steps, count);
    } else {
      oninstance(steps, count);

      var diff = (new Date().getTime() - start) - (count * speed);
      window.setTimeout(instance, (speed - diff));
    }
  }
  window.setTimeout(instance, speed);
};

//
// APPLICATION
//

var App = {

  averageDown: 0,
  averageUp: 0,
  measurements: {
    download: [],
    upload: []
  },
  sampleTime: 10000, // in milliseconds

  sampleString: function() {
    var x = "1234567890";
    var iterations = 12;
    for (var i = 0; i < iterations; i++) {
      x += x.concat(x);
    }
    return x;
  },

  download: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  upload: {
    lastBytesLoaded: 0,
    lastTimestamp: null
  },

  clearResults: function() {
    App.measurements.download = [];
    App.measurements.upload = [];
    App.averageDown = 0;
    App.averageUp = 0;
    App.download.lastBytesLoaded = 0;
    App.download.lastTimestamp = null;
    App.upload.lastBytesLoaded = 0;
    App.upload.lastTimestamp = null;
    App.ui.updateAverage('download', 0);
    App.ui.updateAverage('upload', 0);
  },

  startSpeedtest: function() {
    App.clearResults();
    App.ui.clearProgressBars();
    App.ui.hideStartButton();
    App.startDownload();
  },

  startDownload: function() {
    App.ui.startProgressBar('download');
    $.ajax({
      type: 'GET',
      url: 'https://simplespeed.herokuapp.com/download',
      timeout: App.sampleTime,
      cache: false,
      beforeSend: function(xhr, settings) {
        xhr.addEventListener('progress', App.downloadProgress, false);
      },
      success: function(data, status, xhr){
        console.log('testfile downloaded completely');
        App.startUpload();
      },
      error: function(xhr, errorType, error) {
        if (App.averageDown === 0) {
          App.startDownload();
        } else {
          App.startUpload();
        }
        console.log(errorType);
        // show error
      }
    });
  },

  startUpload: function() {
    App.ui.startProgressBar('upload');
    $.ajax({
      type: 'POST',
      url: 'https://simplespeed.herokuapp.com/upload',
      timeout: App.sampleTime,
      cache: false,
      data: App.sampleString(),
      beforeSend: function(xhr, settings) {
        xhr.upload.addEventListener('progress', App.uploadProgress, false);
      },
      success: function(data, status, xhr){
        console.log('testfile uploaded completely');
        console.log(status);
        console.log(data);
        App.ui.showStartButton();
      },
      error: function(xhr, errorType, error) {
        if (App.averageUp === 0) {
          App.startUpload();
        } else {
          App.ui.showStartButton();
        }
        console.log(errorType);
        // show error
      }
    });
  },

  downloadProgress: function(ev) {
    App.transferProgress(ev, 'download');
  },

  uploadProgress: function(ev) {
    App.transferProgress(ev, 'upload');
  },

  transferProgress: function(ev, type) {
    var bytesLoaded = ev.loaded;
    var timestamp = ev.timeStamp;

    if (App[type].lastTimestamp !== null) {
      var chunkSizeInBits = (bytesLoaded - App[type].lastBytesLoaded) * 8;
      var timestampDifference = timestamp - App[type].lastTimestamp;

      // Some browsers use timestamps with a higher resolution
      if (timestamp.toString().length === 16) {
        timeInSeconds = Math.round(timestampDifference/1000)/1000;
      } else {
        timeInSeconds = Math.round(timestampDifference)/1000;
      }
      // Don't use unrealistic measurements
      if (timeInSeconds < 0.42 ) { return; }

      var speed = chunkSizeInBits / timeInSeconds / 1024;
      // console.log([timestampDifference, timeInSeconds, speed]);

      App.updateMeasurements(type, speed);
      App.setAverage(type);
    }

    App[type].lastBytesLoaded = bytesLoaded;
    App[type].lastTimestamp = timestamp;
  },

  updateMeasurements: function(type, speed) {
    var measurements = App.measurements[type];
    if (measurements.length >= 10) {
      measurements.shift();
    }
    measurements.push(speed);
  },

  setAverage: function(type) {
    var averageKey = (type === 'download' ? 'averageDown' : 'averageUp');
    App[averageKey] = parseInt(App.measurements[type].avg());
    App.ui.updateAverage(type, App[averageKey]);
  },

  // UI

  ui: {
    updateAverage: function(type, value) {
      $('#'+type+' .kbps .value').html( value.toString() );
    },

    hideStartButton: function() {
      $('button#start').hide();
    },

    showStartButton: function() {
      $('button#start').show();
    },

    clearProgressBars: function() {
      $('.progress').css('width', '100%');
    },

    startProgressBar: function(type) {
      var width = 100;

      doTimer(App.sampleTime, 20,
        function(steps) {
          width = width - (100 / steps);
          $('#'+type+' .progress').css('width', width.toString()+'%');
        },
        function() {
          $('#'+type+' .progress').css('width', '0');
        }
      );
    }
  }

};

$('button#start').on('click', App.startSpeedtest);
