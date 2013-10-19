Array.prototype.avg = function() {
  var av = 0;
  var cnt = 0;
  var len = this.length;
  for (var i = 0; i < len; i++) {
    var e = +this[i];
    if(!e && this[i] !== 0 && this[i] !== '0') e--;
    if (this[i] == e) {av += e; cnt++;}
  }
  return av/cnt;
};

var App = {

  averageDown: 0,
  averageUp: 0,
  measurements: {
    down: [],
    up: []
  },
  maxDownloads: 1,
  testfileSize: 5000, // in Bit

  averageSpeedDown: function() {
    var averageDownInSeconds = this.averageDown / 1000;

    var kbps = this.testfileSize / averageDownInSeconds / 1024;
    return kbps;
  },

  startSpeedtest: function() {
    App.ui.hideStartButton();

    App.downloadFiles();
  },

  downloadFiles: function() {
    var timer = 0;
    var startTimer = function() {
      setInterval(function(){
        timer += 10;
      }, 10);
    };

    var printProgress = function(ev) {
      console.log(ev);
    };

    $.ajax({
      type: 'GET',
      url: 'https://storage.5apps.com/basti/public/shares/131019-1308-testfile.txt',
      timeout: 20000,
      cache: false,
      beforeSend: function(xhr, settings) {
        startTimer();
        xhr.addEventListener('progress', printProgress, false);
      },
      success: function(data, status, xhr){
        var downloadTime = timer;

        App.measurements.down.push(timer);
        App.ui.updateMeasurements();

        App.setAverageDown(timer);
        // App.ui.updateAverageDown(App.averageDown);
      },
      error: function(xhr, errorType, error) {
        console.log('ERROR');
        console.log(errorType);
        console.log(error);
        // show error, nullify timer
      },
      complete: function() {
        if (App.measurements.down.length < App.maxDownloads) {
          App.downloadFiles();
        }
      }
    });
  },

  setAverageDown: function(milliseconds) {
    App.averageDown = App.measurements.down.avg();
    App.ui.updateAverageDown( App.averageSpeedDown() + ' Kb/s' );
  },

  // UI

  ui: {
    updateAverageDown: function(value) {
      $('#down').html( value.toString() );
    },

    hideStartButton: function() {
      $('button#start').hide();
    },

    showStartButton: function() {
      $('button#start').show();
    },

    updateTimer: function(time) {
      $('#timer').html( time.toString() + ' milliseconds' );
    },

    updateMeasurements: function() {
      $('#measurements').html( App.measurements.down.toString() );
    }
  }

};

$('button#start').on('click', App.startSpeedtest);
