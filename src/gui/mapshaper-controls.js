/* @require mapshaper-elements, textutils, mapshaper-shapefile */


var SimplifyControl = function() {
  var _value = 1;
  El('#g-simplify-control').show();
  var slider = new Slider("#g-simplify-control .g-slider");
  slider.handle("#g-simplify-control .g-handle");
  slider.track("#g-simplify-control .g-track");
  slider.on('change', function(e) {
    var pct = fromSliderPct(e.pct);
    text.value(pct);
    onchange(pct);
  });

  var text = new ClickText("#g-simplify-control .g-clicktext");
  text.bounds(0, 1);
  text.formatter(function(val) {
    if (isNaN(val)) return '-';

    var pct = val * 100;
    var decimals = 0;
    if (pct <= 0) decimals = 1;
    else if (pct < 0.001) decimals = 4;
    else if (pct < 0.01) decimals = 3;
    else if (pct < 1) decimals = 2;
    else if (pct < 100) decimals = 1;
    return Utils.formatNumber(pct, decimals) + "%";
  });

  text.parser(function(s) {
    return parseFloat(s) / 100;
  });

  text.value(0);
  text.on('change', function(e) {
    var pct = e.value;
    slider.pct(toSliderPct(pct));
    onchange(pct);
  });

  function toSliderPct(p) {
    p = Math.sqrt(p);
    var pct = 1 - p;
    return pct;
  }

  function fromSliderPct(p) {
    var pct = 1 - p;
    return pct * pct;
  }

  function onchange(val) {
    if (_value != val) {
      _value = val;
      control.dispatchEvent('change', {value:val});
    }
  }


  var control = new EventDispatcher();
  control.value = function(val) {
    if (!isNaN(val)) {
      // TODO: validate
      _value = val;
      slider.pct(toSliderPct(val));
      text.value(val);
    }
    return _value;
  };

  // init components
  control.value(_value);

  return control;
}

function ImportPanel(callback) {

  var shpBtn = new FileChooser('#g-shp-import-btn');
  shpBtn.on('select', function(e) {
    var reader = new FileReader(),
        file = e.file;
    reader.onload = function(e) {
      var shpData = MapShaper.importShp(reader.result);
      var opts = {
        input_file: file.name,
        keep_shapes: El("#g-import-retain-opt").el.checked,
        simplify_method: 'mod'
      };
      El("#mshp-intro-screen").hide();
      callback(shpData, opts)
    };
    reader.readAsArrayBuffer(file);
  })

  shpBtn.validator(function(file) {
    return /.shp$/.test(file.name);
  });

  // var nextBtn = new SimpleButton("#mshp-import .g-next-btn").active(false);
  // var cancelBtn = new SimpleButton("#g-import-panel .g-cancel-btn").active(false).on('click', cancel, this);
}

Opts.inherit(ImportPanel, EventDispatcher);


var controls = {
  Slider: Slider,
  Checkbox: Checkbox,
  SimplifyControl: SimplifyControl,
  ImportPanel: ImportPanel
};
