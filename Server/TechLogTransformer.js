/* jshint node: true*/
'use strict';
//--- Tech Log transformer -----------------------------------//
module.exports = {
    transformTechLog: function (file, callback) {
        var _tlConstants = new TlConstants();
        var _feedFile = file.split('\n');
        if (_feedFile.length <= 1) {
            callback(null, JSON.stringify(_tlConstants.getEmptyFile()));
        }
        else {
            transformTechLogFile(_feedFile, getTransformedTechLogData);
        }
        function getTransformedTechLogData(result, error) {
            if (!error) {
                callback(JSON.stringify(result));
            } else {
                callback(null, error);
            }
        }
    }
};

function transformTechLogFile(feedFile, callback) {
    var _transformedTechLog = new Object({});
    var _feedErrors = [];
    assignTechLogHeader(feedFile, _transformedTechLog, _feedErrors);
    assignTechLogReadings(feedFile, _transformedTechLog, _feedErrors);
    if (_feedErrors <= 0) {
        callback(_transformedTechLog);
    }
    else {
        callback(null, JSON.stringify(_feedErrors));
    }
}
function assignTechLogHeader(feedFile, transformedTechLog, feedErrors) {
    var _c = require('./TransformerCommon');
    var _tlConstants = new TlConstants();
    var _headerEndIndex = _c.getIndex(feedFile, _tlConstants.getItemHeader(), true);
    if (!_c.validate(_headerEndIndex, _tlConstants.getValidateValue(), _tlConstants.getMissingFeedData(), feedErrors)) { return; }
    var _hIndex = parseInt(_headerEndIndex) - 1;
    manageHeaderProperties(_hIndex, feedFile, transformedTechLog);
    _c.validate(transformedTechLog, _tlConstants.getValidateProperty(), _tlConstants.getMissingSerialNo(), feedErrors, _tlConstants.getSerialNumber());
}
function assignTechLogReadings(feedFile, transformedTechLog, feedErrors) {
    var _c = require('./TransformerCommon');
    if (feedErrors.length > 0) { return; }
    var _tlConstants = new TlConstants();
    var _feedIndexes = _c.getIndex(feedFile, _tlConstants.getItemHeader());
    if (!_c.validate(_feedIndexes, _tlConstants.getValidateValue(), _tlConstants.getMissingFeedData(), feedErrors)) { return; }
    var _feedResults = manageDataItemProperties(_feedIndexes, feedFile);
    if (!_c.validate(_feedResults, _tlConstants.getValidateValue(), _tlConstants.getMissingFeedData(), feedErrors)) { return; }
    transformedTechLog.feeds = _feedResults;
}
function manageHeaderProperties(hIndex, feedFile, transformedTechLog) {
    var _c = require('./TransformerCommon');
    var _tlConstants = new TlConstants();
    for (var _i = 0; _i < hIndex; _i++) {
        if (feedFile[_i].length > 1) {
            var searchCharacter = (feedFile[_i].search(_tlConstants.getColon()) > -1) ?
                _tlConstants.getColon() : _tlConstants.getEquals();
            var _index = feedFile[_i].search(searchCharacter);
            var _value = _c.formatString(feedFile[_i].substring(_index + 1));
            if (_value) {
                var _key = _c.formatString(feedFile[_i].substring(0, _index)).replace(/ /g, "_");
                transformedTechLog[_key] = _value;
            }
        }
    }
}
function manageDataItemProperties(feedIndexes, feedFile) {
    var _c = require('./TransformerCommon');
    var _results = [];
    var _tlConstants = new TlConstants();
    feedIndexes.forEach(function (elementIndex) {
        var _feedItem = new Object({});
        var _feeds = [];
        var _row = 0;
        for (var _i = elementIndex; _i < elementIndex + _tlConstants.getLength(); _i++) {
            if (_row === 0) {
                var _headerItems = feedFile[_i].split(",");
                if (_headerItems.length < 1) { break; }
                manageDataItemHeader(_headerItems, _feedItem);
            } else {
                var _feedDataResult = _c.getFileRows(feedFile[_i]);
                if (_feedDataResult.length <= 0) { break; }
                _feeds.push(_feedDataResult);
            }
            _row++;
        }
        _feedItem.feedData = manageDataItemReadings(_feeds);
        if (typeof _feedItem.feedData !== "undefined") {
            _results.push(_feedItem);
        }
    });
    return _results;
}
function manageDataItemHeader(headerItems, feedItem) {
    var _c = require('./TransformerCommon');
    var _tlConstants = new TlConstants();
    if (headerItems.length > 1) {
        feedItem[_tlConstants.getTimeStamp()] = _c.formatString(headerItems[1]);
    }
    if (headerItems.length > 2) {
        feedItem[_tlConstants.getPgaVersion()] = _c.formatString(headerItems[3]);
    }
}
function manageDataItemReadings(feeds) {
    var _c = require('./TransformerCommon');
    var _tlConstants = new TlConstants();
    if (feeds.length > 0) {
        var _feedArray = _c.reworkResult(feeds);
        var _result = [];
        _feedArray.forEach(function (element) {
            var _rowNo = 0;
            var _feed = new Object({});
            element.forEach(function (element) {
                var dataDescription = (_rowNo === 0) ? _tlConstants.getType() : _tlConstants.getReading() + _rowNo;
                _feed[dataDescription] = element;
                _rowNo++;
            });
            _result.push(_feed);
        });
        return _result;
    }
}
function TlConstants() {
    var _type = 'Type';
    this.getType = function () {
        return _type;
    };
    var _reading = 'Reading_';
    this.getReading = function () {
        return _reading;
    };
    var _length = 8;
    this.getLength = function () {
        return _length;
    };
    var _pgaVersion = 'Pga_Version_No';
    this.getPgaVersion = function () {
        return _pgaVersion;
    };
    var _timeStamp = 'Time_Stamp';
    this.getTimeStamp = function () {
        return _timeStamp;
    };
    var _colon = ':';
    this.getColon = function () {
        return _colon;
    };
    var _equals = '=';
    this.getEquals = function () {
        return _equals;
    };
    var _itemHeader = '^\/\/[ ]{1}[0-9]{3,4}';
    this.getItemHeader = function () {
        return _itemHeader;
    };
    var _serialNumber = 'SN';
    this.getSerialNumber = function () {
        return _serialNumber;
    };
    var _missingFeedData = 'Missing Tech Log feed data, please check the source file.';
    this.getMissingFeedData = function () {
        return _missingFeedData;
    };
    var _missingSerialNumber = 'Missing Tech Log serial number, please check the source file.';
    this.getMissingSerialNo = function () {
        return _missingSerialNumber;
    };
    var _emptyFile = 'There were no Tech Log records to process, please check the source file';
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