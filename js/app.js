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
  measurements: [],
  maxDownloads: 50,

  startSpeedtest: function() {
    App.ui.hideStartButton();

    App.downloadFile();

    App.finishSpeedTest();
  },

  downloadFile: function() {
    var timer = 0;
    var startTimer = function() {
      setInterval(function(){
        timer += 10;
      }, 10);
    };

    $.ajax({
      type: 'GET',
      url: 'https://storage.5apps.com/basti/public/sharedy/images/130213-210916-Screen%20Shot%202013-02-13%20at%209.08.16%20PM.png',
      timeout: 20000,
      cache: false,
      beforeSend: function(xhr, settings) {
        startTimer();
      },
      success: function(data, status, xhr){
        var downloadTime = timer;
        App.measurements.push(timer);

        App.ui.updateMeasurements();
        App.ui.updateAverageDown( App.measurements.avg() );

        if (App.measurements.length < App.maxDownloads) {
          App.downloadFile();
        }
      },
      error: function(xhr, errorType, error) {
        console.log('ERROR');
        console.log(errorType);
        console.log(error);
        // show error, nullify timer
      }
    });
  },

  setAverages: function() {
    // calculate average from this.measurements
  },

  finishSpeedTest: function() {
    App.ui.showStartButton();
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
      $('#measurements').html( App.measurements.toString() );
    }
  }

};

$('button#start').on('click', App.startSpeedtest);


