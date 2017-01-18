'use strict';
/* jshint node: true*/
module.exports = {
    formatString: function (str) {
        return (str.replace(/\//g, "")).trim();
    },

    getIndex: function (file, searchElement, takeTopOnly) {
        var result = [];
        var reg = new RegExp(searchElement);
        for (var el in file) {
            if (reg.test(file[el])) {
                result.push(el);
                if (takeTopOnly) { break; }
            }
        }
        return result;
    },

    reworkResult: function (a) {
        return Object.keys(a[0]).map(
            function (c) { return a.map(function (r) { return r[c]; }); }
        );
    },

    getFileRows: function (dataItems) {
        return dataItems.split(/(\s+)/).filter(function (entry) {
            return (entry.trim() !== "" && entry !== "//");
        });
    },
    
    validate: function TfDValidator(itemToValidate, valType, valError, feedErrors, property) {
        switch (valType) {
            case 1:
                if (!itemToValidate.hasOwnProperty(property)) {
                    feedErrors.push(valError);
                }
                return feedErrors.length === 0;
            default:
                if (itemToValidate.length < 1) {
                    feedErrors.push(valError);
                }
                return feedErrors.length === 0;
        }
    }
};


