/* jshint node: true*/
'use strict';
//--- Tfd transformer -----------------------------------//
module.exports = {
    transformTfd: function (file, callback) {
        var _feedFile = file.split('\n');
        if (_feedFile.length <= 1) {
            var _tfdConstants = new TfdConstants();
            callback(null, JSON.stringify(_tfdConstants.getEmptyFile()));
        }
        else {
            transformTfdFile(_feedFile, getTransformedTfdData);
        }
        function getTransformedTfdData(result, error) {
            if (!error) {
                callback(result);
            } else {
                callback(null, error);
            }
        }
    }
};

function transformTfdFile(feedFile, callback) {
    var _transformedTfd = new Object({});
    var _feedErrors = [];
    assignTfdHeader(feedFile, _transformedTfd, _feedErrors);
    assignTfdReadings(feedFile, _transformedTfd, _feedErrors);
    if (_feedErrors.length <= 0) {
        callback(JSON.stringify(_transformedTfd));
    }
    else {
        callback(null, JSON.stringify(_feedErrors));
    }
}
function assignTfdHeader(feedFile, transformedTfd, feedErrors) {
    var _tfdConstants = new TfdConstants();
    var _c = require('./TransformerCommon');
    var _snIndex = _c.getIndex(feedFile, _tfdConstants.getSN(), true);
    if (!_c.validate(_snIndex, _tfdConstants.getValidateValue(), _tfdConstants.getMissingSnNo(), feedErrors)) { return; }
    var _charIndex = feedFile[_snIndex].search(_tfdConstants.getEquals());
    var _serialNo = _c.formatString(feedFile[_snIndex].substring(_charIndex + 1));
    if (!_c.validate(_serialNo, _tfdConstants.getValidateValue(), _tfdConstants.getMissingSnNo(), feedErrors)) { return; }
    transformedTfd[_tfdConstants.getSerialNumber] = _serialNo;
}
function assignTfdReadings(feedFile, transformedTfd, feedErrors) {
    var _tfdConstants = new TfdConstants();
    var _c = require('./TransformerCommon');
    if (feedErrors.length > 0) { return; }
    var _tfdReadings = [];
    var _tfdDataIndex = _c.getIndex(feedFile, _tfdConstants.getData(), true);
    if (!_c.validate(_tfdDataIndex, _tfdConstants.getValidateValue(), _tfdConstants.getMissingData(), feedErrors)) { return; }
    var _index = parseInt(_tfdDataIndex) + 1;
    for (var _i = _index; _i < feedFile.length; _i++) {
        if (feedFile[_i].length > 1) {
            var _items = feedFile[_i].split(",");
            if (_items.length > _tfdConstants.getDrainTachoIndex()) {
                var _tfdObject = new Object({});
                _tfdObject[_tfdConstants.getTimeStamp()] = _items[_tfdConstants.getTimeStampIndex()];
                _tfdObject[_tfdConstants.getFillTachoCount()] = _items[_tfdConstants.getFillTachoIndex()];
                _tfdObject[_tfdConstants.getDrainTachoCount()] = _items[_tfdConstants.getDrainTachoIndex()];
                _tfdReadings.push(_tfdObject);
            }
        }
    }
    if (!_c.validate(_tfdReadings, _tfdConstants.getValidateValue(), _tfdConstants.getMissingData(), feedErrors)) { return; }
    transformedTfd[_tfdConstants.getReadings()] = _tfdReadings;
}

function TfdConstants() {
    var _readings = 'Readings';
    this.getReadings = function () {
        return _readings;
    };
    var _fillTachoCount = 'Fill_Tacho_Count';
    this.getFillTachoCount = function () {
        return _fillTachoCount;
    };
    var _drainTachoCount = 'Drain_Tacho_Count';
    this.getDrainTachoCount = function () {
        return _drainTachoCount;
    };
    var _timeStampIndex = 0;
    this.getTimeStampIndex = function () {
        return _timeStampIndex;
    };
    var _fillTachoIndex = 29;
    this.getFillTachoIndex = function () {
        return _fillTachoIndex;
    };
    var _drainTachoIndex = 30;
    this.getDrainTachoIndex = function () {
        return _drainTachoIndex;
    };
    var _timeStamp = 'Time_Stamp';
    this.getTimeStamp = function () {
        return _timeStamp;
    };
    var _serialNumber = 'Serial_Number';
    this.getSerialNumber = function () {
        return _serialNumber;
    };
    var _equals = '=';
    this.getEquals = function () {
        return _equals;
    };
    var _sn = 'SN=';
    this.getSN = function () {
        return _sn;
    };
    var _data = '^\\[Data\\]';
    this.getData = function () {
        return _data;
    };
    var _missingData = 'Missing feed data, please check the source file.';
    this.getMissingData = function () {
        return _missingData;
    };
    var _missingSnNo = 'Missing Tfd serial number, please check the source file.';
    this.getMissingSnNo = function () {
        return _missingSnNo;
    };
    var _emptyFile = 'There were no records to process, please check the source file.';
    this.getEmptyFile = function () {
        return _emptyFile;
    };
    var _validateValue = 0;
    this.getValidateValue = function () {
        return _validateValue;
    };
    var _validateProperty = 1;
    this.getValidateProperty = function () {
        return _validateProperty;
    };
}

