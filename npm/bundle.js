(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.natural = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = require('util'),
Classifier = require('./classifier');

var BayesClassifier = function(smoothing) {
    Classifier.call(this);
    this.classFeatures = {};
    this.classTotals = {};
    this.totalExamples = 1; // start at one to smooth
    this.smoothing = smoothing === undefined ? 1.0 : smoothing;
};

util.inherits(BayesClassifier, Classifier);

function addExample(observation, label) {
    if(!this.classFeatures[label]) {
        this.classFeatures[label] = {};
        this.classTotals[label] = 1; // give an extra for smoothing
    }

    if(observation instanceof Array) {
        var i = observation.length;
        this.totalExamples++;
        this.classTotals[label]++;

        while(i--) {
            if(observation[i]) {
                if(this.classFeatures[label][i]) {
                    this.classFeatures[label][i]++;
                } else {
                    // give an extra for smoothing
                    this.classFeatures[label][i] = 1 + this.smoothing;
                }
            }
        }
    } else {
        // sparse observation
        for(var key in observation){
            value = observation[key];

            if(this.classFeatures[label][value]) {
               this.classFeatures[label][value]++;
            } else {
                // give an extra for smoothing
               this.classFeatures[label][value] = 1 + this.smoothing;
            }
        }
    }
}

function train() {

}

function probabilityOfClass(observation, label) {
    var prob = 0;

    if(observation instanceof Array){
        var i = observation.length;

        while(i--) {
            if(observation[i]) {
                var count = this.classFeatures[label][i] || this.smoothing;
                // numbers are tiny, add logs rather than take product
                prob += Math.log(count / this.classTotals[label]);
            }
        }
    } else {
        // sparse observation
        for(var key in observation){
            var count = this.classFeatures[label][observation[key]] || this.smoothing;
            // numbers are tiny, add logs rather than take product
            prob += Math.log(count / this.classTotals[label]);
        }
    }

    // p(C) * unlogging the above calculation P(X|C)
    prob = (this.classTotals[label] / this.totalExamples) * Math.exp(prob);

    return prob;
}

function getClassifications(observation) {
    var classifier = this;
    var labels = [];

    for(var className in this.classFeatures) {
        labels.push({label: className,
        value: classifier.probabilityOfClass(observation, className)});
    }

    return labels.sort(function(x, y) {
        return y.value - x.value;
    });
}

function restore(classifier) {
     classifier = Classifier.restore(classifier);
     classifier.__proto__ = BayesClassifier.prototype;

     return classifier;
}

BayesClassifier.prototype.addExample = addExample;
BayesClassifier.prototype.train = train;
BayesClassifier.prototype.getClassifications = getClassifications;
BayesClassifier.prototype.probabilityOfClass = probabilityOfClass;

BayesClassifier.restore = restore;

module.exports = BayesClassifier;
},{"./classifier":2,"util":140}],2:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function Classifier() {
}

function restore(classifier) {
    classifier = typeof classifier == 'string' ?  JSON.parse(classifier) : classifier;

    return classifier;
}

function addExample(observation, classification) {
    throw 'Not implemented';
}

function classify(observation) {
	var classifications = this.getClassifications(observation);
	if(!classifications || classifications.length === 0) {
		throw "Not Trained";
	} 
    return this.getClassifications(observation)[0].label;
}

function train() {
    throw 'Not implemented';
}

Classifier.prototype.addExample = addExample;
Classifier.prototype.train = train;
Classifier.prototype.classify = classify;

Classifier.restore = restore;

module.exports = Classifier;

},{}],3:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = require('util'),
     Classifier = require('./classifier');

var sylvester = require('sylvester'),
Matrix = sylvester.Matrix,
Vector = sylvester.Vector;

function sigmoid(z) {
    return 1 / (1 + Math.exp(0 - z));
}

function hypothesis(theta, Observations) {
    return Observations.x(theta).map(sigmoid);
}

function cost(theta, Examples, classifications) {
    var hypothesisResult = hypothesis(theta, Examples);

    var ones = Vector.One(Examples.rows());
    var cost_1 = Vector.Zero(Examples.rows()).subtract(classifications).elementMultiply(hypothesisResult.log());
    var cost_0 = ones.subtract(classifications).elementMultiply(ones.subtract(hypothesisResult).log());

    return (1 / Examples.rows()) * cost_1.subtract(cost_0).sum();
}

function descendGradient(theta, Examples, classifications) {
    var maxIt = 500 * Examples.rows();
    var last;
    var current;
    var learningRate = 3;
    var learningRateFound = false;

    Examples = Matrix.One(Examples.rows(), 1).augment(Examples);
    theta = theta.augment([0]);

    while(!learningRateFound) {
        var i = 0;
        last = null;

        while(true) {
            var hypothesisResult = hypothesis(theta, Examples);
            theta = theta.subtract(Examples.transpose().x(
            hypothesisResult.subtract(classifications)).x(1 / Examples.rows()).x(learningRate));
            current = cost(theta, Examples, classifications);

            i++;

            if(last) {
            if(current < last)
                learningRateFound = true;
            else
                break;

            if(last - current < 0.0001)
                break;
            }

            if(i >= maxIt) {
                throw 'unable to find minimum';
            }

            last = current;
        }

        learningRate /= 3;
    }

    return theta.chomp(1);
}

var LogisticRegressionClassifier = function() {
    Classifier.call(this);
    this.examples = {};
    this.features = [];
    this.featurePositions = {};
    this.maxFeaturePosition = 0;
    this.classifications = [];
    this.exampleCount = 0;
};

util.inherits(LogisticRegressionClassifier, Classifier);

function createClassifications() {
    var classifications = [];

    for(var i = 0; i < this.exampleCount; i++) {
        var classification = [];

        for(var _ in this.examples) {
            classification.push(0);
        }

       classifications.push(classification);
    }

    return classifications;
}

function computeThetas(Examples, Classifications) {
    this.theta = [];

    // each class will have it's own theta.
    var zero = function() { return 0; };
    for(var i = 1; i <= this.classifications.length; i++) {
        var theta = Examples.row(1).map(zero);
        this.theta.push(descendGradient(theta, Examples, Classifications.column(i)));
    }
}

function train() {
    var examples = [];
    var classifications = this.createClassifications();
    var d = 0, c = 0;

    for(var classification in this.examples) {
        for(var i = 0; i < this.examples[classification].length; i++) {
            var doc = this.examples[classification][i];
            var example = doc;

            examples.push(example);
            classifications[d][c] = 1;
            d++;
        }

        c++;
    }

    this.computeThetas($M(examples), $M(classifications));
}

function addExample(data, classification) {
    if(!this.examples[classification]) {
	this.examples[classification] = [];
	this.classifications.push(classification);
    }

    this.examples[classification].push(data);
    this.exampleCount++;
}

function getClassifications(observation) {
    observation = $V(observation);
    var classifications = [];

    for(var i = 0; i < this.theta.length; i++) {
        classifications.push({label: this.classifications[i], value: sigmoid(observation.dot(this.theta[i])) });
    }

    return classifications.sort(function(x, y) {
        return y.value - x.value;
    });
}

function restore(classifier) {
    classifier = Classifier.restore(classifier);
    classifier.__proto__ = LogisticRegressionClassifier.prototype;

    return classifier;
}

LogisticRegressionClassifier.prototype.addExample = addExample;
LogisticRegressionClassifier.prototype.restore = restore;
LogisticRegressionClassifier.prototype.train = train;
LogisticRegressionClassifier.prototype.createClassifications = createClassifications;
LogisticRegressionClassifier.prototype.computeThetas = computeThetas;
LogisticRegressionClassifier.prototype.getClassifications = getClassifications;

LogisticRegressionClassifier.restore = restore;

module.exports = LogisticRegressionClassifier;

},{"./classifier":2,"sylvester":130,"util":140}],4:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Sylvester = require('sylvester'),
Matrix = Sylvester.Matrix,
Vector = Sylvester.Vector;

function KMeans(Observations) {
    if(!Observations.elements)
    Observations = $M(Observations);

    this.Observations = Observations;
}

// create an initial centroid matrix with initial values between
// 0 and the max of feature data X.
function createCentroids(k) {
    var Centroid = [];
    var maxes = this.Observations.maxColumns();
    //console.log(maxes);

    for(var i = 1; i <= k; i++) {
        var centroid = [];
        for(var j = 1; j <= this.Observations.cols(); j++) {
            centroid.push(Math.random() * maxes.e(j));
        }

        Centroid.push(centroid);
    }

    //console.log(centroid)

    return $M(Centroid);
}

// get the euclidian distance between the feature data X and
// a given centroid matrix C.
function distanceFrom(Centroids) {
    var distances = [];

    for(var i = 1; i <= this.Observations.rows(); i++) {
        var distance = [];

        for(var j = 1; j <= Centroids.rows(); j++) {
            distance.push(this.Observations.row(i).distanceFrom(Centroids.row(j)));
        }

        distances.push(distance);
    }

    return $M(distances);
}

// categorize the feature data X into k clusters. return a vector
// containing the results.
function cluster(k) {
    var Centroids = this.createCentroids(k);
    var LastDistances = Matrix.Zero(this.Observations.rows(), this.Observations.cols());
    var Distances = this.distanceFrom(Centroids);
    var Groups;

    while(!(LastDistances.eql(Distances))) {
    Groups = Distances.minColumnIndexes();
    LastDistances = Distances;

    var newCentroids = [];

    for(var i = 1; i <= Centroids.rows(); i++) {
        var centroid = [];

        for(var j = 1; j <= Centroids.cols(); j++) {
        var sum = 0;
        var count = 0;

        for(var l = 1; l <= this.Observations.rows(); l++) {
            if(Groups.e(l) == i) {
            count++;
            sum += this.Observations.e(l, j);
            }
        }

        centroid.push(sum / count);
        }

        newCentroids.push(centroid);
    }

    Centroids = $M(newCentroids);
    Distances = this.distanceFrom(Centroids);
    }

    return Groups;
}

KMeans.prototype.createCentroids = createCentroids;
KMeans.prototype.distanceFrom = distanceFrom;
KMeans.prototype.cluster = cluster;

module.exports = KMeans;

},{"sylvester":130}],5:[function(require,module,exports){

exports.BayesClassifier = require('./classifier/bayes_classifier');
exports.LogisticRegressionClassifier = require('./classifier/logistic_regression_classifier');
exports.KMeans = require('./clusterer/kmeans');

},{"./classifier/bayes_classifier":1,"./classifier/logistic_regression_classifier":3,"./clusterer/kmeans":4}],6:[function(require,module,exports){
(function (global){
'use strict';

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"util/":140}],7:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],8:[function(require,module,exports){
(function (process,__filename){

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

}).call(this,require('_process'),"/node_modules/bindings/bindings.js")
},{"_process":127,"fs":9,"path":126}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

},{"base64-js":7,"ieee754":27}],11:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":12,"_process":127}],12:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":32}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],14:[function(require,module,exports){
(function (process,Buffer){

/**
 * Module dependencies.
 */

var assert = require('assert')
  , debug = require('debug')('ffi:_ForeignFunction')
  , ref = require('ref')
  , bindings = require('./bindings')
  , POINTER_SIZE = ref.sizeof.pointer
  , FFI_ARG_SIZE = bindings.FFI_ARG_SIZE


function ForeignFunction (cif, funcPtr, returnType, argTypes) {
  debug('creating new ForeignFunction', funcPtr)

  var numArgs = argTypes.length
  var argsArraySize = numArgs * POINTER_SIZE

  // "result" must point to storage that is sizeof(long) or larger. For smaller
  // return value sizes, the ffi_arg or ffi_sarg integral type must be used to
  // hold the return value
  var resultSize = returnType.size >= ref.sizeof.long ? returnType.size : FFI_ARG_SIZE
  assert(resultSize > 0)

  /**
   * This is the actual JS function that gets returned.
   * It handles marshalling input arguments into C values,
   * and unmarshalling the return value back into a JS value
   */

  var proxy = function () {
    debug('invoking proxy function')

    if (arguments.length !== numArgs) {
      throw new TypeError('Expected ' + numArgs +
          ' arguments, got ' + arguments.length)
    }

    // storage buffers for input arguments and the return value
    var result = new Buffer(resultSize)
      , argsList = new Buffer(argsArraySize)

    // write arguments to storage areas
    var i, argType, val, valPtr
    try {
      for (i = 0; i < numArgs; i++) {
        argType = argTypes[i]
        val = arguments[i]
        valPtr = ref.alloc(argType, val)
        argsList.writePointer(valPtr, i * POINTER_SIZE)
      }
    } catch (e) {
      e.message = 'error setting argument ' + i + ' - ' + e.message
      throw e
    }

    // invoke the `ffi_call()` function
    bindings.ffi_call(cif, funcPtr, result, argsList)

    result.type = returnType
    return result.deref()
  }

  /**
   * The asynchronous version of the proxy function.
   */

  proxy.async = function () {
    debug('invoking async proxy function')

    var argc = arguments.length
    if (argc !== numArgs + 1) {
      throw new TypeError('Expected ' + (numArgs + 1) +
          ' arguments, got ' + argc)
    }

    var callback = arguments[argc - 1]
    if (typeof callback !== 'function') {
      throw new TypeError('Expected a callback function as argument number: ' +
          (argc - 1))
    }

    // storage buffers for input arguments and the return value
    var result = new Buffer(resultSize)
    var argsList = new Buffer(argsArraySize)

    // write arguments to storage areas
    var i, argType, val, valPtr
    try {
      for (i = 0; i < numArgs; i++) {
        argType = argTypes[i]
        val = arguments[i]
        valPtr = ref.alloc(argType, val)
        argsList.writePointer(valPtr, i * POINTER_SIZE)
      }
    } catch (e) {
      e.message = 'error setting argument ' + i + ' - ' + e.message
      return process.nextTick(callback.bind(null, e));
    }

    // invoke the `ffi_call()` function asynchronously
    bindings.ffi_call_async(cif, funcPtr, result, argsList, function (err) {
      // make sure that the 4 Buffers passed in above don't get GC'd while we're
      // doing work on the thread pool...
      cif = cif;
      funcPtr = funcPtr;
      argsList = argsList;

      // now invoke the user-provided callback function
      if (err) {
        callback(err)
      } else {
        result.type = returnType
        callback(null, result.deref())
      }
    })
  }

  return proxy
}
module.exports = ForeignFunction

}).call(this,require('_process'),require("buffer").Buffer)
},{"./bindings":15,"_process":127,"assert":6,"buffer":10,"debug":11,"ref":129}],15:[function(require,module,exports){

module.exports = require('bindings')('ffi_bindings.node')

},{"bindings":8}],16:[function(require,module,exports){
(function (process){

/**
 * Module dependencies.
 */

var ref = require('ref')
  , CIF = require('./cif')
  , assert = require('assert')
  , debug = require('debug')('ffi:Callback')
  , _Callback = require('./bindings').Callback

// Function used to report errors to the current process event loop,
// When user callback function gets gced.
function errorReportCallback (err) {
  if (err) {
    process.nextTick(function () {
      if (typeof err === 'string') {
        throw new Error(err)
      } else {
        throw err
      }
    })
  }
}

/**
 * Turns a JavaScript function into a C function pointer.
 * The function pointer may be used in other C functions that
 * accept C callback functions.
 */

function Callback (retType, argTypes, abi, func) {
  debug('creating new Callback')

  if (typeof abi === 'function') {
    func = abi
    abi = void(0)
  }

  // check args
  assert(!!retType, 'expected a return "type" object as the first argument')
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the second argument')
  assert.equal(typeof func, 'function', 'expected a function as the third argument')

  // normalize the "types" (they could be strings, so turn into real type
  // instances)
  retType = ref.coerceType(retType)
  argTypes = argTypes.map(ref.coerceType)

  // create the `ffi_cif *` instance
  var cif = CIF(retType, argTypes, abi)
  var argc = argTypes.length

  var callback = _Callback(cif, retType.size, argc, errorReportCallback, function (retval, params) {
    debug('Callback function being invoked')
    try {
      var args = []
      for (var i = 0; i < argc; i++) {
        var type = argTypes[ i ]
        var argPtr = params.readPointer(i * ref.sizeof.pointer, type.size)
        argPtr.type = type
        args.push(argPtr.deref())
      }

      // Invoke the user-given function
      var result = func.apply(null, args)
      try {
        ref.set(retval, 0, result, retType)
      } catch (e) {
        e.message = 'error setting return value - ' + e.message
        throw e
      }
    } catch (e) {
      return e
    }
  })

  // store reference to the CIF Buffer so that it doesn't get
  // garbage collected before the callback Buffer does
  callback._cif = cif;

  return callback
}
module.exports = Callback

}).call(this,require('_process'))
},{"./bindings":15,"./cif":17,"_process":127,"assert":6,"debug":11,"ref":129}],17:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var Type = require('./type')
  , assert = require('assert')
  , debug = require('debug')('ffi:cif')
  , ref = require('ref')
  , bindings = require('./bindings')
  , POINTER_SIZE = ref.sizeof.pointer
  , ffi_prep_cif = bindings.ffi_prep_cif
  , FFI_CIF_SIZE = bindings.FFI_CIF_SIZE
  , FFI_DEFAULT_ABI = bindings.FFI_DEFAULT_ABI
  // status codes
  , FFI_OK = bindings.FFI_OK
  , FFI_BAD_TYPEDEF = bindings.FFI_BAD_TYPEDEF
  , FFI_BAD_ABI = bindings.FFI_BAD_ABI

/**
 * JS wrapper for the `ffi_prep_cif` function.
 * Returns a Buffer instance representing a `ffi_cif *` instance.
 */

function CIF (rtype, types, abi) {
  debug('creating `ffi_cif *` instance')

  // the return and arg types are expected to be coerced at this point...
  assert(!!rtype, 'expected a return "type" object as the first argument')
  assert(Array.isArray(types), 'expected an Array of arg "type" objects as the second argument')

  // the buffer that will contain the return `ffi_cif *` instance
  var cif = new Buffer(FFI_CIF_SIZE)

  var numArgs = types.length
  var _argtypesptr = new Buffer(numArgs * POINTER_SIZE)
  var _rtypeptr = Type(rtype)

  for (var i = 0; i < numArgs; i++) {
    var type = types[i]
    var ffiType = Type(type)

    _argtypesptr.writePointer(ffiType, i * POINTER_SIZE)
  }

  // prevent GC of the arg type and rtn type buffers (not sure if this is required)
  cif.rtnTypePtr = _rtypeptr
  cif.argTypesPtr = _argtypesptr

  if (typeof abi === 'undefined') {
    debug('no ABI specified (this is OK), using FFI_DEFAULT_ABI')
    abi = FFI_DEFAULT_ABI
  }

  var status = ffi_prep_cif(cif, numArgs, _rtypeptr, _argtypesptr, abi)

  if (status !== FFI_OK) {
    switch (status) {
      case FFI_BAD_TYPEDEF:
        var err = new Error('ffi_prep_cif() returned an FFI_BAD_TYPEDEF error')
        err.code = 'FFI_BAD_TYPEDEF'
        err.errno = status
        throw err
        break;
      case FFI_BAD_ABI:
        var err = new Error('ffi_prep_cif() returned an FFI_BAD_ABI error')
        err.code = 'FFI_BAD_ABI'
        err.errno = status
        throw err
        break;
      default:
        throw new Error('ffi_prep_cif() returned an error: ' + status)
        break;
    }
  }

  return cif
}
module.exports = CIF

}).call(this,require("buffer").Buffer)
},{"./bindings":15,"./type":26,"assert":6,"buffer":10,"debug":11,"ref":129}],18:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var Type = require('./type')
  , assert = require('assert')
  , debug = require('debug')('ffi:cif_var')
  , ref = require('ref')
  , bindings = require('./bindings')
  , POINTER_SIZE = ref.sizeof.pointer
  , ffi_prep_cif_var = bindings.ffi_prep_cif_var
  , FFI_CIF_SIZE = bindings.FFI_CIF_SIZE
  , FFI_DEFAULT_ABI = bindings.FFI_DEFAULT_ABI
  // status codes
  , FFI_OK = bindings.FFI_OK
  , FFI_BAD_TYPEDEF = bindings.FFI_BAD_TYPEDEF
  , FFI_BAD_ABI = bindings.FFI_BAD_ABI

/**
 * JS wrapper for the `ffi_prep_cif_var` function.
 * Returns a Buffer instance representing a variadic `ffi_cif *` instance.
 */

function CIF_var (rtype, types, numFixedArgs, abi) {
  debug('creating `ffi_cif *` instance with `ffi_prep_cif_var()`')

  // the return and arg types are expected to be coerced at this point...
  assert(!!rtype, 'expected a return "type" object as the first argument')
  assert(Array.isArray(types), 'expected an Array of arg "type" objects as the second argument')
  assert(numFixedArgs >= 1, 'expected the number of fixed arguments to be at least 1')

  // the buffer that will contain the return `ffi_cif *` instance
  var cif = new Buffer(FFI_CIF_SIZE)

  var numTotalArgs = types.length
  var _argtypesptr = new Buffer(numTotalArgs * POINTER_SIZE)
  var _rtypeptr = Type(rtype)

  for (var i = 0; i < numTotalArgs; i++) {
    var ffiType = Type(types[i])
    _argtypesptr.writePointer(ffiType, i * POINTER_SIZE)
  }

  // prevent GC of the arg type and rtn type buffers (not sure if this is required)
  cif.rtnTypePtr = _rtypeptr
  cif.argTypesPtr = _argtypesptr

  if (typeof abi === 'undefined') {
    debug('no ABI specified (this is OK), using FFI_DEFAULT_ABI')
    abi = FFI_DEFAULT_ABI
  }

  var status = ffi_prep_cif_var(cif, numFixedArgs, numTotalArgs, _rtypeptr, _argtypesptr, abi)

  if (status !== FFI_OK) {
    switch (status) {
      case FFI_BAD_TYPEDEF:
        var err = new Error('ffi_prep_cif_var() returned an FFI_BAD_TYPEDEF error')
        err.code = 'FFI_BAD_TYPEDEF'
        err.errno = status
        throw err
        break;
      case FFI_BAD_ABI:
        var err = new Error('ffi_prep_cif_var() returned an FFI_BAD_ABI error')
        err.code = 'FFI_BAD_ABI'
        err.errno = status
        throw err
        break;
      default:
        var err = new Error('ffi_prep_cif_var() returned an error: ' + status)
        err.errno = status
        throw err
        break;
    }
  }

  return cif
}
module.exports = CIF_var

}).call(this,require("buffer").Buffer)
},{"./bindings":15,"./type":26,"assert":6,"buffer":10,"debug":11,"ref":129}],19:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var ForeignFunction = require('./foreign_function')
  , assert = require('assert')
  , debug = require('debug')('ffi:DynamicLibrary')
  , bindings = require('./bindings')
  , funcs = bindings.StaticFunctions
  , ref = require('ref')
  , read  = require('fs').readFileSync

// typedefs
var int = ref.types.int
  , voidPtr = ref.refType(ref.types.void)

var dlopen  = ForeignFunction(funcs.dlopen,  voidPtr, [ 'string', int ])
  , dlclose = ForeignFunction(funcs.dlclose, int,     [ voidPtr ])
  , dlsym   = ForeignFunction(funcs.dlsym,   voidPtr, [ voidPtr, 'string' ])
  , dlerror = ForeignFunction(funcs.dlerror, 'string', [ ])

/**
 * `DynamicLibrary` loads and fetches function pointers for dynamic libraries
 * (.so, .dylib, etc). After the libray's function pointer is acquired, then you
 * call `get(symbol)` to retreive a pointer to an exported symbol. You need to
 * call `get___()` on the pointer to dereference it into its actual value, or
 * turn the pointer into a callable function with `ForeignFunction`.
 */

function DynamicLibrary (path, mode) {
  if (!(this instanceof DynamicLibrary)) {
    return new DynamicLibrary(path, mode)
  }
  debug('new DynamicLibrary()', path, mode)

  if (null == mode) {
    mode = DynamicLibrary.FLAGS.RTLD_LAZY
  }

  this._handle = dlopen(path, mode)
  assert(Buffer.isBuffer(this._handle), 'expected a Buffer instance to be returned from `dlopen()`')

  if (this._handle.isNull()) {
    var err = this.error()

    // THIS CODE IS BASED ON GHC Trac ticket #2615
    // http://hackage.haskell.org/trac/ghc/attachment/ticket/2615

    // On some systems (e.g., Gentoo Linux) dynamic files (e.g. libc.so)
    // contain linker scripts rather than ELF-format object code. This
    // code handles the situation by recognizing the real object code
    // file name given in the linker script.

    // If an "invalid ELF header" error occurs, it is assumed that the
    // .so file contains a linker script instead of ELF object code.
    // In this case, the code looks for the GROUP ( ... ) linker
    // directive. If one is found, the first file name inside the
    // parentheses is treated as the name of a dynamic library and the
    // code attempts to dlopen that file. If this is also unsuccessful,
    // an error message is returned.

    // see if the error message is due to an invalid ELF header
    var match

    if (match = err.match(/^(([^ \t()])+\.so([^ \t:()])*):([ \t])*/)) {
      var content = read(match[1], 'ascii')
      // try to find a GROUP ( ... ) command
      if (match = content.match(/GROUP *\( *(([^ )])+)/)){
        return DynamicLibrary.call(this, match[1], mode)
      }
    }

    throw new Error('Dynamic Linking Error: ' + err)
  }
}
module.exports = DynamicLibrary

/**
 * Set the exported flags from "dlfcn.h"
 */

DynamicLibrary.FLAGS = {};
Object.keys(bindings).forEach(function (k) {
  if (!/^RTLD_/.test(k)) return;
  var desc = Object.getOwnPropertyDescriptor(bindings, k)
  Object.defineProperty(DynamicLibrary.FLAGS, k, desc)
});


/**
 * Close this library, returns the result of the dlclose() system function.
 */

DynamicLibrary.prototype.close = function () {
  debug('dlclose()')
  return dlclose(this._handle)
}

/**
 * Get a symbol from this library, returns a Pointer for (memory address of) the symbol
 */

DynamicLibrary.prototype.get = function (symbol) {
  debug('dlsym()', symbol)
  assert.equal('string', typeof symbol)

  var ptr = dlsym(this._handle, symbol)
  assert(Buffer.isBuffer(ptr))

  if (ptr.isNull()) {
    throw new Error('Dynamic Symbol Retrieval Error: ' + this.error())
  }

  ptr.name = symbol

  return ptr
}

/**
 * Returns the result of the dlerror() system function
 */

DynamicLibrary.prototype.error = function error () {
  debug('dlerror()')
  return dlerror()
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":28,"./bindings":15,"./foreign_function":22,"assert":6,"debug":11,"fs":9,"ref":129}],20:[function(require,module,exports){
(function (process){
var DynamicLibrary = require('./dynamic_library')
  , ForeignFunction = require('./foreign_function')
  , bindings = require('./bindings')
  , funcs = bindings.StaticFunctions
  , ref = require('ref')
  , int = ref.types.int
  , intPtr = ref.refType(int)
  , errno = null

if (process.platform == 'win32') {
  var _errno = DynamicLibrary('msvcrt.dll').get('_errno')
  var errnoPtr = ForeignFunction(_errno, intPtr, [])
  errno = function() {
    return errnoPtr().deref()
  }
} else {
  errno = ForeignFunction(funcs._errno, 'int', [])
}


module.exports = errno

}).call(this,require('_process'))
},{"./bindings":15,"./dynamic_library":19,"./foreign_function":22,"_process":127,"ref":129}],21:[function(require,module,exports){

/**
 * Module dependencies.
 */

var ref = require('ref')
var assert = require('assert')
var debug = require('debug')('ffi:ffi')
var Struct = require('ref-struct')
var bindings = require('./bindings')

/**
 * Export some of the properties from the "bindings" file.
 */

;['HAS_OBJC', 'FFI_TYPES',
, 'FFI_OK', 'FFI_BAD_TYPEDEF', 'FFI_BAD_ABI'
, 'FFI_DEFAULT_ABI', 'FFI_FIRST_ABI', 'FFI_LAST_ABI', 'FFI_SYSV', 'FFI_UNIX64'
, 'FFI_WIN64', 'FFI_VFP', 'FFI_STDCALL', 'FFI_THISCALL', 'FFI_FASTCALL'
, 'RTLD_LAZY', 'RTLD_NOW', 'RTLD_LOCAL', 'RTLD_GLOBAL', 'RTLD_NOLOAD'
, 'RTLD_NODELETE', 'RTLD_FIRST', 'RTLD_NEXT', 'RTLD_DEFAULT', 'RTLD_SELF'
, 'RTLD_MAIN_ONLY', 'FFI_MS_CDECL'].forEach(function (prop) {
  if (!bindings.hasOwnProperty(prop)) {
    return debug('skipping exporting of non-existant property', prop)
  }
  var desc = Object.getOwnPropertyDescriptor(bindings, prop)
  Object.defineProperty(exports, prop, desc)
})

/**
 * Set the `ffi_type` property on the built-in types.
 */

Object.keys(bindings.FFI_TYPES).forEach(function (name) {
  var type = bindings.FFI_TYPES[name]
  type.name = name
  if (name === 'pointer') return // there is no "pointer" type...
  ref.types[name].ffi_type = type
})

// make `size_t` use the "ffi_type_pointer"
ref.types.size_t.ffi_type = bindings.FFI_TYPES.pointer

// make `Utf8String` use "ffi_type_pointer"
var CString = ref.types.CString || ref.types.Utf8String
CString.ffi_type = bindings.FFI_TYPES.pointer

// make `Object` use the "ffi_type_pointer"
ref.types.Object.ffi_type = bindings.FFI_TYPES.pointer


// libffi is weird when it comes to long data types (defaults to 64-bit),
// so we emulate here, since some platforms have 32-bit longs and some
// platforms have 64-bit longs.
switch (ref.sizeof.long) {
  case 4:
    ref.types.ulong.ffi_type = bindings.FFI_TYPES.uint32
    ref.types.long.ffi_type = bindings.FFI_TYPES.int32
    break;
  case 8:
    ref.types.ulong.ffi_type = bindings.FFI_TYPES.uint64
    ref.types.long.ffi_type = bindings.FFI_TYPES.int64
    break;
  default:
    throw new Error('unsupported "long" size: ' + ref.sizeof.long)
}

/**
 * Alias the "ref" types onto ffi's exports, for convenience...
 */

exports.types = ref.types

// Include our other modules
exports.version = bindings.version
exports.CIF = require('./cif')
exports.CIF_var = require('./cif_var')
exports.Function = require('./function')
exports.ForeignFunction = require('./foreign_function')
exports.VariadicForeignFunction = require('./foreign_function_var')
exports.DynamicLibrary = require('./dynamic_library')
exports.Library = require('./library')
exports.Callback = require('./callback')
exports.errno = require('./errno')
exports.ffiType = require('./type')

// the shared library extension for this platform
exports.LIB_EXT = exports.Library.EXT

// the FFI_TYPE struct definition
exports.FFI_TYPE = exports.ffiType.FFI_TYPE

},{"./bindings":15,"./callback":16,"./cif":17,"./cif_var":18,"./dynamic_library":19,"./errno":20,"./foreign_function":22,"./foreign_function_var":23,"./function":24,"./library":25,"./type":26,"assert":6,"debug":11,"ref":129,"ref-struct":128}],22:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var CIF = require('./cif')
  , _ForeignFunction = require('./_foreign_function')
  , debug = require('debug')('ffi:ForeignFunction')
  , assert = require('assert')
  , ref = require('ref')

/**
 * Represents a foreign function in another library. Manages all of the aspects
 * of function execution, including marshalling the data parameters for the
 * function into native types and also unmarshalling the return from function
 * execution.
 */

function ForeignFunction (funcPtr, returnType, argTypes, abi) {
  debug('creating new ForeignFunction', funcPtr)

  // check args
  assert(Buffer.isBuffer(funcPtr), 'expected Buffer as first argument')
  assert(!!returnType, 'expected a return "type" object as the second argument')
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the third argument')

  // normalize the "types" (they could be strings,
  // so turn into real type instances)
  returnType = ref.coerceType(returnType)
  argTypes = argTypes.map(ref.coerceType)

  // create the `ffi_cif *` instance
  var cif = CIF(returnType, argTypes, abi)

  // create and return the JS proxy function
  return _ForeignFunction(cif, funcPtr, returnType, argTypes)
}
module.exports = ForeignFunction

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":28,"./_foreign_function":14,"./cif":17,"assert":6,"debug":11,"ref":129}],23:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var CIF_var = require('./cif_var')
  , Type = require('./type')
  , _ForeignFunction = require('./_foreign_function')
  , assert = require('assert')
  , debug = require('debug')('ffi:VariadicForeignFunction')
  , ref = require('ref')
  , bindings = require('./bindings')
  , POINTER_SIZE = ref.sizeof.pointer
  , FFI_ARG_SIZE = bindings.FFI_ARG_SIZE

/**
 * For when you want to call to a C function with variable amount of arguments.
 * i.e. `printf()`.
 *
 * This function takes care of caching and reusing ForeignFunction instances that
 * contain the same ffi_type argument signature.
 */

function VariadicForeignFunction (funcPtr, returnType, fixedArgTypes, abi) {
  debug('creating new VariadicForeignFunction', funcPtr)

  // the cache of ForeignFunction instances that this
  // VariadicForeignFunction has created so far
  var cache = {}

  // check args
  assert(Buffer.isBuffer(funcPtr), 'expected Buffer as first argument')
  assert(!!returnType, 'expected a return "type" object as the second argument')
  assert(Array.isArray(fixedArgTypes), 'expected Array of arg "type" objects as the third argument')

  var numFixedArgs = fixedArgTypes.length

  // normalize the "types" (they could be strings,
  // so turn into real type instances)
  fixedArgTypes = fixedArgTypes.map(ref.coerceType)

  // get the names of the fixed arg types
  var fixedKey = fixedArgTypes.map(function (type) {
    return getId(type)
  })


  // what gets returned is another function that needs to be invoked with the rest
  // of the variadic types that are being invoked from the function.
  function variadic_function_generator () {
    debug('variadic_function_generator invoked')

    // first get the types of variadic args we are working with
    var argTypes = fixedArgTypes.slice()
    var key = fixedKey.slice()

    for (var i = 0; i < arguments.length; i++) {
      var type = ref.coerceType(arguments[i])
      argTypes.push(type)

      var ffi_type = Type(type)
      assert(ffi_type.name)
      key.push(getId(type))
    }

    // now figure out the return type
    var rtnType = ref.coerceType(variadic_function_generator.returnType)
    var rtnName = getId(rtnType)
    assert(rtnName)

    // first let's generate the key and see if we got a cache-hit
    key = rtnName + key.join('')

    var func = cache[key]
    if (func) {
      debug('cache hit for key:', key)
    } else {
      // create the `ffi_cif *` instance
      debug('creating the variadic ffi_cif instance for key:', key)
      var cif = CIF_var(returnType, argTypes, numFixedArgs, abi)
      func = cache[key] = _ForeignFunction(cif, funcPtr, rtnType, argTypes)
    }
    return func
  }

  // set the return type. we set it as a property of the function generator to
  // allow for monkey patching the return value in the very rare case where the
  // return type is variadic as well
  variadic_function_generator.returnType = returnType

  return variadic_function_generator
}

module.exports = VariadicForeignFunction

var idKey = '_ffiId'
function getId (type) {
  if (!type.hasOwnProperty(idKey)) {
    type[idKey] = (((1+Math.random())*0x10000)|0).toString(16)
  }
  return type[idKey]
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":28,"./_foreign_function":14,"./bindings":15,"./cif_var":18,"./type":26,"assert":6,"debug":11,"ref":129}],24:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var ref = require('ref')
  , assert = require('assert')
  , bindings = require('./bindings')
  , Callback = require('./callback')
  , ForeignFunction = require('./foreign_function')
  , debug = require('debug')('ffi:FunctionType')
 
/**
 * Module exports.
 */

module.exports = Function

/**
 * Creates and returns a "type" object for a C "function pointer".
 *
 * @api public
 */

function Function (retType, argTypes, abi) {
  if (!(this instanceof Function)) {
    return new Function(retType, argTypes, abi)
  }

  debug('creating new FunctionType')

  // check args
  assert(!!retType, 'expected a return "type" object as the first argument')
  assert(Array.isArray(argTypes), 'expected Array of arg "type" objects as the second argument')

  // normalize the "types" (they could be strings, so turn into real type
  // instances)
  this.retType = ref.coerceType(retType)
  this.argTypes = argTypes.map(ref.coerceType)
  this.abi = null == abi ? bindings.FFI_DEFAULT_ABI : abi
}

/**
 * The "ffi_type" is set for node-ffi functions.
 */

Function.prototype.ffi_type = bindings.FFI_TYPES.pointer

/**
 * The "size" is always pointer-sized.
 */

Function.prototype.size = ref.sizeof.pointer

/**
 * The "alignment" is always pointer-aligned.
 */

Function.prototype.alignment = ref.alignof.pointer

/**
 * The "indirection" is always 1 to ensure that our get()/set() get called.
 */

Function.prototype.indirection = 1

/**
 * Returns a ffi.Callback pointer (Buffer) of this function type for the
 * given `fn` Function.
 */

Function.prototype.toPointer = function toPointer (fn) {
  return Callback(this.retType, this.argTypes, this.abi, fn)
}

/**
 * Returns a ffi.ForeignFunction (Function) of this function type for the
 * given `buf` Buffer.
 */

Function.prototype.toFunction = function toFunction (buf) {
  return ForeignFunction(buf, this.retType, this.argTypes, this.abi)
}

/**
 * get function; return a ForeignFunction instance.
 */

Function.prototype.get = function get (buffer, offset) {
  debug('ffi FunctionType "get" function')
  var ptr = buffer.readPointer(offset)
  return this.toFunction(ptr)
}

/**
 * set function; return a Callback buffer.
 */

Function.prototype.set = function set (buffer, offset, value) {
  debug('ffi FunctionType "set" function')
  var ptr
  if ('function' == typeof value) {
    ptr = this.toPointer(value)
  } else if (Buffer.isBuffer(value)) {
    ptr = value
  } else {
    throw new Error('don\'t know how to set callback function for: ' + value)
  }
  buffer.writePointer(ptr, offset)
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":28,"./bindings":15,"./callback":16,"./foreign_function":22,"assert":6,"debug":11,"ref":129}],25:[function(require,module,exports){
(function (process){

/**
 * Module dependencies.
 */

var DynamicLibrary = require('./dynamic_library')
  , ForeignFunction = require('./foreign_function')
  , VariadicForeignFunction = require('./foreign_function_var')
  , debug = require('debug')('ffi:Library')
  , RTLD_NOW = DynamicLibrary.FLAGS.RTLD_NOW

/**
 * The extension to use on libraries.
 * i.e.  libm  ->  libm.so   on linux
 */

var EXT = Library.EXT = {
    'linux':  '.so'
  , 'linux2': '.so'
  , 'sunos':  '.so'
  , 'solaris':'.so'
  , 'freebsd':'.so'
  , 'openbsd':'.so'
  , 'darwin': '.dylib'
  , 'mac':    '.dylib'
  , 'win32':  '.dll'
}[process.platform]

/**
 * Provides a friendly abstraction/API on-top of DynamicLibrary and
 * ForeignFunction.
 */

function Library (libfile, funcs, lib) {
  debug('creating Library object for', libfile)

  if (libfile && libfile.indexOf(EXT) === -1) {
    debug('appending library extension to library name', EXT)
    libfile += EXT
  }

  if (!lib) {
    lib = {}
  }
  var dl = new DynamicLibrary(libfile || null, RTLD_NOW)

  Object.keys(funcs || {}).forEach(function (func) {
    debug('defining function', func)

    var fptr = dl.get(func)
      , info = funcs[func]

    if (fptr.isNull()) {
      throw new Error('Library: "' + libfile
        + '" returned NULL function pointer for "' + func + '"')
    }

    var resultType = info[0]
      , paramTypes = info[1]
      , fopts = info[2]
      , abi = fopts && fopts.abi
      , async = fopts && fopts.async
      , varargs = fopts && fopts.varargs

    if (varargs) {
      lib[func] = VariadicForeignFunction(fptr, resultType, paramTypes, abi)
    } else {
      var ff = ForeignFunction(fptr, resultType, paramTypes, abi)
      lib[func] = async ? ff.async : ff
    }
  })

  return lib
}
module.exports = Library

}).call(this,require('_process'))
},{"./dynamic_library":19,"./foreign_function":22,"./foreign_function_var":23,"_process":127,"debug":11}],26:[function(require,module,exports){
(function (Buffer){

/**
 * Module dependencies.
 */

var ref = require('ref')
var assert = require('assert')
var debug = require('debug')('ffi:types')
var Struct = require('ref-struct')
var bindings = require('./bindings')

/**
 * Define the `ffi_type` struct (see deps/libffi/include/ffi.h) for use in JS.
 * This struct type is used internally to define custom struct rtn/arg types.
 */

var FFI_TYPE = Type.FFI_TYPE = Struct()
FFI_TYPE.defineProperty('size',      ref.types.size_t)
FFI_TYPE.defineProperty('alignment', ref.types.ushort)
FFI_TYPE.defineProperty('type',      ref.types.ushort)
// this last prop is a C Array of `ffi_type *` elements, so this is `ffi_type **`
var ffi_type_ptr_array = ref.refType(ref.refType(FFI_TYPE))
FFI_TYPE.defineProperty('elements',  ffi_type_ptr_array)
assert.equal(bindings.FFI_TYPE_SIZE, FFI_TYPE.size)

/**
 * Returns a `ffi_type *` Buffer appropriate for the given "type".
 *
 * @param {Type|String} type A "ref" type (or string) to get the `ffi_type` for
 * @return {Buffer} A buffer pointing to a `ffi_type` instance for "type"
 * @api private
 */

function Type (type) {
  type = ref.coerceType(type)
  debug('Type()', type.name || type)
  assert(type.indirection >= 1, 'invalid "type" given: ' + (type.name || type))
  var rtn

  // first we assume it's a regular "type". if the "indirection" is greater than
  // 1, then we can just use "pointer" ffi_type, otherwise we hope "ffi_type" is
  // set
  if (type.indirection === 1) {
    rtn = type.ffi_type
  } else {
    rtn = bindings.FFI_TYPES.pointer
  }

  // if "rtn" isn't set (ffi_type was not set) then we check for "ref-array" type
  if (!rtn && type.type) {
    // got a "ref-array" type
    // passing arrays to C functions are always by reference, so we use "pointer"
    rtn = bindings.FFI_TYPES.pointer
  }

  if (!rtn && type.fields) {
    // got a "ref-struct" type
    // need to create the `ffi_type` instance manually
    debug('creating an `ffi_type` for given "ref-struct" type')
    var fields = type.fields
      , fieldNames = Object.keys(fields)
      , numFields = fieldNames.length
      , numElements = 0
      , ffi_type = new FFI_TYPE
      , i = 0
      , field
      , ffi_type_ptr

    // these are the "ffi_type" values expected for a struct
    ffi_type.size = 0
    ffi_type.alignment = 0
    ffi_type.type = 13 // FFI_TYPE_STRUCT

    // first we have to figure out the number of "elements" that will go in the
    // array. this would normally just be "numFields" but we also have to account
    // for arrays, which each act as their own element
    for (i = 0; i < numFields; i++) {
      field = fields[fieldNames[i]]
      if (field.type.fixedLength > 0) {
        // a fixed-length "ref-array" type
        numElements += field.type.fixedLength
      } else {
        numElements += 1
      }
    }

    // hand-crafting a null-terminated array here.
    // XXX: use "ref-array"?
    var size = ref.sizeof.pointer * (numElements + 1) // +1 because of the NULL terminator
    var elements = ffi_type.elements = new Buffer(size)
    var index = 0
    for (i = 0; i < numFields; i++) {
      field = fields[fieldNames[i]]
      if (field.type.fixedLength > 0) {
        // a fixed-length "ref-array" type
        ffi_type_ptr = Type(field.type.type)
        for (var j = 0; j < field.type.fixedLength; j++) {
          elements.writePointer(ffi_type_ptr, (index++) * ref.sizeof.pointer)
        }
      } else {
        ffi_type_ptr = Type(field.type)
        elements.writePointer(ffi_type_ptr, (index++) * ref.sizeof.pointer)
      }
    }
    // final NULL pointer to terminate the Array
    elements.writePointer(ref.NULL, index * ref.sizeof.pointer)
    // also set the `ffi_type` property to that it's cached for next time
    rtn = type.ffi_type = ffi_type.ref()
  }

  if (!rtn && type.name) {
    // handle "ref" types other than the set that node-ffi is using (i.e.
    // a separate copy)
    if ('CString' == type.name) {
      rtn = type.ffi_type = bindings.FFI_TYPES.pointer
    } else {
      var cur = type
      while (!rtn && cur) {
        rtn = cur.ffi_type = bindings.FFI_TYPES[cur.name]
        cur = Object.getPrototypeOf(cur)
      }
    }
  }

  assert(rtn, 'Could not determine the `ffi_type` instance for type: ' + (type.name || type))
  debug('returning `ffi_type`', rtn.name)
  return rtn
}
module.exports = Type

}).call(this,require("buffer").Buffer)
},{"./bindings":15,"assert":6,"buffer":10,"debug":11,"ref":129,"ref-struct":128}],27:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],28:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],29:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var FFI = require('ffi');

function fortranArrayToJSMatrix(fortranArray, m, n, elementSize) {
    var op = elementSize == 8 ? 'readDoubleLE' : 'readFloatLE';
    var array = [];
    var rowWidth = elementSize * n;
    var columnOffset = m * elementSize;

    for(var i = 0; i < m; i++) {
        var row = [];
        var rowStart = i * elementSize;

        for(var j = 0; j < n; j++) {
            row.push(fortranArray[op](columnOffset * j + rowStart));
        }

        array.push(row);
    }

    return array;
}

function jsMatrixToFortranArray(array, elementSize) {
    var op = elementSize == 8 ? 'writeDoubleLE' : 'writeFloatLE';
    var m = array.length;
    var n = array[0].length;
    var fortranArrayStart = fortranArray = new Buffer(m * n * elementSize);
    for(var j = 0; j < n; j++) {
        for(var i = 0; i < m; i++) {
            fortranArray[op](array[i][j], elementSize * (j * m + i));
        }
    }

    return fortranArrayStart;
}

function fortranArrayToJSArray(fortranArray, n, op, elementSize) {
    var array = [];
    
    for(var i = 0; i < n; i++) {
        array.push(fortranArray[op](i * elementSize));
    }

    return array;
}

module.exports.fortranArrayToJSMatrix = fortranArrayToJSMatrix;
module.exports.jsMatrixToFortranArray = jsMatrixToFortranArray;
module.exports.fortranArrayToJSArray = fortranArrayToJSArray;

}).call(this,require("buffer").Buffer)
},{"buffer":10,"ffi":21}],30:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var lapack = require('./lapack.js');
exports.sgeqrf = lapack.sgeqrf;
exports.dgeqrf = lapack.dgeqrf;
exports.sgesvd = lapack.sgesvd;
exports.qr = lapack.qr;
exports.lu = lapack.lu;
exports.sgetrf = lapack.sgetrf;
exports.sgesv = lapack.sgesv;

},{"./lapack.js":31}],31:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var fortranArray = require('./fortranArray');
var FFI = require('ffi');

var LAPACK;

try {
    LAPACK = new FFI.Library('liblapack', {
	"sgeqrf_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", 
			    "pointer", "pointer", "pointer"]],
	"dgeqrf_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", 
			    "pointer", "pointer", "pointer"]],
	"sorgqr_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer", 
			    "pointer", "pointer", "pointer"]],
	"sgesvd_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", 
			    "pointer", "pointer", "pointer", "pointer", "pointer", 
			    "pointer", "pointer", "pointer", "pointer", ]],
	"sgetrf_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]],
	"dgetrf_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]],
	"sgesv_": ["void", ["pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer", "pointer"]]
	
    });
} catch(e) {
    console.log("!!! node-lapack requires the native lapack to be built as a shared lib.");
    console.log(e);
}

var FORTRAN_INT = 4;
var FORTRAN_CHAR = 1;
var FORTRAN_FLOAT = 4;
var FORTRAN_DOUBLE = 8;

function eye(m) {
    var matrix = [];

    for(var i = 0; i < m; i++) {
	var row = [];
	matrix.push(row);
	
	for(var j = 0; j < m; j++) {
	    if(i == j)
		row.push(1);
	    else
		row.push(0);
	}
    }

    return matrix;
}

function matrixOp(matrix, elementSize, callback) {
    var m = matrix.length;
    var n = matrix[0].length;    
    var f_m = new Buffer(FORTRAN_INT);
    var f_n = new Buffer(FORTRAN_INT);
    var f_a = fortranArray.jsMatrixToFortranArray(matrix, elementSize);
    var f_lda = new Buffer(FORTRAN_INT);
    
    f_m.writeInt32LE(m, 0);
    f_n.writeInt32LE(n, 0);
    f_lda.writeInt32LE(Math.max(1, m), 0);
    
    callback(m, n, f_m, f_n, f_a, f_lda);
}

function zeroBottomLeft(matrix) {
    // zero out bottom left forming an upper right triangle matrix                
    for(var i = 1; i < matrix.length; i++) {
        for(var j = 0; j < i && j < matrix[0].length; j++)
            matrix[i][j] = 0;
    }

    return matrix
}

function sgesv(a, b) {
    var f_info = new Buffer(FORTRAN_INT);
    var result = {};

    matrixOp(a, FORTRAN_FLOAT, function(am, an, af_m, af_n, f_a) {
	var f_ipiv = new Buffer(am  * FORTRAN_INT);

	matrixOp(b, FORTRAN_FLOAT, function(bm, bn, bf_m, bf_n, f_b) {
	    LAPACK.sgesv_(af_m, bf_n, f_a, af_n, f_ipiv, f_b, bf_m, f_info);
	    result.X = fortranArray.fortranArrayToJSMatrix(f_b, bm, bn, FORTRAN_FLOAT);
	    result.P = ipivToP(bm, fortranArray.fortranArrayToJSArray(f_ipiv, bm, 'readInt32LE', FORTRAN_FLOAT));
	});
    });

    return result;
}

function qr(matrix) {
    var result;

    sgeqrf(matrix, function(qr, m, n, f_m, f_n, f_a, f_lda, f_tau, f_work, f_lwork, f_info) {
	var f_k = new Buffer(FORTRAN_INT);
	f_k.writeInt32LE(Math.min(m, n), 0);
	LAPACK.sorgqr_(f_m, f_n, f_k, f_a, f_lda, f_tau, f_work, f_lwork, f_info);
	qr.Q = fortranArray.fortranArrayToJSMatrix(f_a, m, n, FORTRAN_FLOAT);
	qr.R = zeroBottomLeft(qr.R);
	result = qr;
    });
    
    return result;
}

function sgeqrf(matrix, callback) {
    return geqrf(matrix, 'readFloatLE', LAPACK.sgeqrf_, FORTRAN_FLOAT, callback);
}

function dgeqrf(matrix, callback) {
    return geqrf(matrix, 'readDoubleLE', LAPACK.dgeqrf_, FORTRAN_DOUBLE, callback);
}

function geqrf(matrix, op, lapackFunc, elementSize, callback) {
    var qr;
    
    matrixOp(matrix, elementSize, function(m, n, f_m, f_n, f_a, f_lda) {
	var f_tau = new Buffer(m * n * elementSize);
	var f_info = new Buffer(FORTRAN_INT);
	var f_lwork = new Buffer(FORTRAN_INT);
	var f_work;
	f_lwork.writeInt32LE(-1, 0);
	
	// get optimal size of workspace
	f_work = new Buffer(FORTRAN_DOUBLE);
	lapackFunc(f_m, f_n, f_a, f_lda, f_tau, f_work, f_lwork, f_info);
	lwork = f_work[op](0);
	
	// allocate workspace
	f_work = new Buffer(lwork * elementSize);
	f_lwork.writeInt32LE(lwork, 0);
	
	// perform QR decomp
	lapackFunc(f_m, f_n, f_a, f_lda, f_tau, f_work, f_lwork, f_info); 
	
	qr = {
	    R: fortranArray.fortranArrayToJSMatrix(f_a, m, n, elementSize),
	    tau: fortranArray.fortranArrayToJSArray(f_tau, Math.min(m, n), op, elementSize)
	};
	
	if(callback)
	    qr = callback(qr, m, n, f_m, f_n, f_a, f_lda, f_tau, f_work, f_lwork, f_info);
    });
    
    return qr;
}

function cloneMatrix(matrix, height, width) {
    var clone = [];

    height = height || matrix.length;
    width = width || matrix[0].length;

    for(var i = 0; i < height; i++) {
	var row = [];
	clone.push(row);

	for(var j = 0; j < width; j++) {
	    row.push(matrix[i][j]);
	}
    }

    return clone;
}

function swapRows(matrix, i, j) {
    var tmp = matrix[j];
    matrix[j] = matrix[i];
    matrix[i] = tmp;
    return matrix;
}

function lu(matrix) {
    var result = sgetrf(matrix);
    var P = ipivToP(matrix.length, result.IPIV);
    var L = cloneMatrix(result.LU);
    var m = n = Math.min(matrix.length, matrix[0].length);

    for(var i = 0; i < L.length; i++) {
	for(var j = i; j < L[i].length; j++) {
	    if(i == j)
		L[i][j] = 1;
	    else
		L[i][j] = 0;
	}
    }

    return {
	L: L,
	U: zeroBottomLeft(cloneMatrix(result.LU, n, n)),
	P: P,
	IPIV: result.IPIV
    };
}

function ipivToP(m, ipiv){
    var P = eye(m);

    for(var i = 0; i < ipiv.length; i++) {
	if(i != ipiv[i] - 1)
            swapRows(P, i, ipiv[i] - 1);
    }

    return P;
}

function sgetrf(matrix) {
    return getrf(matrix, LAPACK.sgetrf_, FORTRAN_FLOAT);
}

function dgetrf(matrix) {
    return getrf(matrix, LAPACK.dgetrf_, FORTRAN_DOUBLE);
}

function getrf(matrix, lapackFunc, elementSize) {
    var result = {};

    matrixOp(matrix, elementSize, function(m, n, f_m, f_n, f_a, f_lda) {
	var f_ipiv = new Buffer(Math.min(m, n) * FORTRAN_INT);
	var f_info = new Buffer(FORTRAN_INT);
	lapackFunc(f_m, f_n, f_a, f_m, f_ipiv, f_info);
	result.LU = fortranArray.fortranArrayToJSMatrix(f_a, m, n, elementSize);
	result.IPIV = fortranArray.fortranArrayToJSArray(f_ipiv, Math.min(m, n), 'readInt32LE', elementSize);
    });

    return result;
}

function sgesvd(jobu, jobvt, matrix) {
    var f_jobu = new Buffer(FORTRAN_CHAR);
    var f_jobvt = new Buffer(FORTRAN_CHAR);
    f_jobu.writeUInt8(jobu.charCodeAt(0), 0);
    f_jobvt.writeUInt8(jobvt.charCodeAt(0), 0);
    var svd;

    matrixOp(matrix, FORTRAN_FLOAT, function(m, n, f_m, f_n, f_a, f_lda) {
	var f_s = new Buffer(Math.pow(Math.min(m, n), 2) * FORTRAN_FLOAT);
	var f_u = new Buffer(Math.pow(m, 2) * FORTRAN_FLOAT);
	var f_ldu = new Buffer(FORTRAN_INT);
	f_ldu.writeInt32LE(m, 0);

	// TODO: punting on dims for now. revisit with http://www.netlib.org/lapack/single/sgesvd.f
	var f_vt = new Buffer(Math.pow(n, 2) * FORTRAN_FLOAT);
	var f_ldvt = new Buffer(FORTRAN_INT);
	f_ldvt.writeInt32LE(n, 0);
	
	var lwork = -1;
	var f_work = new Buffer(FORTRAN_FLOAT);
	var f_lwork = new Buffer(FORTRAN_INT);
	f_lwork.writeInt32LE(lwork, 0);
	var f_info = new Buffer(FORTRAN_INT);

	LAPACK.sgesvd_(f_jobu, f_jobvt, f_m, f_n, f_a, f_lda, f_s, f_u, f_ldu, f_vt, f_ldvt, 
		      f_work, f_lwork, f_info);

	lwork = f_work.readFloatLE(0);
	f_work = new Buffer(lwork * FORTRAN_FLOAT);
	f_lwork.writeInt32LE(lwork, 0);

	LAPACK.sgesvd_(f_jobu, f_jobvt, f_m, f_n, f_a, f_lda, f_s, f_u, f_ldu, f_vt, f_ldvt, 
		      f_work, f_lwork, f_info);

	svd = {
	    U: fortranArray.fortranArrayToJSMatrix(f_u, m, m, FORTRAN_FLOAT),
	    S: fortranArray.fortranArrayToJSMatrix(f_s, n, n, FORTRAN_FLOAT),
	    VT: fortranArray.fortranArrayToJSMatrix(f_vt, n, n, FORTRAN_FLOAT)
	};
    });

    return svd;
}

exports.sgeqrf = sgeqrf;
exports.dgeqrf = dgeqrf;
exports.sgesvd = sgesvd;
exports.sgetrf = sgetrf;
exports.dgetrf = sgetrf;
exports.sgesv = sgesv;
exports.qr = qr;
exports.lu = lu;

}).call(this,require("buffer").Buffer)
},{"./fortranArray":29,"buffer":10,"ffi":21}],32:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],33:[function(require,module,exports){
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var _ = require("underscore")._;

/*
 Sentences Analizer Class
 From http://www.writingcentre.uottawa.ca/hypergrammar/sntpurps.html

 Take a POS input and analyse it for
  - Type of Sentense
     - Interrogative
       - Tag Questions
       - 
     - Declarative
     - Exclamatory 
     - Imperative

  - Parts of a Sentense
     - Subject
     - Predicate

  - Show Preposition Phrases
*/

var Sentences = function(pos, callback) {
    this.posObj = pos;
    this.senType = null;
    callback(this);
};

Sentences.prototype.part = function(callback) {
    var subject = [],
	predicat = [],
	verbFound = false;
	
    this.prepositionPhrases();
	
    for (var i = 0; i < this.posObj.tags.length; i++) {
        if (this.posObj.tags[i].pos == "VB") {
            if (i === 0) {
                verbFound = true;
            } else {
                // We need to Test for any EX before the VB
                if (this.posObj.tags[i - 1].pos != "EX") {
                    verbFound = true;
                } else {
                    predicat.push(this.posObj.tags[i].token);
                }					
            }
        }

        // Add Pronoun Phrase (pp) Or Subject Phrase (sp)
        if (!verbFound) {
            if (this.posObj.tags[i].pp != true)
                this.posObj.tags[i].spos = "SP";
            
            subject.push(this.posObj.tags[i].token);
        } else {
            if (this.posObj.tags[i].pp != true)
                this.posObj.tags[i].spos = "PP";
            
            predicat.push(this.posObj.tags[i].token)
        }
    }
	
    if (subject.length == 0) {
	this.posObj.tags.push({token:"You",spos:"SP",pos:"PRP",added:true});
    }
    
    callback(this);	
};

// Takes POS and removes IN to NN or NNS
// Adds a PP for each prepositionPhrases
Sentences.prototype.prepositionPhrases = function() {
    var remove = false;

    for (var i = 0; i < this.posObj.tags.length; i++) {
        if (this.posObj.tags[i].pos.match("IN")) {
            remove = true;
        }
    
        if (remove) {
            this.posObj.tags[i].pp = true;
        }
    
        if (this.posObj.tags[i].pos.match("NN")) {
            remove = false;
        }
    }	
};

Sentences.prototype.subjectToString = function() {
    return this.posObj.tags.map(function(t){ if (t.spos == "SP" || t.spos == "S" ) return t.token }).join(' ');
};

Sentences.prototype.predicateToString = function() {
    return this.posObj.tags.map(function(t){ if (t.spos == "PP" || t.spos == "P" ) return t.token }).join(' ');
};

Sentences.prototype.implicitYou = function() {
    for (var i = 0; i < this.posObj.tags.length;i++) {
        if (this.posObj.tags[i].added) {
            return true;
        }
    }
    
    return false;
};

Sentences.prototype.toString = function() {
    return this.posObj.tags.map(function(t){return t.token}).join(' ');
};

// This is quick and incomplete.
Sentences.prototype.type = function(callback) {
    var callback = callback || false;

    // Check for implicit you before popping a tag.
    var implicitYou = this.implicitYou();

    // FIXME - punct seems useless
    var lastElement = this.posObj.punct();
    lastElement = (lastElement.length != 0) ? lastElement.pop() : this.posObj.tags.pop();

    if (lastElement.pos !== ".") {
        if (implicitYou) {
            this.senType = "COMMAND";
        } else if (_(["WDT","WP","WP$","WRB"]).contains(this.posObj.tags[0].pos)) {
            // Sentences that start with: who, what where when why and how, then they are questions
            this.senType = "INTERROGATIVE";
        } else if (_(["PRP"]).contains(lastElement.pos)) {
            // Sentences that end in a Personal pronoun are most likely questions
            // eg. We should run away, should we [?]
            // eg. You want to see that again, do you [?]
            this.senType = "INTERROGATIVE";
        } else {
            this.senType = "UNKNOWN";
        }
            
    } else {
        switch(lastElement.token) {
            case "?": this.senType = "INTERROGATIVE"; break;
            case "!": this.senType = (implicitYou) ? "COMMAND":"EXCLAMATORY"; break;
            case ".": this.senType = (implicitYou) ? "COMMAND":"DECLARATIVE";	break;
        }
    }
    
    if (callback && _(callback).isFunction()) {
        callback(this);
    } else {
        return this.senType;
    }
};

module.exports = Sentences;

},{"underscore":137}],34:[function(require,module,exports){
/*
    Brill's POS Tagger
    Copyright (C) 2016 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require("fs");

var TF_Parser = require('./TF_Parser');

// Tags a sentence, sentence is an array of words
// Returns an array of tagged words; a tagged words is an array consisting of
// the word itself followed by its lexical category
Brill_POS_Tagger.prototype.tag = function(sentence) {
  var taggedSentence = new Array(sentence.length);
  
  var that = this;
  sentence.forEach(function(word, index) {
    taggedSentence[index] = [];
    taggedSentence[index][0] = word;
    var categories = that.lexicon.tagWord(word);
    taggedSentence[index][1] = categories[0];
  });

  // Apply transformation rules
  for (var i = 0, size = sentence.length; i < size; i++) {
    this.ruleSet.rules.forEach(function(rule) {
      rule.apply(taggedSentence, i);
    });
  }
  return(taggedSentence);
};

function Brill_POS_Tagger(lexicon, ruleSet) {
  this.lexicon = lexicon;
  this.ruleSet = ruleSet;
}

module.exports = Brill_POS_Tagger;

},{"./TF_Parser":38,"fs":9}],35:[function(require,module,exports){
/*
   Lexicon class
   Copyright (C) 2016 Hugo W.L. ter Doest

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require('fs');

// Parses a lexicon in JSON or text format
function Lexicon(filename, defaultCategory) {
  this.defaultCategory = defaultCategory;
  var that = this;

  // Read lexicon
  try {
    var data = fs.readFileSync(filename, 'utf8');
    if (data[0] === "{") {
      // Lexicon is in JSON format
      that.lexicon = JSON.parse(data);
    }
    else {
      // Lexicon is plain text
      that.parseLexicon(data);
    }
    // console.log('Brill_POS_Tagger.read_lexicon: number of lexicon entries read: ' + Object.keys(that.lexicon).length);
  }
  catch(error) {
    console.error(error);
  }
}

// Parses a lexicon in text format: word cat1 cat2 ... catn
Lexicon.prototype.parseLexicon = function(data) {
  // Split into an array of non-empty lines
  var arrayOfLines = data.match(/[^\r\n]+/g);
  this.lexicon = {};
  var that = this;
  arrayOfLines.forEach(function(line) {
    // Split line by whitespace
    var elements = line.trim().split(/\s+/);
    if (elements.length > 0) {
      that.lexicon[elements[0]] = elements.slice(1);
    }
  });
};

// Returns a list of categories for word
Lexicon.prototype.tagWord = function(word) {
  var categories = this.lexicon[word];
  if (!categories) {
    categories = this.lexicon[word.toLowerCase()];
  }
  if (!categories) {
    // If not found assign default_category
    categories = [this.defaultCategory];
  }
  return(categories);
};

module.exports = Lexicon;

},{"fs":9}],36:[function(require,module,exports){
/*
    Predicates for the Brill tagger
    Copyright (C) 2015 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var predicates = {
    // Predicates as used in the English rules in data/English/tr_from_posjs.txt
    "NEXT-TAG": next_tag_is,
    "NEXT-WORD-IS-CAP": next_word_is_cap,
    "PREV-1-OR-2-OR-3-TAG": prev_1_or_2_or_3_tag,
    "PREV-1-OR-2-TAG": prev_1_or_2_tag,
    "NEXT-WORD-IS-TAG": next_tag_is,
    "PREV-TAG": prev_tag_is,
    "CURRENT-WORD-IS-TAG": current_word_is_tag,
    "PREV-WORD-IS-CAP": prev_word_is_cap,
    "CURRENT-WORD-IS-CAP": current_word_is_cap,
    "CURRENT-WORD-IS-NUMBER": current_word_is_number,
    "CURRENT-WORD-IS-URL": current_word_is_url,
    "CURRENT-WORD-ENDS-WITH": current_word_ends_with,
    "PREV-WORD-IS": prev_word_is,
    // Predicates as used in the Dutch rules in data/Dutch/brill_CONTEXTRULES.jg
    "PREVTAG": prev_tag_is,
    "NEXT1OR2TAG": next_1_or_2_tag_is,
    "NEXTTAG": next_tag_is,
    "PREV1OR2TAG": prev_1_or_2_tag,
    "WDAND2TAGAFT": current_word_and_2_tag_after_are,
    "NEXT1OR2OR3TAG": next_1_or_2_or_3_tag,
    "CURWD": current_word_is,
    "SURROUNDTAG": surrounded_by_tags,
    "PREV1OR2OR3TAG": prev_1_or_2_or_3_tag, 
    "WDNEXTTAG": current_word_and_next_tag_are,
    "PREV1OR2WD": prev_1_or_2_word_is,
    "NEXTWD": next_word_is,
    "PREVWD": prev_word_is,
    "NEXT2TAG": next_2_tag_is,
    "WDAND2TAGBFR": current_word_and_2_tag_before_are,
    "WDAND2AFT": current_word_and_2_after_are,
    "WDPREVTAG": current_word_and_prev_tag_are,
    "RBIGRAM": right_bigram_is,
    "LBIGRAM": left_bigram_is,
    "NEXTBIGRAM": next_bigram_is,
    "PREVBIGRAM": prev_bigram_is,
    "PREV2TAG": prev_2_tag_is,
    "NEXT1OR2WD": next_1_or_2_word_is
 };

// ==================================
// Predicates that start with words
// ==================================
function next_word_is_cap(tagged_sentence, i, parameter) {
  if (i < tagged_sentence.length - 1) {
    var next_word = tagged_sentence[i+1][0];
    return(next_word[0] === next_word[0].toUpperCase());
  }
  else {
    return(false);
  }
}

function next_word_is(tagged_sentence, i, parameter) {
  if (i < tagged_sentence.length - 1) {
    return(tagged_sentence[i+1][0] === parameter);
  }
}

function prev_word_is_cap(tagged_sentence, i, parameter) {
  var prev_word = null;
  if (i > 0) {
    prev_word = tagged_sentence[i-1][0];
    return(prev_word[0] === prev_word[0].toUpperCase());
  }
  return(false);
}

function current_word_is_cap(tagged_sentence, i, parameter) {
  var current_word = tagged_sentence[i][0];
  return(current_word[0] === current_word[0].toUpperCase());
}

function current_word_is(tagged_sentence, i, parameter) {
  return(tagged_sentence[i][0] === parameter);
}

function isNumeric(num) {
  return (!isNaN(num));
}

function current_word_is_number(tagged_sentence, i, parameter) {
  var is_number = isNumeric(tagged_sentence[i][0]);
  // Attempt to parse it as a float
  if (!is_number) {
    is_number = parseFloat(tagged_sentence[i][0]);
  }
  return((parameter === "YES") ? is_number : !is_number);
}

// Checks if the current word is a url
// Adapted from the original Javascript Brill tagger
function current_word_is_url(tagged_sentence, i, parameter) {
  var is_url = false;
  if (tagged_sentence[i][0].indexOf(".") > -1) {
    // url if there are two contiguous alpha characters
    if (/[a-zA-Z]{2}/.test(tagged_sentence[i][0])) {
      is_url = true;
    }
  }
  return((parameter === "YES") ? is_url : !is_url);
};

function current_word_and_2_tag_after_are(tagged_sentence, i, parameter1, parameter2) {
  if (i < tagged_sentence.length - 2) {
    if (tagged_sentence[i+2][1] === parameter2) {
      return(tagged_sentence[i][0] === parameter1);
    }
    else {
      return(false);
    }
  }
  else {
    return(false);
  }
}

function current_word_and_next_tag_are(tagged_sentence, i, parameter1, parameter2) {
  var next_tag = false;
  // check current word
  var current_word = (tagged_sentence[i][0] === parameter1);
  // check next tag
  if (i < tagged_sentence.length - 1) {
    next_tag = (tagged_sentence[i+1][1] === parameter2);
  }
  return(current_word && next_tag);
}

function current_word_and_prev_tag_are(tagged_sentence, i, parameter1, parameter2) {
  var prev_tag = false;
  // check current word
  var current_word = (tagged_sentence[i][0] === parameter2);
  // check prev tag
  if (i > 0) {
    prev_tag = (tagged_sentence[i-1][1] === parameter1);
  }
  return(current_word && prev_tag);
}

function current_word_and_2_tag_before_are(tagged_sentence, i, parameter1, parameter2) {
  var two_tags_before = false;
  // check current word
  var current_word = (tagged_sentence[i][0] === parameter2);
  if (i > 1) {
    // check two tags before
    two_tags_before = (tagged_sentence[i-2][1] === parameter1);
  }
  return(current_word && two_tags_before);
}

function current_word_and_2_after_are(tagged_sentence, i, parameter1, parameter2) {
   var two_words_after = false;
  // check current word
  var current_word = (tagged_sentence[i][0] === parameter1);
  if (i < tagged_sentence - 2) {
    two_words_after = (tagged_sentence[i+2][0] === parameter2);
  }
  return(current_word && two_words_after);
}

function prev_word_is(tagged_sentence, i, parameter) {
  if (i > 0) {
    return(tagged_sentence[i-1][0].toLowerCase() === parameter.toLowerCase());
  }
  else {
    return(false);
  }
};

function prev_1_or_2_word_is(tagged_sentence, i, parameter) {
  var prev_1 = false;
  var prev_2 = false;
  if (i > 0) {
    prev_1 = (tagged_sentence[i-1][0].toLowerCase() === parameter.toLowerCase());
  }
  if (i > 1) {
    prev_2 = (tagged_sentence[i-2][0].toLowerCase() === parameter.toLowerCase());
  }
  return(prev_1 || prev_2);
};

// Indicates whether or not this string ends with the specified string.
// Adapted from the original Javascript Brill tagger
function current_word_ends_with(tagged_sentence, i, parameter) {
  var word = tagged_sentence[i][0];
  if (!parameter || (parameter.length > word.length)) {
    return false;
  }
  return(word.indexOf(parameter) === (word.length - parameter.length));
}

function right_bigram_is(tagged_sentence, i, parameter1, parameter2) {
  var word_1 = (tagged_sentence[i][0] === parameter1);
  var word_2 = false;
  if (i < tagged_sentence.length - 1) {
    word_2 = (tagged_sentence[i+1][0] === parameter2);
  }
  return(word_1 && word_2);
}

function left_bigram_is(tagged_sentence, i, parameter1, parameter2) {
  var word_1 = false;
  var word_2 = (tagged_sentence[i][0] === parameter2);
  if (i > 0) {
    word_1 = (tagged_sentence[i-1][0] === parameter1);
  }
  return(word_1 && word_2);
}

function next_bigram_is(tagged_sentence, i, parameter1, parameter2) {
  var word_1 = false;
  var word_2 = false;
  if (i < tagged_sentence.length - 1) {
    word_1 = (tagged_sentence[i+1][0] === parameter1);
  }
  if (i < tagged_sentence.length - 2) {
    word_2 = (tagged_sentence[i+2][0] === parameter2);
  }
  return(word_1 && word_2);
}

function prev_bigram_is(tagged_sentence, i, parameter1, parameter2) {
  var word_1 = false;
  var word_2 = false;
  if (i >  1) {
    word_1 = (tagged_sentence[i-2][0] === parameter1);
  }
  if (i > 0) {
    word_2 = (tagged_sentence[i-1][0] === parameter2);
  }
  return(word_1 && word_2);
}

function next_1_or_2_word_is(tagged_sentence, i, parameter1, parameter2) {
  next_1 = false;
  next_2 = false;
  if (i < tagged_sentence.length - 1) {
    next_1 = (tagged_sentence[i+1][0] === parameter1);
  }
  if (i < tagged_sentence.length - 2) {
    next_2 = (tagged_sentence[i+2][0] === parameter2);
  }
  return(next_1 || next_2);
}

// ==================================
// Predicates about tags
// ==================================
function next_tag_is(tagged_sentence, i, parameter) {
  if (i < tagged_sentence.length - 1) {
    return(tagged_sentence[i+1][1] === parameter);
  }
  else {
    return(false);
  }
}

function next_2_tag_is(tagged_sentence, i, parameter) {
  if (i < tagged_sentence.length - 2) {
    return(tagged_sentence[i+2][1] === parameter);
  }
  else {
    return(false);
  }
}

function next_1_or_2_tag_is(tagged_sentence, i, parameter) {
  var next_1 = false;
  var next_2 = false;
  if (i < tagged_sentence.length - 1) {
    next_1 = (tagged_sentence[i+1][1] === parameter);
  }
  if (i < tagged_sentence.length - 2) {
    next_2 = (tagged_sentence[i+2][1] === parameter);
  }
  return(next_1 || next_2);
}

function next_1_or_2_or_3_tag(tagged_sentence, i, parameter) {
  var next_1 = false;
  var next_2 = false;
  var next_3 = false;
  if (i < tagged_sentence.length - 1) {
    next_1 = (tagged_sentence[i+1][1] === parameter);
  }
  if (i < tagged_sentence.length - 2) {
    next_2 = (tagged_sentence[i+2][1] === parameter);
  }
  if (i < tagged_sentence.length - 3) {
    next_3 = (tagged_sentence[i+3][1] === parameter);
  }
  return(next_1 || next_2 || next_3);
}

function surrounded_by_tags(tagged_sentence, i, parameter1, parameter2) {
  if (i < tagged_sentence.length - 1) {
    // check next tag
    if (tagged_sentence[i+1][1] === parameter2) {
      // check previous tag
      if (i > 0) {
        return(tagged_sentence[i-1][1] === parameter1)
      }
      else {
        return(false);
      }
    }
    else {
      return(false);
    }
  }
  else {
    return(false);
  }
}

function prev_1_or_2_or_3_tag(tagged_sentence, i, parameter) {
  var prev_1 = null;
  if (i > 0) {
    prev_1 = tagged_sentence[i-1][1];
  }
  var prev_2 = null;
  if (i > 1) {
    prev_2 = tagged_sentence[i-2][1];
  }
  var prev_3 = null;
  if (i > 2) {
    prev_3 = tagged_sentence[i-2][1];
  }
  return((prev_1 === parameter) || (prev_2 === parameter) || (prev_3 === parameter));
}

function prev_1_or_2_tag(tagged_sentence, i, parameter) {
  var prev_1 = null;
  if (i > 0) {
    prev_1 = tagged_sentence[i-1][1];
  }
  var prev_2 = null;
  if (i > 1) {
    prev_2 = tagged_sentence[i-2][1];
  }
  return((prev_1 === parameter) || (prev_2 === parameter));
}

function prev_tag_is(tagged_sentence, i, parameter) {
  var prev = false;
  if (i > 0) {
    prev = (tagged_sentence[i-1][1] === parameter);
  }
  return(prev);
}

function current_word_is_tag(tagged_sentence, i, parameter) {
  return(tagged_sentence[i][0] === parameter);
}

function prev_2_tag_is(tagged_sentence, i, parameter) {
  var prev_2 = false;
  if (i > 1) {
    prev_2 = (tagged_sentence[i-2][1] === parameter);
  }
  return(prev_2);
}

function default_transformation_rule (tagged_sentence, i, parameter) {
  return(false);
}

function Predicate(name, parameter1, parameter2) {
  this.name = name;
  this.parameter1 = parameter1;
  if (parameter2) {
    this.parameter2 = parameter2;
  }
  this.function = predicates[name];
  if (!this.function) {
    this.predicate = default_transformation_rule;
    console.warn('Predicate constructor: predicate not found: ' + name + '; using default');
  }
  // console.log(this.name);
  // console.log(this.function);
}

Predicate.prototype.evaluate = function(tagged_sentence, position) {
  return(this.function(tagged_sentence, position, this.parameter1, this.parameter2));
};

module.exports = Predicate;
},{}],37:[function(require,module,exports){
/*
   Set of transformation rules
   Copyright (C) 2016 Hugo W.L. ter Doest

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require("fs");
var TF_Parser = require('./TF_Parser');

function RuleSet(filename) {
  var that = this;

  // Read transformation rules
  try {
    var data = fs.readFileSync(filename, 'utf8');
    this.rules = TF_Parser.parse(data);
    // console.log(this.rules);
    // console.log('Brill_POS_Tagger.read_transformation_rules: number of transformation rules read: ' + this.rules.length);
  }
  catch(error) {
    console.error(error);
  }
}

module.exports = RuleSet;

},{"./TF_Parser":38,"fs":9}],38:[function(require,module,exports){
module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { transformation_rules: peg$parsetransformation_rules },
        peg$startRuleFunction  = peg$parsetransformation_rules,

        peg$c0 = [],
        peg$c1 = peg$FAILED,
        peg$c2 = function(rules) {
          var result = [];

          for (var i = 0; i < rules.length; i++) {
            result.push(rules[i][1]);
          }
          return(result);
        },
        peg$c3 = null,
        peg$c4 = function(c1, c2, pred, par1, par2) {
          // Construct rule
          var result = new TransformationRule(c1, c2, pred, par1, par2);
          return(result);
        },
        peg$c5 = /^[a-zA-Z_0-9_\-.,()]/,
        peg$c6 = { type: "class", value: "[a-zA-Z_0-9_\\-.,()]", description: "[a-zA-Z_0-9_\\-.,()]" },
        peg$c7 = function(characters) {
           var s = "";
           for (var i = 0; i < characters.length; i++) {
             s += characters[i];
           }
           return(s);
          },
        peg$c8 = "*",
        peg$c9 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c10 = function(wc) {
           return(wc)
          },
        peg$c11 = "\r\n",
        peg$c12 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
        peg$c13 = "\n",
        peg$c14 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c15 = "\r",
        peg$c16 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c17 = "//",
        peg$c18 = { type: "literal", value: "//", description: "\"//\"" },
        peg$c19 = void 0,
        peg$c20 = { type: "any", description: "any character" },
        peg$c21 = " ",
        peg$c22 = { type: "literal", value: " ", description: "\" \"" },
        peg$c23 = "\t",
        peg$c24 = { type: "literal", value: "\t", description: "\"\\t\"" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsetransformation_rules() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parseS();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsetransformation_rule();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseS();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c1;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c1;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c1;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parseS();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsetransformation_rule();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseS();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c1;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c1;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c1;
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c2(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsetransformation_rule() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parsecategory1();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseidentifier();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseidentifier();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseidentifier();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseidentifier();
              if (s5 === peg$FAILED) {
                s5 = peg$c3;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c4(s1, s2, s3, s4, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsecategory1() {
      var s0;

      s0 = peg$parsewild_card();
      if (s0 === peg$FAILED) {
        s0 = peg$parseidentifier();
      }

      return s0;
    }

    function peg$parseidentifier() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c5.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c6); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c5.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseS_no_eol();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c7(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsewild_card() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 42) {
        s1 = peg$c8;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c9); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseS_no_eol();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c10(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEOL() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c11) {
        s0 = peg$c11;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c12); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c13;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c14); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s0 = peg$c15;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c16); }
          }
        }
      }

      return s0;
    }

    function peg$parseComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c17) {
        s1 = peg$c17;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c18); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseEOL();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c19;
        } else {
          peg$currPos = s4;
          s4 = peg$c1;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseEOL();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c19;
          } else {
            peg$currPos = s4;
            s4 = peg$c1;
          }
          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c20); }
            }
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseEOL();
          if (s3 === peg$FAILED) {
            s3 = peg$parseEOI();
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseS() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c21;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s1 = peg$c23;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$parseEOL();
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment();
          }
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c21;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c22); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 9) {
            s1 = peg$c23;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          if (s1 === peg$FAILED) {
            s1 = peg$parseEOL();
            if (s1 === peg$FAILED) {
              s1 = peg$parseComment();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseS_no_eol() {
      var s0, s1;

      s0 = [];
      if (input.charCodeAt(peg$currPos) === 32) {
        s1 = peg$c21;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c22); }
      }
      if (s1 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 9) {
          s1 = peg$c23;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c24); }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$parseComment();
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (input.charCodeAt(peg$currPos) === 32) {
          s1 = peg$c21;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c22); }
        }
        if (s1 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 9) {
            s1 = peg$c23;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c24); }
          }
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment();
          }
        }
      }

      return s0;
    }

    function peg$parseEOI() {
      var s0, s1;

      s0 = peg$currPos;
      peg$silentFails++;
      if (input.length > peg$currPos) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      peg$silentFails--;
      if (s1 === peg$FAILED) {
        s0 = peg$c19;
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }


      var TransformationRule = require("./TransformationRule");


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./TransformationRule":39}],39:[function(require,module,exports){
/*
    Transformation rules for the Brill tagger
    Copyright (C) 2015 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Predicate = require("./Predicate");

var category_wild_card = "*";

function TransformationRule(c1, c2, predicate, parameter1, parameter2) {
  this.literal = [c1, c2, predicate, parameter1, parameter2];
  this.predicate = new Predicate(predicate, parameter1, parameter2);
  this.old_category = c1;
  this.new_category = c2;
  // console.log('TransformationRule constructor: ' + this.literal);
}

TransformationRule.prototype.apply = function(tagged_sentence, position) {
  if ((tagged_sentence[position][1] === this.old_category) ||
      (this.old_category === category_wild_card)) {
    if (this.predicate.evaluate(tagged_sentence, position)) {
      tagged_sentence[position][1] = this.new_category;
      // console.log('TransformationRule.apply: changed category ' + 
      //              this.old_category + ' to ' + this.new_category +
      //              ' at position ' + position);
    }
  }
};

module.exports = TransformationRule;
  
},{"./Predicate":36}],40:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = require('util'),
    Classifier = require('./classifier'),
    ApparatusBayesClassifier = require('apparatus').BayesClassifier;

var BayesClassifier = function(stemmer, smoothing) {
    var abc = new ApparatusBayesClassifier();
    if (smoothing && isFinite(smoothing)) {
        abc = new ApparatusBayesClassifier(smoothing);
    }
    Classifier.call(this, abc, stemmer);
};

util.inherits(BayesClassifier, Classifier);

function restore(classifier, stemmer) {
    classifier = Classifier.restore(classifier, stemmer);
    classifier.__proto__ = BayesClassifier.prototype;
    classifier.classifier = ApparatusBayesClassifier.restore(classifier.classifier);

    return classifier;
}

function load(filename, stemmer, callback) {
    Classifier.load(filename, function(err, classifier) {
        if (err) {
            callback(err);
        }
        else {
            callback(err, restore(classifier, stemmer));
        }
    });
}

BayesClassifier.restore = restore;
BayesClassifier.load = load;

module.exports = BayesClassifier;

},{"./classifier":41,"apparatus":5,"util":140}],41:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var PorterStemmer = require('../stemmers/porter_stemmer'),
util = require('util'),
events = require('events');

var Classifier = function(classifier, stemmer) {
    this.classifier = classifier;
    this.docs = [];
    this.features = {};
    this.stemmer = stemmer || PorterStemmer;
    this.lastAdded = 0;
    this.events = new events.EventEmitter();
};

function addDocument(text, classification) {
    
    // Ignore further processing if classification is undefined 
    if(typeof classification === 'undefined') return;
    
    // If classification is type of string then make sure it's dosen't have blank space at both end  
    if(typeof classification === 'string'){
      classification = classification.trim();
    }
  
    if(typeof text === 'string')
	text = this.stemmer.tokenizeAndStem(text);

    if(text.length === 0) {
        // ignore empty documents
        return;
    }

    this.docs.push({
	label: classification,
	text: text
    });

    for (var i = 0; i < text.length; i++) {
        var token = text[i];
        this.features[token] = (this.features[token] || 0) + 1;
    }
}

function removeDocument(text, classification) {
  var docs = this.docs
    , doc
    , pos;

  if (typeof text === 'string') {
    text = this.stemmer.tokenizeAndStem(text);
  }

  for (var i = 0, ii = docs.length; i < ii; i++) {
    doc = docs[i];
    if (doc.text.join(' ') == text.join(' ') &&
        doc.label == classification) {
      pos = i;
    }
  }

  // Remove if there's a match
  if (!isNaN(pos)) {
    this.docs.splice(pos, 1);

    for (var i = 0, ii = text.length; i < ii; i++) {
      delete this.features[text[i]];
    }
  }
}

function textToFeatures(observation) {
    var features = [];

    if(typeof observation === 'string')
	observation = this.stemmer.tokenizeAndStem(observation);

    for(var feature in this.features) {
        if(observation.indexOf(feature) > -1)
            features.push(1);
        else
            features.push(0);
    }

    return features;
}

function train() {
    var totalDocs = this.docs.length;
    for(var i = this.lastAdded; i < totalDocs; i++) {
        var features = this.textToFeatures(this.docs[i].text);
        this.classifier.addExample(features, this.docs[i].label);
        this.events.emit('trainedWithDocument', {index: i, total: totalDocs, doc: this.docs[i]});
        this.lastAdded++;
    }
    this.events.emit('doneTraining', true);
    this.classifier.train();
}

function retrain() {
  this.classifier = new (this.classifier.constructor)();
  this.lastAdded = 0;
  this.train();
}

function getClassifications(observation) {
    return this.classifier.getClassifications(this.textToFeatures(observation));
}

function classify(observation) {
    return this.classifier.classify(this.textToFeatures(observation));
}

function restore(classifier, stemmer) {
    classifier.stemmer = stemmer || PorterStemmer;
    classifier.events = new events.EventEmitter();
    return classifier;
}

function save(filename, callback) {
    var data = JSON.stringify(this);
    var fs = require('fs');
    var classifier = this;
    fs.writeFile(filename, data, 'utf8', function(err) {
        if(callback) {
            callback(err, err ? null : classifier);
        }
    });
}

function load(filename, callback) {
    var fs = require('fs');

    fs.readFile(filename, 'utf8', function(err, data) {
        var classifier;
          
        if(!err) {
            classifier = JSON.parse(data);
        }

        if(callback)
            callback(err, classifier);
    });
}

Classifier.prototype.addDocument = addDocument;
Classifier.prototype.removeDocument = removeDocument;
Classifier.prototype.train = train;
Classifier.prototype.retrain = retrain;
Classifier.prototype.classify = classify;
Classifier.prototype.textToFeatures = textToFeatures;
Classifier.prototype.save = save;
Classifier.prototype.getClassifications = getClassifications;
Classifier.restore = restore;
Classifier.load = load;

module.exports = Classifier;

},{"../stemmers/porter_stemmer":68,"events":13,"fs":9,"util":140}],42:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = require('util'),
    Classifier = require('./classifier'),
    ApparatusLogisticRegressionClassifier = require('apparatus').LogisticRegressionClassifier;

var LogisticRegressionClassifier = function(stemmer) {
    Classifier.call(this, new ApparatusLogisticRegressionClassifier(), stemmer);
};

util.inherits(LogisticRegressionClassifier, Classifier);

function restore(classifier, stemmer) {
    classifier = Classifier.restore(classifier, stemmer);
    classifier.__proto__ = LogisticRegressionClassifier.prototype;
    classifier.classifier = ApparatusLogisticRegressionClassifier.restore(classifier.classifier);

    return classifier;
}

function load(filename, stemmer, callback) {
    Classifier.load(filename, function(err, classifier) {
        if (err) {
            callback(err);
        }
        else {
            callback(err, restore(classifier, stemmer));
        }
    });
}

function train() {
    // we need to reset the traning state because logistic regression
    // needs its matricies to have their widths synced, etc.
    this.lastAdded = 0;
    this.classifier = new ApparatusLogisticRegressionClassifier();
    Classifier.prototype.train.call(this);
}

LogisticRegressionClassifier.prototype.train = train;
LogisticRegressionClassifier.restore = restore;
LogisticRegressionClassifier.load = load;

module.exports = LogisticRegressionClassifier;

},{"./classifier":41,"apparatus":5,"util":140}],43:[function(require,module,exports){
/*
Copyright (c) 2011, John Crepezzi, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Get all of the pairs of letters for a string
var letterPairs = function (str) {
  var numPairs = str.length - 1;
  var pairs = new Array(numPairs);
  for (var i = 0; i < numPairs; i++) {
    pairs[i] = str.substring(i, i + 2);
  }
  return pairs;
};

// Get all of the pairs in all of the words for a string
var wordLetterPairs = function (str) {
  var allPairs = [], pairs;
  var words = str.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    pairs = letterPairs(words[i]);
    allPairs.push.apply(allPairs, pairs);
  }
  return allPairs;
};

// Perform some sanitization steps
var sanitize = function (str) {
  return str.toLowerCase().replace(/^\s+|\s+$/g, '');
};

// Compare two strings, and spit out a number from 0-1
var compare = function (str1, str2) {
  var sanitized_str1 = sanitize(str1);
  var sanitized_str2 = sanitize(str2);
  var pairs1 = wordLetterPairs(sanitized_str1);
  var pairs2 = wordLetterPairs(sanitized_str2);
  var intersection = 0, union = pairs1.length + pairs2.length;
  if (union === 0) {
      if (sanitized_str1 === sanitized_str2) {
          return 1;
      } else {
          return 0;
      }
  } else {
    var i, j, pair1, pair2;
    for (i = 0; i < pairs1.length; i++) {
      pair1 = pairs1[i];
      for (j = 0; j < pairs2.length; j++) {
        pair2 = pairs2[j];
        if (pair1 == pair2) {
          intersection ++;
          delete pairs2[j];
          break;
        }
      }
    }
    return 2 * intersection / union;
  }
};

module.exports = compare;

},{}],44:[function(require,module,exports){
/*
Copyright (c) 2012, Adam Phillabaum, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

Unless otherwise stated by a specific section of code

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Computes the Jaro distance between two string -- intrepreted from:
// http://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
// s1 is the first string to compare
// s2 is the second string to compare
function distance(s1, s2) {
    if (typeof(s1) != "string" || typeof(s2) != "string") return 0;
    if (s1.length == 0 || s2.length == 0) 
        return 0;
    s1 = s1.toLowerCase(), s2 = s2.toLowerCase();
    var matchWindow = (Math.floor(Math.max(s1.length, s2.length) / 2.0)) - 1;
    var matches1 = new Array(s1.length);
    var matches2 = new Array(s2.length);
    var m = 0; // number of matches
    var t = 0; // number of transpositions

    //debug helpers
    //console.log("s1: " + s1 + "; s2: " + s2);
    //console.log(" - matchWindow: " + matchWindow);

    // find matches
    for (var i = 0; i < s1.length; i++) {
	var matched = false;

	// check for an exact match
	if (s1[i] ==  s2[i]) {
		matches1[i] = matches2[i] = matched = true;
		m++
	}

	// check the "match window"
	else {
        	// this for loop is a little brutal
        	for (k = (i <= matchWindow) ? 0 : i - matchWindow;
        		(k <= i + matchWindow) && k < s2.length && !matched;
			k++) {
            		if (s1[i] == s2[k]) {
                		if(!matches1[i] && !matches2[k]) {
                	    		m++;
               		}

        	        matches1[i] = matches2[k] = matched = true;
        	    }
        	}
	}
    }

    if(m == 0)
        return 0.0;

    // count transpositions
    var k = 0;

    for(var i = 0; i < s1.length; i++) {
    	if(matches1[k]) {
    	    while(!matches2[k] && k < matches2.length)
                k++;
	        if(s1[i] != s2[k] &&  k < matches2.length)  {
                t++;
            }

    	    k++;
    	}
    }
    
    //debug helpers:
    //console.log(" - matches: " + m);
    //console.log(" - transpositions: " + t);
    t = t / 2.0;
    return (m / s1.length + m / s2.length + (m - t) / m) / 3;
}

// Computes the Winkler distance between two string -- intrepreted from:
// http://en.wikipedia.org/wiki/Jaro%E2%80%93Winkler_distance
// s1 is the first string to compare
// s2 is the second string to compare
// dj is the Jaro Distance (if you've already computed it), leave blank and the method handles it
function JaroWinklerDistance(s1, s2, dj) {
		if (s1 == s2) {
				return 1 
		}
		else {
		    var jaro;
		    (typeof(dj) == 'undefined')? jaro = distance(s1,s2) : jaro = dj;
		    var p = 0.1; //
		    var l = 0 // length of the matching prefix
		    while(s1[l] == s2[l] && l < 4)
		        l++;
		    
		    return jaro + l * p * (1 - jaro);
		}
}
module.exports = JaroWinklerDistance;

},{}],45:[function(require,module,exports){
/*
Copyright (c) 2012, Sid Nallu, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
 * contribution by sidred123
 */

/*
 * Compute the Levenshtein distance between two strings.
 * Algorithm based from Speech and Language Processing - Daniel Jurafsky and James H. Martin.
 */

function LevenshteinDistance (source, target, options) {
    options = options || {};
    if(isNaN(options.insertion_cost)) options.insertion_cost = 1;
    if(isNaN(options.deletion_cost)) options.deletion_cost = 1;
    if(isNaN(options.substitution_cost)) options.substitution_cost = 1;

    var sourceLength = source.length;
    var targetLength = target.length;
    var distanceMatrix = [[0]];

    for (var row =  1; row <= sourceLength; row++) {
        distanceMatrix[row] = [];
        distanceMatrix[row][0] = distanceMatrix[row-1][0] + options.deletion_cost;
    }

    for (var column = 1; column <= targetLength; column++) {
        distanceMatrix[0][column] = distanceMatrix[0][column-1] + options.insertion_cost;
    }

    for (var row = 1; row <= sourceLength; row++) {
        for (var column = 1; column <= targetLength; column++) {
            var costToInsert = distanceMatrix[row][column-1] + options.insertion_cost;
            var costToDelete = distanceMatrix[row-1][column] + options.deletion_cost;

            var sourceElement = source[row-1];
            var targetElement = target[column-1];
            var costToSubstitute = distanceMatrix[row-1][column-1];
            if (sourceElement !== targetElement) {
                costToSubstitute = costToSubstitute + options.substitution_cost;
            }
            distanceMatrix[row][column] = Math.min(costToInsert, costToDelete, costToSubstitute);
        }
    }
    return distanceMatrix[sourceLength][targetLength];
}

module.exports = LevenshteinDistance;

},{}],46:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

exports.SoundEx = require('./phonetics/soundex');
exports.Metaphone = require('./phonetics/metaphone');
exports.DoubleMetaphone = require('./phonetics/double_metaphone');
exports.SoundExDM = require('./phonetics/dm_soundex');
exports.PorterStemmer = require('./stemmers/porter_stemmer');
exports.PorterStemmerFa = require('./stemmers/porter_stemmer_fa');
exports.PorterStemmerFr = require('./stemmers/porter_stemmer_fr');
exports.PorterStemmerRu = require('./stemmers/porter_stemmer_ru');
exports.PorterStemmerEs = require('./stemmers/porter_stemmer_es');
exports.PorterStemmerIt = require('./stemmers/porter_stemmer_it');
exports.PorterStemmerNo = require('./stemmers/porter_stemmer_no');
exports.PorterStemmerPt = require('./stemmers/porter_stemmer_pt');
exports.LancasterStemmer = require('./stemmers/lancaster_stemmer');
exports.StemmerFr = require('./stemmers/stemmer_fr');
exports.StemmerPl = require('./stemmers/stemmer_pl');
exports.StemmerJa = require('./stemmers/stemmer_ja');
exports.AggressiveTokenizerNl = require('./tokenizers/aggressive_tokenizer_nl');
exports.AggressiveTokenizerFa = require('./tokenizers/aggressive_tokenizer_fa');
exports.AggressiveTokenizerFr = require('./tokenizers/aggressive_tokenizer_fr');
exports.AggressiveTokenizerRu = require('./tokenizers/aggressive_tokenizer_ru');
exports.AggressiveTokenizerEs = require('./tokenizers/aggressive_tokenizer_es');
exports.AggressiveTokenizerIt = require('./tokenizers/aggressive_tokenizer_it');
exports.AggressiveTokenizerPl = require('./tokenizers/aggressive_tokenizer_pl');
exports.AggressiveTokenizerPt = require('./tokenizers/aggressive_tokenizer_pt');
exports.AggressiveTokenizerNo = require('./tokenizers/aggressive_tokenizer_no');
exports.AggressiveTokenizer = require('./tokenizers/aggressive_tokenizer');
exports.CaseTokenizer = require('./tokenizers/tokenizer_case');
exports.RegexpTokenizer = require('./tokenizers/regexp_tokenizer').RegexpTokenizer;
exports.WordTokenizer = require('./tokenizers/regexp_tokenizer').WordTokenizer;
exports.WordPunctTokenizer = require('./tokenizers/regexp_tokenizer').WordPunctTokenizer;
exports.TreebankWordTokenizer = require('./tokenizers/treebank_word_tokenizer');
exports.TokenizerJa = require('./tokenizers/tokenizer_ja');
exports.SentenceTokenizer = require('./tokenizers/sentence_tokenizer');
exports.BayesClassifier = require('./classifiers/bayes_classifier');
exports.LogisticRegressionClassifier = require('./classifiers/logistic_regression_classifier');
exports.NounInflector = require('./inflectors/noun_inflector');
exports.NounInflectorFr = require('./inflectors/fr/noun_inflector');
exports.NounInflectorJa = require('./inflectors/ja/noun_inflector');
exports.PresentVerbInflector = require('./inflectors/present_verb_inflector');
exports.CountInflector = require('./inflectors/count_inflector');
exports.WordNet = require('./wordnet/wordnet');
exports.TfIdf = require('./tfidf/tfidf');
exports.Trie = require('./trie/trie');
exports.SentenceAnalyzer = require('./analyzers/sentence_analyzer');
exports.stopwords = require('./util/stopwords').words;
exports.ShortestPathTree = require('./util/shortest_path_tree');
exports.Spellcheck = require('./spellcheck/spellcheck');
exports.LongestPathTree = require('./util/longest_path_tree');
exports.EdgeWeightedDigraph = require('./util/edge_weighted_digraph');
exports.NGrams = require('./ngrams/ngrams');
exports.NGramsZH = require('./ngrams/ngrams_zh');
exports.JaroWinklerDistance = require('./distance/jaro-winkler_distance');
exports.LevenshteinDistance = require('./distance/levenshtein_distance');
exports.DiceCoefficient = require('./distance/dice_coefficient');
exports.normalize = require('./normalizers/normalizer').normalize_tokens;
exports.normalize_ja = require('./normalizers/normalizer_ja').normalize_ja;
exports.removeDiacritics = require('./normalizers/remove_diacritics');
exports.transliterate_ja = require('./transliterators/ja');
exports.BrillPOSTagger = require('./brill_pos_tagger/lib/Brill_POS_Tagger');
exports.Lexicon = require('./brill_pos_tagger/lib/Lexicon');
exports.RuleSet = require('./brill_pos_tagger/lib/RuleSet');



},{"./analyzers/sentence_analyzer":33,"./brill_pos_tagger/lib/Brill_POS_Tagger":34,"./brill_pos_tagger/lib/Lexicon":35,"./brill_pos_tagger/lib/RuleSet":37,"./classifiers/bayes_classifier":40,"./classifiers/logistic_regression_classifier":42,"./distance/dice_coefficient":43,"./distance/jaro-winkler_distance":44,"./distance/levenshtein_distance":45,"./inflectors/count_inflector":47,"./inflectors/fr/noun_inflector":49,"./inflectors/ja/noun_inflector":50,"./inflectors/noun_inflector":51,"./inflectors/present_verb_inflector":52,"./ngrams/ngrams":54,"./ngrams/ngrams_zh":55,"./normalizers/normalizer":56,"./normalizers/normalizer_ja":57,"./normalizers/remove_diacritics":59,"./phonetics/dm_soundex":60,"./phonetics/double_metaphone":61,"./phonetics/metaphone":62,"./phonetics/soundex":64,"./spellcheck/spellcheck":65,"./stemmers/lancaster_stemmer":67,"./stemmers/porter_stemmer":68,"./stemmers/porter_stemmer_es":69,"./stemmers/porter_stemmer_fa":70,"./stemmers/porter_stemmer_fr":71,"./stemmers/porter_stemmer_it":72,"./stemmers/porter_stemmer_no":73,"./stemmers/porter_stemmer_pt":74,"./stemmers/porter_stemmer_ru":75,"./stemmers/stemmer_fr":79,"./stemmers/stemmer_ja":81,"./stemmers/stemmer_pl":83,"./tfidf/tfidf":87,"./tokenizers/aggressive_tokenizer":88,"./tokenizers/aggressive_tokenizer_es":89,"./tokenizers/aggressive_tokenizer_fa":90,"./tokenizers/aggressive_tokenizer_fr":91,"./tokenizers/aggressive_tokenizer_it":92,"./tokenizers/aggressive_tokenizer_nl":93,"./tokenizers/aggressive_tokenizer_no":94,"./tokenizers/aggressive_tokenizer_pl":95,"./tokenizers/aggressive_tokenizer_pt":96,"./tokenizers/aggressive_tokenizer_ru":97,"./tokenizers/regexp_tokenizer":98,"./tokenizers/sentence_tokenizer":99,"./tokenizers/tokenizer_case":101,"./tokenizers/tokenizer_ja":102,"./tokenizers/treebank_word_tokenizer":103,"./transliterators/ja":104,"./trie/trie":105,"./util/edge_weighted_digraph":107,"./util/longest_path_tree":108,"./util/shortest_path_tree":109,"./util/stopwords":110,"./wordnet/wordnet":124}],47:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function nthForm(i) {
    var teenth = (i % 100);

    if(teenth > 10 && teenth < 14)
        return 'th';
    else {
        switch(i % 10) {
            case 1:
                return 'st';
                break;
            case 2:
                return 'nd';
                break;            
            case 3:
                return 'rd';
                break;
            default:
                return 'th';
        }
    }
}

function nth(i) {
    return i.toString() + nthForm(i);
}

var CountInflector = function() {
};

CountInflector.nth = nth;

module.exports = CountInflector;

},{}],48:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var FormSet = function() {
    this.regularForms = [];
    this.irregularForms = {};
}

module.exports = FormSet;

},{}],49:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A noun inflector for French.
 * Compiled from:
 * \@see http://fr.wiktionary.org/wiki/Annexe:Pluriels_irr%C3%A9guliers_en_fran%C3%A7ais
 * \@see http://fr.wikipedia.org/wiki/Pluriels_irr%C3%A9guliers_en_fran%C3%A7ais
 *
 * \@todo Take compounded noun into account (eaux-fortes, pique-nique...).
 * \@todo General note: French also requires AdjectiveInflector (femininize...).
 */

var SingularPluralInflector = require('../singular_plural_inflector'),
    util = require('util'),
    FormSet = require('../form_set');

function attach() {
  var inflector = this;

  String.prototype.singularizeNoun = function() {
    return inflector.singularize(this);
  };

  String.prototype.pluralizeNoun = function() {
    return inflector.pluralize(this);
  };
}



/**
 * @constructor
 */
var NounInflector = function() {
  // Ambiguous a.k.a. invariant.
  // \@todo Expand this list to be as comprehensive as possible.
  this.ambiguous = [
    // Nouns ending by -s
    'à-peu-près', 'à-propos', 'abattis', 'abcès', 'abois', 'abribus', 'abus',
    'accès', 'acquis', 'adénovirus', 'adonis', 'ados', 'agrès', 'aguets',
    'ailleurs', 'ais', 'albatros', 'albinos', 'alias', 'aloès', 'amaryllis',
    'amas', 'ampélopsis', 'ananas', 'anchois', 'angélus', 'anis', 'anticorps',
    'antihéros', 'antirides', 'anus', 'appas', 'appentis', 'appui-bras',
    'appuie-bras', 'arcanes', 'argus', 'arrérages', 'arrière-pays', 'as',
    'ascaris', 'asparagus', 'atlas', 'atours', 'aurochs', 'autobus',
    'autofocus', 'avant-bras', 'avant-corps', 'avant-propos', 'avers', 'avis',
    'axis', 'barbouillis', 'bas', 'beaujolais', 'beaux-arts', 'biais',
    'bibliobus', 'biceps', 'bicross', 'bien-fonds', 'bloc-notes', 'blockhaus',
    'blocus', 'blues', 'bois', 'bonus', 'bout-dehors', 'bouts-rimés',
    'branle-bas', 'bras', 'brebis', 'bris', 'brise-lames', 'brise-mottes',
    'brûlis', 'buis', 'burnous', 'bus', 'business', 'cabas', 'cacatoès',
    'cacatois', 'cactus', 'cadenas', 'cafouillis', 'caillebotis', 'calvados',
    'cambouis', 'campus', 'canevas', 'cannabis', 'carquois', 'cas',
    'casse-noisettes', 'casse-pieds', 'cassis', 'caucus', 'cens', 'cervelas',
    'chablis', 'chamois', 'chaos', 'chas', 'chasselas', 'châssis',
    'chatouillis', 'chauffe-assiettes', 'chauve-souris', 'chorus', 'choucas',
    'circoncis', 'cirrus', 'clafoutis', 'clapotis', 'cliquetis', 'clos',
    'cochylis', 'colis', 'coloris', 'commis', 'compas', 'compromis',
    'compte-chèques', 'compte-gouttes', 'compte-tours', 'concours', 'confins',
    'congrès', 'consensus', 'contrepoids', 'contresens', 'contretemps',
    'corn flakes', 'corps', 'corps-à-corps', 'corpus', 'cosinus', 'cosmos',
    'coulis', 'coupe-ongles', 'cours', 'court-jus', 'couscous', 'coutelas',
    'crocus', 'croquis', 'cross', 'cubitus', 'cumulus', 'cure-dents',
    'cure-ongles', 'cure-pipes', 'cursus', 'cyclo-cross', 'cyprès', 'dais',
    'damas', 'débarras', 'débours', 'débris', 'décès', 'dedans', 'dehors',
    'delirium tremens', 'demi-gros', 'dépens', 'dessous', 'dessus', 'détritus',
    'deux-mâts', 'deux-pièces', 'deux-points', 'deux-roues', 'deux-temps',
    'dévers', 'devis', 'diplodocus', 'discours', 'dos', 'ébats', 'éboulis',
    'échalas', 'edelweiss', 'élaeis', 'éleis', 'éléphantiasis', 'embarras',
    'empois', 'en-cas', 'encens', 'enclos', 'endos', 'engrais', 'entrelacs',
    'entremets', 'envers', 'épluche-légumes', 'ers', 'espace-temps',
    'essuie-mains', 'eucalyptus', 'ex-libris', 'excès', 'express', 'extrados',
    'faciès', 'fait-divers', 'fatras', 'faux-sens', 'favoris', 'ficus',
    'fier-à-bras', 'finnois', 'florès', 'focus', 'fœtus', 'fois', 'forceps',
    'fouillis', 'fracas', 'frais', 'français', 'franglais', 'frimas',
    'friselis', 'frisottis', 'froncis', 'frottis', 'fucus', 'gâchis', 'galetas',
    'galimatias', 'garde-à-vous', 'garde-corps', 'gargouillis', 'gars',
    'gâte-bois', 'gazouillis', 'génois', 'gibus', 'glacis', 'glas', 'gneiss',
    'gobe-mouches', 'grès', 'gribouillis', 'guet-apens', 'habeas corpus',
    'hachis', 'haras', 'hardes', 'harnais', 'haut-le-corps', 'hautbois',
    'herbe-aux-chats', 'héros', 'herpès', 'hiatus', 'hibiscus', 'hors-concours',
    'hors-pistes', 'hourdis', 'huis-clos', 'humérus', 'humus', 'ibis', 'iléus',
    'indique-fuites', 'infarctus', 'inlandsis', 'insuccès', 'intercours',
    'intrados', 'intrus', 'iris', 'isatis', 'jais', 'jars', 'jeans',
    'jeuconcours', 'judas', 'juliénas', 'jus', 'justaucorps', 'kakatoès',
    'kermès', 'kriss', 'lacis', 'laïus', 'lambris', 'lapis', 'laps', 'lapsus',
    'laquais', 'las', 'lattis', 'lave-mains', 'lavis', 'lèche-bottes',
    'lèche-vitrines', 'legs', 'lias', 'liégeois', 'lilas', 'lis', 'lœss',
    'logis', 'loris', 'lotus', 'louis', 'lupus', 'lys', 'mâchicoulis', 'madras',
    'maïs', 'malappris', 'malus', 'mânes', 'maquis', 'marais', 'maroilles',
    'marquis', 'mas', 'mass-médias', 'matelas', 'matois', 'médius', 'mépris',
    'mérinos', 'mess', 'mets', 'mi-bas', 'micro-ondes', 'mille-pattes',
    'millepertuis', 'minibus', 'minois', 'minus', 'mirabilis', 'mois',
    'monocorps', 'monte-plats', 'mors', 'motocross', 'mots-croisés', 'motus',
    'mouchetis', 'mucus', 'myosotis', 'nævus', 'négus', 'niais',
    'nimbo-stratus', 'nimbus', 'norois', 'nounours', 'nu-pieds', 'oasis',
    'obus', 'olibrius', 'omnibus', 'opus', 'os', 'ours', 'ouvre-boîtes',
    'ouvre-bouteilles', 'palais', 'palis', 'palmarès', 'palus', 'panais',
    'panaris', 'pancréas', 'papyrus', 'par-dehors', 'paradis', 'parcours',
    'pardessus', 'pare-balles', 'pare-chocs', 'parvis', 'pas', 'passe-temps',
    'pataquès', 'pathos', 'patois', 'pavois', 'pays', 'permis',
    'petit-bourgeois', 'petit-gris', 'petit-pois', 'phallus', 'phimosis',
    'pickles', 'pilotis', 'pique-fleurs', 'pis', 'pithiviers', 'pityriasis',
    'plateau-repas', 'plâtras', 'plein-temps', 'plexiglas', 'plexus', 'plus',
    'poids', 'pois', 'pont-levis', 'porte-avions', 'porte-bagages',
    'porte-billets', 'porte-bouteilles', 'porte-clés', 'porte-hélicoptères',
    'porte-jarretelles', 'porte-revues', 'pouls', 'préavis', 'presse-fruits',
    'presse-papiers', 'princeps', 'printemps', 'procès', 'processus', 'progrès',
    'propos', 'prospectus', 'protège-dents', 'psoriasis', 'pubis', 'puits',
    'pus', 'putois', 'quatre-épices', 'quatre-feuilles', 'quatre-heures',
    'quatre-mâts', 'quatre-quarts', 'quatre-temps', 'quitus', 'rabais',
    'rachis', 'radis', 'radius', 'raïs', 'ramassis', 'rébus', 'reclus',
    'recours', 'refus', 'relais', 'remords', 'remous', 'remue-méninges',
    'rendez-vous', 'repas', 'répons', 'repos', 'repris', 'reps', 'rétrovirus',
    'revers', 'rhinocéros', 'rictus', 'rince-doigts', 'ris', 'rollmops',
    'rosé-des-prés', 'roulis', 'rubis', 'salmigondis', 'salsifis', 'sans-logis',
    'sas', 'sassafras', 'sauternes', 'schnaps', 'schuss', 'secours', 'semis',
    'sens', 'serre-fils', 'serre-livres', 'sévices', 'sinus', 'skunks',
    'souris', 'sournois', 'sous-bois', 'stradivarius', 'stras', 'strass',
    'strato-cumulus', 'stratus', 'stress', 'succès', 'surdos', 'surplus',
    'surpoids', 'sursis', 'suspens', 'synopsis', 'syphilis', 'taffetas',
    'taillis', 'talus', 'tamaris', 'tamis', 'tapis', 'tas', 'taudis', 'temps',
    'tennis', 'terminus', 'terre-neuvas', 'tétanos', 'tétras', 'thalamus',
    'thermos', 'thesaurus', 'thésaurus', 'thymus', 'tire-fesses', 'tonus',
    'torchis', 'torticolis', 'tournedos', 'tournevis', 'tournis', 'tracas',
    'traîne-savates', 'travers', 'tréfonds', 'treillis', 'trépas', 'trias',
    'triceps', 'trichomonas', 'trois-étoiles', 'trois-mâts', 'trois-quarts',
    'trolleybus', 'tumulus', 'typhus', 'univers', 'us', 'utérus', 'vasistas',
    'vélocross', 'velours', 'verglas', 'verjus', 'vernis', 'vers',
    'vert-de-gris', 'vide-ordures', 'vide-poches', 'villageois', 'virus',
    'vis-à-vis', 'volubilis', 'vulgum pecus', 'waters', 'williams', 'xérès',

    // Nouns ending by -x
    'abat-voix', 'afflux', 'alpax', 'anthrax', 'apex', 'aptéryx',
    'archéoptéryx', 'arrière-faix', 'bombyx', 'borax', 'bordeaux', 'bouseux',
    'box', 'carex', 'casse-noix', 'cedex', 'céphalothorax', 'cérambyx', 'chaux',
    'choix', 'coccyx', 'codex', 'contumax', 'coqueleux', 'cortex', 'courroux',
    'croix', 'crucifix', 'culex', 'demodex', 'duplex', 'entre-deux', 'époux',
    'équivaux', 'eux', 'ex', 'faix', 'faucheux', 'faux', 'fax', 'ferreux',
    'flux', 'fox', 'freux', 'furax', 'hapax', 'harengueux', 'hélix',
    'horse-pox', 'houx', 'index', 'influx', 'inox', 'juke-box', 'kleenex',
    'lagothrix', 'larynx', 'lastex', 'latex', 'lux', 'lynx', 'macareux', 'max',
    'mésothorax', 'mi-voix', 'mirepoix', 'motteux', 'multiplex', 'murex',
    'narthex', 'noix', 'onyx', 'opopanax', 'oropharynx', 'paix', 'panax',
    'perdrix', 'pharynx', 'phénix', 'phlox', 'phoenix', 'pneumothorax', 'poix',
    'portefaix', 'pousse-cailloux', 'preux', 'prix', 'prothorax', 'pucheux',
    'pyrex', 'pyroligneux', 'quadruplex', 'queux', 'redoux', 'reflex', 'reflux',
    'relax', 'rhinopharynx', 'rose-croix', 'rouvieux', 'roux', 'rumex',
    'saindoux', 'sardonyx', 'scolex', 'sèche-cheveux', 'silex', 'simplex',
    'sioux', 'sirex', 'smilax', 'solex', 'songe-creux', 'spalax', 'sphex',
    'sphinx', 'storax', 'strix', 'styrax', 'surfaix', 'surtaux', 'syrinx',
    'tamarix', 'taux', 'télex', 'thorax', 'tord-boyaux', 'toux', 'trionyx',
    'tripoux', 'tubifex', 'vertex', 'vidéotex', 'vielleux', 'vieux',
    'violoneux', 'voix', 'volvox', 'vortex',

    // Nouns ending by -z
    'allume-gaz', 'assez', 'biogaz', 'cache-nez', 'camping-gaz', 'chez',
    'chintz', 'ersatz', 'fez', 'free-jazz', 'fritz', 'gaz', 'gin-fizz', 'hertz',
    'jazz', 'jerez', 'kibboutz', 'kilohertz', 'kolkhoz', 'kronprinz', 'lapiaz',
    'lez', 'mégahertz', 'merguez', 'nez', 'pince-nez', 'quartz', 'quiz', 'ranz',
    'raz', 'recez', 'rémiz', 'rez', 'riz', 'ruolz', 'seltz', 'serre-nez'
  ];

  this.customPluralForms = [];
  this.customSingularForms = [];
  this.singularForms = new FormSet();
  this.pluralForms = new FormSet();

  this.attach = attach;

  this.addIrregular('ail', 'aulx');
  this.addIrregular('bétail', 'bestiaux');
  this.addIrregular('bonhomme', 'bonshommes');
  this.addIrregular('ciel', 'cieux');
  this.addIrregular('monsieur', 'messieurs');
  this.addIrregular('mafioso', 'mafiosi');
  this.addIrregular('œil', 'yeux');
  this.addIrregular('putto', 'putti');
  this.addIrregular('targui', 'touareg'); // touareg -> touaregs is also OK.

  // Pluralize
  this.pluralForms.regularForms.push([/^(av|b|c|carnav|cérémoni|chac|corr|emment|emmenth|festiv|fut|gavi|gra|narv|p|récit|rég|rit|rorqu|st)al$/i, '$1als']);
  this.pluralForms.regularForms.push([/^(aspir|b|cor|ém|ferm|gemm|soupir|trav|vant|vent|vitr)ail$/i, '$1aux']);
  this.pluralForms.regularForms.push([/^(bij|caill|ch|gen|hib|jouj|p|rip|chouch)ou$/i, '$1oux']);
  this.pluralForms.regularForms.push([/^(gr|berimb|don|karb|land|pil|rest|sarr|un)au$/i, '$1aus']);
  this.pluralForms.regularForms.push([/^(bl|ém|enf|pn)eu$/i, '$1eus']);
  this.pluralForms.regularForms.push([/(au|eau|eu|œu)$/i, '$1x']);
  this.pluralForms.regularForms.push([/al$/i, 'aux']);
  this.pluralForms.regularForms.push([/(s|x)$/i, '$1']);
  this.pluralForms.regularForms.push([/(.*)$/i, '$1s']);

  // Singularize
  this.singularForms.regularForms.push([/^(aspir|b|cor|ém|ferm|gemm|soupir|trav|vant|vent|vitr)aux$/i, '$1ail']);
  this.singularForms.regularForms.push([/^(aloy|b|bouc|boy|burg|conoy|coy|cr|esquim|ét|fabli|flé|flûti|glu|gr|gru|hoy|joy|kérab|matéri|nobli|noy|pré|sen|sén|t|touch|tuss|tuy|v|ypré)aux$/i, '$1au']);
  this.singularForms.regularForms.push([/^(bij|caill|ch|gen|hib|jouj|p|rip|chouch)oux$/i, '$1ou']);
  this.singularForms.regularForms.push([/^(bis)?aïeux$/i, '$1aïeul']);
  this.singularForms.regularForms.push([/^apparaux$/i, 'appareil']); // One way transform, don't put on irregular list.
  this.singularForms.regularForms.push([/^ciels$/i, 'ciel']);
  this.singularForms.regularForms.push([/^œils$/i, 'œil']);
  this.singularForms.regularForms.push([/(eau|eu|œu)x$/i, '$1']);
  this.singularForms.regularForms.push([/aux$/i, 'al']);
  this.singularForms.regularForms.push([/(.*)s$/i, '$1']);

  this.pluralize = function(token) {
    return this.ize(token, this.pluralForms, this.customPluralForms);
  };

  this.singularize = function(token) {
    return this.ize(token, this.singularForms, this.customSingularForms);
  };
};

util.inherits(NounInflector, SingularPluralInflector);

module.exports = NounInflector;

},{"../form_set":48,"../singular_plural_inflector":53,"util":140}],50:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A noun inflector for Japanese.
 * Compiled from several sources including:
 * \@see http://answers.yahoo.com/question/index?qid=20080528201740AASBWy6
 * \@see http://www.excite.co.jp/dictionary/english_japanese/
 *
 * This script assumes input is normalized using normalizer_ja().
 * Pluralizing Japanese has a very limited interest.
 * Japanese don't usually distinct plural from singular, so even a word looking
 * like a singular might actually be a plural.
 *
 * Singularization of nouns ending by -tachi or -ra is achieved using a
 * comprehensive black list, while nouns ending by -domo or -gata use a white
 * list because there are too many exceptions.
 *
 * \@todo Singularize nouns ending by -ら, but there are too many exceptions.
 * \@todo Expand the list of common plurals ending by -domo and -gata.
 */

var SingularPluralInflector = require('../singular_plural_inflector'),
    util = require('util'),
    FormSet = require('../form_set');

function attach() {
  var inflector = this;

  String.prototype.singularizeNoun = function() {
    return inflector.singularize(this);
  };

  String.prototype.pluralizeNoun = function() {
    return inflector.pluralize(this);
  };
}



/**
 * @constructor
 */
var NounInflector = function() {
  // Ambiguous a.k.a. invariant.
  this.ambiguous = [
    'ともだち', '友だち', '友達', '遊び友達', '飲み友達', '酒飲み友達', '茶飲み友達',
    '学校友達', '女友達', '男友達', '幼友達'
  ];

  this.customPluralForms = [];
  this.customSingularForms = [];
  this.singularForms = new FormSet();
  this.pluralForms = new FormSet();

  this.attach = attach;

  this.addIrregular('神', '神神');
  this.addIrregular('人', '人人');
  this.addIrregular('年', '年年');
  this.addIrregular('月', '月月');
  this.addIrregular('日', '日日');
  this.addIrregular('星', '星星');
  this.addIrregular('島', '島島');
  this.addIrregular('我', '我我');
  this.addIrregular('山', '山山');
  this.addIrregular('国', '国国');
  this.addIrregular('所', '所所');
  this.addIrregular('隅', '隅隅');

  /**
   * Notes:
   * -たち exceptions: いたち, おいたち, ついたち, かたち, かおかたち, なりかたち, いでたち, はたち, からたち, なりたち
   * -達 exceptions: 伊達, 男伊達, 栄達, 上意下達, 熟達, 上達, 下意上達, 先達, 送達, 速達, 即日速達, 書留速達, 調達, 通達, 伝達, 到達, 配達, 牛乳配達, 新聞配達, 無料配達, 四通八達, 発達, 未発達, 御用達, 宮内庁御用達, 練達, 闊達
   * -等 exceptions: 一等, 下等, 何等, 均等, 勲等, 高等, 三等, 初等, 上等, 親等, 二親等, 数等, 対等, 中等, 同等, 特等, 二等, 品等, 不等, 平等, 悪平等, 男女平等, 不平等, 優等, 劣等
   */

  // Pluralize
  this.pluralForms.regularForms.push([/^(.+)$/i, '$1たち']);

  // Singularize
  this.singularForms.regularForms.push([/^(.+)たち$/i, function(a, mask) {
    if (['い', 'おい', 'つい', 'か', 'かおか', 'なりか', 'いで', 'は', 'から',
      'なり'].indexOf(mask) >= 0)
      return mask + 'たち';
    return mask;
  }]);
  this.singularForms.regularForms.push([/^(.+)達$/i, function(a, mask) {
    if (['伊', '伊', '栄', '上意下', '熟', '上', '下意上', '先', '送', '速',
      '即日速', '書留速', '調', '通', '伝', '到', '配', '牛乳配', '新聞配', '無料配',
      '四通八', '発', '未発', '御用', '宮内庁御用', '練', '闊'].indexOf(mask) >= 0)
      return mask + '達';
    return mask;
  }]);  // Singularize nouns ending by -等, but not exceptions.
  this.singularForms.regularForms.push([/^(.+)等$/i, function(a, mask) {
    if (['一', '下', '何', '均', '勲', '高', '三', '初', '親', '二親', '数', '対',
      '中', '同', '特', '二', '品', '不', '平', '悪平', '男女平', '不平', '優',
      '劣'].indexOf(mask) >= 0)
      return mask + '等';
    return mask;
  }]);
  this.singularForms.regularForms.push([/^(人間|わたくし|私|てまえ|手前|野郎|やろう|勇者|がき|ガキ|餓鬼|あくとう|悪党|猫|家来)(共|ども)$/i, '$1']);
  this.singularForms.regularForms.push([/^(神様|先生|あなた|大名|女中|奥様)(方|がた)$/i, '$1']);

  this.pluralize = function(token) {
    return this.ize(token, this.pluralForms, this.customPluralForms);
  };

  this.singularize = function(token) {
    return this.ize(token, this.singularForms, this.customSingularForms);
  };
};

util.inherits(NounInflector, SingularPluralInflector);

module.exports = NounInflector;

},{"../form_set":48,"../singular_plural_inflector":53,"util":140}],51:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var SingularPluralInflector = require('./singular_plural_inflector'),
    util = require('util'),
    FormSet = require('./form_set');

function attach() {
    var inflector = this;
    
    String.prototype.singularizeNoun = function() {
        return inflector.singularize(this);
    }
    
    String.prototype.pluralizeNoun = function() {
        return inflector.pluralize(this);
    }
}

var NounInflector = function() {
    this.ambiguous = [
        'bison', 'bream', 'carp', 'chassis', 'cod', 'corps', 'debris', 'deer',
        'diabetes', 'equipment', 'elk', 'fish', 'flounder', 'gallows', 'graffiti',
        'headquarters', 'herpes', 'highjinks', 'homework', 'information',
        'mackerel', 'mews', 'money', 'news', 'rice', 'rabies', 'salmon', 'series',
        'sheep', 'shrimp', 'species', 'swine', 'trout', 'tuna', 'whiting', 'wildebeest'
    ];
    
    this.customPluralForms = [];
    this.customSingularForms = [];    
    this.singularForms = new FormSet();
    this.pluralForms = new FormSet();

    this.attach = attach;

    this.addIrregular("child", "children");
    this.addIrregular("man", "men");
    this.addIrregular("person", "people");
    this.addIrregular("sex", "sexes");
    this.addIrregular("mouse", "mice");
    this.addIrregular("ox", "oxen");
    this.addIrregular("foot", "feet");
    this.addIrregular("tooth", "teeth");
    this.addIrregular("goose", "geese");
    this.addIrregular("ephemeris", "ephemerides");
    
    // see if it is possible to unify the creation of both the singular and
    // plural regexes or maybe even just have one list. with a complete list
    // of rules it may only be possible for some regular forms, but worth a shot    
    this.pluralForms.regularForms.push([/y$/i, 'ies']);
    this.pluralForms.regularForms.push([/ife$/i, 'ives']);
    this.pluralForms.regularForms.push([/(antenn|formul|nebul|vertebr|vit)a$/i, '$1ae']);    
    this.pluralForms.regularForms.push([/(octop|vir|radi|nucle|fung|cact|stimul)us$/i, '$1i']);    
    this.pluralForms.regularForms.push([/(buffal|tomat|tornad)o$/i, '$1oes']);    
    this.pluralForms.regularForms.push([/(sis)$/i, 'ses']);
    this.pluralForms.regularForms.push([/(matr|vert|ind|cort)(ix|ex)$/i, '$1ices']);
    this.pluralForms.regularForms.push([/sses$/i, 'sses']);
    this.pluralForms.regularForms.push([/(x|ch|ss|sh|s|z)$/i, '$1es']);
    this.pluralForms.regularForms.push([/^(?!talis|.*hu)(.*)man$/i, '$1men']);
    this.pluralForms.regularForms.push([/(.*)/i, '$1s']);

    this.singularForms.regularForms.push([/([^v])ies$/i, '$1y']);
    this.singularForms.regularForms.push([/ives$/i, 'ife']);
    this.singularForms.regularForms.push([/(antenn|formul|nebul|vertebr|vit)ae$/i, '$1a']);
    this.singularForms.regularForms.push([/(octop|vir|radi|nucle|fung|cact|stimul)(i)$/i, '$1us']);
    this.singularForms.regularForms.push([/(buffal|tomat|tornad)(oes)$/i, '$1o']);
    this.singularForms.regularForms.push([/(analy|naly|synop|parenthe|diagno|the)ses$/i, '$1sis']);
    this.singularForms.regularForms.push([/(vert|ind|cort)(ices)$/i, '$1ex']);
    // our pluralizer won''t cause this form of appendix (appendicies)
    // but we should handle it
    this.singularForms.regularForms.push([/(matr|append)(ices)$/i, '$1ix']);
    this.singularForms.regularForms.push([/(x|ch|ss|sh|s|z)es$/i, '$1']);
    this.singularForms.regularForms.push([/men$/i, 'man']);
    this.singularForms.regularForms.push([/ss$/i, 'ss']);
    this.singularForms.regularForms.push([/s$/i, '']);
    
    this.pluralize = function (token) {
        return this.ize(token, this.pluralForms, this.customPluralForms);
    };
    
    this.singularize = function(token) {
        return this.ize(token, this.singularForms, this.customSingularForms);
    };
};

util.inherits(NounInflector, SingularPluralInflector);
    
module.exports = NounInflector;

},{"./form_set":48,"./singular_plural_inflector":53,"util":140}],52:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var util = require('util'),
    SingularPluralInflector = require('./singular_plural_inflector'),
    FormSet = require('./form_set');

function attach() {
    var inflector = this;
    
    String.prototype.singularizePresentVerb = function() {
        return inflector.singularize(this);
    }
    
    String.prototype.pluralizePresentVerb = function() {
        return inflector.pluralize(this);
    }
}

var VerbInflector = function() {
    this.ambiguous = [
        'will'
    ];
    
    this.attach = attach;
        
    this.customPluralForms = [];
    this.customSingularForms = [];    
    this.singularForms = new FormSet();
    this.pluralForms = new FormSet();

    this.addIrregular("am", "are");    
    this.addIrregular("is", "are");
    this.addIrregular("was", "were");
    this.addIrregular("has", "have");
    
    this.singularForms.regularForms.push([/ed$/i, 'ed']);
    this.singularForms.regularForms.push([/ss$/i, 'sses']);
    this.singularForms.regularForms.push([/x$/i, 'xes']);    
    this.singularForms.regularForms.push([/(h|z|o)$/i, '$1es']);
    this.singularForms.regularForms.push([/$zz/i, 'zzes']);
    this.singularForms.regularForms.push([/([^a|e|i|o|u])y$/i, '$1ies']);
    this.singularForms.regularForms.push([/$/i, 's']);

    this.pluralForms.regularForms.push([/sses$/i, 'ss']);
    this.pluralForms.regularForms.push([/xes$/i, 'x']);
    this.pluralForms.regularForms.push([/([cs])hes$/i, '$1h']);
    this.pluralForms.regularForms.push([/zzes$/i, 'zz']);
    this.pluralForms.regularForms.push([/([^h|z|o|i])es$/i, '$1e']);
    this.pluralForms.regularForms.push([/ies$/i, 'y']);//flies->fly
    this.pluralForms.regularForms.push([/e?s$/i, '']); 
};

util.inherits(VerbInflector, SingularPluralInflector);

module.exports = VerbInflector;

},{"./form_set":48,"./singular_plural_inflector":53,"util":140}],53:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var TenseInflector = function () {
};

TenseInflector.prototype.addSingular = function(pattern, replacement) {
    this.customSingularForms.push([pattern, replacement]);    
};

TenseInflector.prototype.addPlural = function(pattern, replacement) {
    this.customPluralForms.push([pattern, replacement]);
};

TenseInflector.prototype.ize = function (token, formSet, customForms) {
    var restoreCase = this.restoreCase(token);
    return restoreCase(this.izeRegExps(token, customForms) || this.izeAbiguous(token) ||
        this.izeRegulars(token, formSet) || this.izeRegExps(token, formSet.regularForms) ||
        token);
}

TenseInflector.prototype.izeAbiguous = function (token) {
    if(this.ambiguous.indexOf(token.toLowerCase()) > -1)
        return token.toLowerCase();

    return false;
}

TenseInflector.prototype.pluralize = function (token) {
    return this.ize(token, this.pluralForms, this.customPluralForms);
};

TenseInflector.prototype.singularize = function(token) {
    return this.ize(token, this.singularForms, this.customSingularForms);
};    

var uppercaseify = function(token) {
    return token.toUpperCase();
}
var capitalize = function(token) {
    return token[0].toUpperCase() + token.slice(1);
}
var lowercaseify = function(token) {
    return token.toLowerCase();
}

TenseInflector.prototype.restoreCase = function(token) {
    if (token[0] === token[0].toUpperCase()) {
        if (token[1] && token[1] === token[1].toLowerCase()) {
            return capitalize;
        } else {
            return uppercaseify;
        }
    } else {
        return lowercaseify;
    }
}

TenseInflector.prototype.izeRegulars = function(token, formSet) {
    token = token.toLowerCase();
    if(formSet.irregularForms.hasOwnProperty(token) && formSet.irregularForms[token])
        return formSet.irregularForms[token];

    return false;
}

TenseInflector.prototype.addForm = function(singularTable, pluralTable, singular, plural) {
    singular = singular.toLowerCase();
    plural = plural.toLowerCase();
    pluralTable[singular] = plural;
    singularTable[plural] = singular;
};

TenseInflector.prototype.addIrregular = function(singular, plural) {
    this.addForm(this.singularForms.irregularForms, this.pluralForms.irregularForms, singular, plural);
};

TenseInflector.prototype.izeRegExps = function(token, forms) {
        var i, form;
        for(i = 0; i < forms.length; i++) {
            form = forms[i];
            
            if(token.match(form[0]))
                return token.replace(form[0], form[1]);
        }
        
        return false;
    }

module.exports = TenseInflector;

},{}],54:[function(require,module,exports){
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var _ = require("underscore")._,
    Tokenizer = require('../tokenizers/regexp_tokenizer').WordTokenizer,
    tokenizer = new Tokenizer();

exports.setTokenizer = function(t) {
    if(!_.isFunction(t.tokenize))
        throw new Error('Expected a valid Tokenizer');
    tokenizer = t;
}

exports.ngrams = function(sequence, n, startSymbol, endSymbol) {
    return ngrams(sequence, n, startSymbol, endSymbol);
}

exports.bigrams = function(sequence, startSymbol, endSymbol) {
    return ngrams(sequence, 2, startSymbol, endSymbol);
}

exports.trigrams = function(sequence, startSymbol, endSymbol) {
    return ngrams(sequence, 3, startSymbol, endSymbol);
}

exports.multrigrams = function(sequence, n, startSymbol, endSymbol) {
    return ngrams(sequence, n, startSymbol, endSymbol);
}

var ngrams = function(sequence, n, startSymbol, endSymbol) {
    var result = [];
    
    if (!_(sequence).isArray()) {
        sequence = tokenizer.tokenize(sequence);
    }

    var count = _.max([0, sequence.length - n + 1]);

    // Check for left padding    
    if(typeof startSymbol !== "undefined" && startSymbol !== null) {
        // Create an array of (n) start symbols
        var blanks = [];
        for(var i = 0 ; i < n ; i++) {
            blanks.push(startSymbol);
        }

        // Create the left padding
        for(var p = n - 1 ; p > 0 ; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            result.push(blanks.slice(0, p).concat(sequence.slice(0, n - p)));
        }
    }

    // Build the complete ngrams
    for (var i = 0; i < count; i++) {
        result.push(sequence.slice(i, i + n));
    }

    // Check for right padding
    if(typeof endSymbol !== "undefined" && endSymbol !== null) {
        // Create an array of (n) end symbols
        var blanks = [];
        for(var i = 0 ; i < n ; i++) {
            blanks.push(endSymbol);
        }

        // create the right padding
        for(var p = n - 1 ; p > 0 ; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            result.push(sequence.slice(sequence.length - p, sequence.length).concat(blanks.slice(0, n - p)));
        }
    }
    
    return result;
}


},{"../tokenizers/regexp_tokenizer":98,"underscore":137}],55:[function(require,module,exports){
/*
Copyright (c) 2014, Lee Wenzhu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var _ = require("underscore")._;

exports.ngrams = function(sequence, n, startSymbol, endSymbol) {
    return ngrams(sequence, n, startSymbol, endSymbol);
}

exports.bigrams = function(sequence, startSymbol, endSymbol) {
    return ngrams(sequence, 2, startSymbol, endSymbol);
}

exports.trigrams = function(sequence, startSymbol, endSymbol) {
    return ngrams(sequence, 3, startSymbol, endSymbol);
}

var ngrams = function(sequence, n, startSymbol, endSymbol) {
    var result = [], i;
    
    if (!_(sequence).isArray()) {
        sequence = sequence.split('');
    }

    var count = _.max([0, sequence.length - n + 1]);

    // Check for left padding    
    if(typeof startSymbol !== "undefined" && startSymbol !== null) {
        // Create an array of (n) start symbols
        var blanks = [];
        for(i = 0 ; i < n ; i++) {
            blanks.push(startSymbol);
        }

        // Create the left padding
        for(var p = n - 1 ; p > 0 ; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            result.push(blanks.slice(0, p).concat(sequence.slice(0, n - p)));
        }
    }

    // Build the complete ngrams
    for (i = 0; i < count; i++) {
        result.push(sequence.slice(i, i + n));
    }

    // Check for right padding
    if(typeof endSymbol !== "undefined" && endSymbol !== null) {
        // Create an array of (n) end symbols
        var blanks = [];
        for(var i = 0 ; i < n ; i++) {
            blanks.push(endSymbol);
        }

        // create the right padding
        for(var p = n - 1 ; p > 0 ; p--) {
            // Create a tuple of (p) start symbols and (n - p) words
            result.push(sequence.slice(sequence.length - p, sequence.length).concat(blanks.slice(0, n - p)));
        }
    }
    
    return result;
};


},{"underscore":137}],56:[function(require,module,exports){
/*
 Copyright (c) 2013, Kenneth Koch

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * The english normalizer will create a string in which all contractions are expanded to their 
 * full meaning (i.e. "we'll" becomes "we will"). 
 *
 * It currently works off a conversion table and falls back to a set of rules.
 * Since it is applied first, the conversion table provides an "override" for the rules.
 **/
var replacer = require('../util/utils').replacer;

var conversionTable = {
	"can't":"can not",
	"won't":"will not",
	"couldn't've":"could not have",
	"i'm":"I am",
	"how'd":"how did"
};

var rules = [
	{ regex: /([azAZ]*)n\'[tT]/g, output: "$1 not" },
	{ regex: /([azAZ]*)\'[sS]/g, output: "$1 is" },
	{ regex: /([azAZ]*)\'[lL][lL]/g, output: "$1 will" },
	{ regex: /([azAZ]*)\'[rR][eE]/g, output: "$1 are" },
	{ regex: /([azAZ]*)\'[vV][eE]/g, output: "$1 have" },
	{ regex: /([azAZ]*)\'[dD]/g, output: "$1 would" }
];

// Accepts a list of tokens to expand.
var normalize_tokens = function(tokens) {
	if(typeof tokens === "string") {
		tokens = [tokens];
	}
        var results = [];
	var rule_count = rules.length;
	var num_tokens = tokens.length;
        var i, token, r, rule;
    
        for (i = 0; i < num_tokens; i++) {
            token = tokens[i];
            // Check the conversion table
            if (conversionTable[token.toLowerCase()]) {
                results = results.concat(conversionTable[token.toLowerCase()].split(/\W+/));
            }
            
            // Apply the rules
            else {
                var matched = false;
                for ( r = 0; r < rule_count; r++) {
                    rule = rules[r];
                    if (token.match(rule.regex)) {
                        results = results.concat(token.replace(rule.regex, rule.output).split(/\W+/));
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    results.push(token);
                }
            }
        }

	return results;
};





// export the relevant stuff.
exports.normalize_tokens = normalize_tokens;





},{"../util/utils":121}],57:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * Normalize Japanese inputs and expose function to perform several conversions.
 *
 * Note: The space character is treated like a roman character as it usually
 *   has the same width as them in Japanese texts.
 *
 * \@todo Replace characters range from ㈠ to ㉃, ㊀ to ㊰ and ㇰ to ㇿ.
 * \@todo Lazy initializations of conversionTables and converters.
 * \@todo Would fixHalfwidthKana be useful?
 *
 * Descriptions of functions exposed:
 * normalizeJapanese 「全角」英字・数字を「半角」、「半角」記・カタカナを「全角」に変換
 * converters.fullwidthToHalfwidth.alphabet    「全角」英字を「半角」に変換
 * converters.halfwidthToFullwidth.alphabet    「半角」英字を「全角」に変換
 * converters.fullwidthToHalfwidth.numbers     「全角」数字を「半角」に変換
 * converters.halfwidthToFullwidth.numbers     「半角」数字を「全角」に変換 「全角」スペースを「半角」
 * converters.fullwidthToHalfwidth.punctuation 「全角」記号を「半角」に変換 「半角」スペースを「全角」
 * converters.halfwidthToFullwidth.punctuation 「半角」記号を「全角」に変換
 * converters.fullwidthToHalfwidth.katakana    「全角カタカナ」を「半角カタカナ」に変換
 * converters.halfwidthToFullwidth.katakana    「半角カタカナ」を「全角カタカナ」に変換
 * converters.hiraganaToKatakana               「カタカナ」を「ひらがな」に変換
 * converters.katakanaToHiragana               「ひらがな」を「カタカナ」に変換
 */

var flip = require('../util/utils.js').flip;
var merge = require('../util/utils.js').merge;
var replacer = require('../util/utils').replacer;

// From http://fernweh.jp/b/mb_convert_kana_js/
var conversionTables = {
  fullwidthToHalfwidth: {
    alphabet: {
      'ａ': 'a',
      'ｂ': 'b',
      'ｃ': 'c',
      'ｄ': 'd',
      'ｅ': 'e',
      'ｆ': 'f',
      'ｇ': 'g',
      'ｈ': 'h',
      'ｉ': 'i',
      'ｊ': 'j',
      'ｋ': 'k',
      'ｌ': 'l',
      'ｍ': 'm',
      'ｎ': 'n',
      'ｏ': 'o',
      'ｐ': 'p',
      'ｑ': 'q',
      'ｒ': 'r',
      'ｓ': 's',
      'ｔ': 't',
      'ｕ': 'u',
      'ｖ': 'v',
      'ｗ': 'w',
      'ｘ': 'x',
      'ｙ': 'y',
      'ｚ': 'z',
      'Ａ': 'A',
      'Ｂ': 'B',
      'Ｃ': 'C',
      'Ｄ': 'D',
      'Ｅ': 'E',
      'Ｆ': 'F',
      'Ｇ': 'G',
      'Ｈ': 'H',
      'Ｉ': 'I',
      'Ｊ': 'J',
      'Ｋ': 'K',
      'Ｌ': 'L',
      'Ｍ': 'M',
      'Ｎ': 'N',
      'Ｏ': 'O',
      'Ｐ': 'P',
      'Ｑ': 'Q',
      'Ｒ': 'R',
      'Ｓ': 'S',
      'Ｔ': 'T',
      'Ｕ': 'U',
      'Ｖ': 'V',
      'Ｗ': 'W',
      'Ｘ': 'X',
      'Ｙ': 'Y',
      'Ｚ': 'Z',
      '　': ' ' // Fullwidth space
    },

    numbers: {
      '０': '0',
      '１': '1',
      '２': '2',
      '３': '3',
      '４': '4',
      '５': '5',
      '６': '6',
      '７': '7',
      '８': '8',
      '９': '9'
    },

    symbol: {
      '＿': '_',
      '－': '-',
      '，': ',',
      '；': ';',
      '：': ':',
      '！': '!',
      '？': '?',
      '．': '.',
      '（': '(',
      '）': ')',
      '［': '[',
      '］': ']',
      '｛': '{',
      '｝': '}',
      '＠': '@',
      '＊': '*',
      '＼': '\\',
      '／': '/',
      '＆': '&',
      '＃': '#',
      '％': '%',
      '｀': '`',
      '＾': '^',
      '＋': '+',
      '＜': '<',
      '＝': '=',
      '＞': '>',
      '｜': '|',
      // Never converted: '～': '~',
      '≪': '«',
      '≫': '»',
      '─': '-',
      '＄': '$',
      '＂': '"'
    },

    purePunctuation: {
      '、': '､',
      '。': '｡',
      '・': '･',
      '「': '｢',
      '」': '｣'
    },

    punctuation: {},

    katakana: {
      '゛': 'ﾞ',
      '゜': 'ﾟ',
      'ー': 'ｰ',

      'ヴ': 'ｳﾞ',
      'ガ': 'ｶﾞ',
      'ギ': 'ｷﾞ',
      'グ': 'ｸﾞ',
      'ゲ': 'ｹﾞ',
      'ゴ': 'ｺﾞ',
      'ザ': 'ｻﾞ',
      'ジ': 'ｼﾞ',
      'ズ': 'ｽﾞ',
      'ゼ': 'ｾﾞ',
      'ゾ': 'ｿﾞ',
      'ダ': 'ﾀﾞ',
      'ヂ': 'ﾁﾞ',
      'ヅ': 'ﾂﾞ',
      'デ': 'ﾃﾞ',
      'ド': 'ﾄﾞ',
      'バ': 'ﾊﾞ',
      'パ': 'ﾊﾟ',
      'ビ': 'ﾋﾞ',
      'ピ': 'ﾋﾟ',
      'ブ': 'ﾌﾞ',
      'プ': 'ﾌﾟ',
      'ベ': 'ﾍﾞ',
      'ペ': 'ﾍﾟ',
      'ボ': 'ﾎﾞ',
      'ポ': 'ﾎﾟ',

      'ァ': 'ｧ',
      'ア': 'ｱ',
      'ィ': 'ｨ',
      'イ': 'ｲ',
      'ゥ': 'ｩ',
      'ウ': 'ｳ',
      'ェ': 'ｪ',
      'エ': 'ｴ',
      'ォ': 'ｫ',
      'オ': 'ｵ',
      'カ': 'ｶ',
      'キ': 'ｷ',
      'ク': 'ｸ',
      'ケ': 'ｹ',
      'コ': 'ｺ',
      'サ': 'ｻ',
      'シ': 'ｼ',
      'ス': 'ｽ',
      'セ': 'ｾ',
      'ソ': 'ｿ',
      'タ': 'ﾀ',
      'チ': 'ﾁ',
      'ッ': 'ｯ',
      'ツ': 'ﾂ',
      'テ': 'ﾃ',
      'ト': 'ﾄ',
      'ナ': 'ﾅ',
      'ニ': 'ﾆ',
      'ヌ': 'ﾇ',
      'ネ': 'ﾈ',
      'ノ': 'ﾉ',
      'ハ': 'ﾊ',
      'ヒ': 'ﾋ',
      'フ': 'ﾌ',
      'ヘ': 'ﾍ',
      'ホ': 'ﾎ',
      'マ': 'ﾏ',
      'ミ': 'ﾐ',
      'ム': 'ﾑ',
      'メ': 'ﾒ',
      'モ': 'ﾓ',
      'ャ': 'ｬ',
      'ヤ': 'ﾔ',
      'ュ': 'ｭ',
      'ユ': 'ﾕ',
      'ョ': 'ｮ',
      'ヨ': 'ﾖ',
      'ラ': 'ﾗ',
      'リ': 'ﾘ',
      'ル': 'ﾙ',
      'レ': 'ﾚ',
      'ロ': 'ﾛ',
      'ワ': 'ﾜ',
      'ヲ': 'ｦ',
      'ン': 'ﾝ'
    }
  },

  halfwidthToFullwidth: {}
};

var fixFullwidthKana = {
  'ゝ゛': 'ゞ',
  'ヽ゛': 'ヾ',

  'う゛': 'ゔ',
  'か゛': 'が',
  'き゛': 'ぎ',
  'く゛': 'ぐ',
  'け゛': 'げ',
  'こ゛': 'ご',
  'さ゛': 'ざ',
  'し゛': 'じ',
  'す゛': 'ず',
  'せ゛': 'ぜ',
  'そ゛': 'ぞ',
  'た゛': 'だ',
  'ち゛': 'ぢ',
  'つ゛': 'づ',
  'て゛': 'で',
  'と゛': 'ど',
  'は゛': 'ば',
  'は゜': 'ぱ',
  'ひ゛': 'び',
  'ひ゜': 'ぴ',
  'ふ゛': 'ぶ',
  'ふ゜': 'ぷ',
  'へ゛': 'べ',
  'へ゜': 'ぺ',
  'ほ゛': 'ぼ',
  'ほ゜': 'ぽ',
  'っな': 'んな',
  'っに': 'んに',
  'っぬ': 'んぬ',
  'っね': 'んね',
  'っの': 'んの',

  'ウ゛': 'ヴ',
  'カ゛': 'ガ',
  'キ゛': 'ギ',
  'ク゛': 'グ',
  'ケ゛': 'ゲ',
  'コ゛': 'ゴ',
  'サ゛': 'ザ',
  'シ゛': 'ジ',
  'ス゛': 'ズ',
  'セ゛': 'ゼ',
  'ソ゛': 'ゾ',
  'タ゛': 'ダ',
  'チ゛': 'ヂ',
  'ツ゛': 'ヅ',
  'テ゛': 'デ',
  'ト゛': 'ド',
  'ハ゛': 'バ',
  'ハ゜': 'パ',
  'ヒ゛': 'ビ',
  'ヒ゜': 'ピ',
  'フ゛': 'ブ',
  'フ゜': 'プ',
  'ヘ゛': 'ベ',
  'ヘ゜': 'ペ',
  'ホ゛': 'ボ',
  'ホ゜': 'ポ',
  'ッナ': 'ンナ',
  'ッニ': 'ンニ',
  'ッヌ': 'ンヌ',
  'ッネ': 'ンネ',
  'ッノ': 'ンノ'
};

var fixCompositeSymbolsTable = {
  '㋀': '1月',
  '㋁': '2月',
  '㋂': '3月',
  '㋃': '4月',
  '㋄': '5月',
  '㋅': '6月',
  '㋆': '7月',
  '㋇': '8月',
  '㋈': '9月',
  '㋉': '10月',
  '㋊': '11月',
  '㋋': '12月',

  '㏠': '1日',
  '㏡': '2日',
  '㏢': '3日',
  '㏣': '4日',
  '㏤': '5日',
  '㏥': '6日',
  '㏦': '7日',
  '㏧': '8日',
  '㏨': '9日',
  '㏩': '10日',
  '㏪': '11日',
  '㏫': '12日',
  '㏬': '13日',
  '㏭': '14日',
  '㏮': '15日',
  '㏯': '16日',
  '㏰': '17日',
  '㏱': '18日',
  '㏲': '19日',
  '㏳': '20日',
  '㏴': '21日',
  '㏵': '22日',
  '㏶': '23日',
  '㏷': '24日',
  '㏸': '25日',
  '㏹': '26日',
  '㏺': '27日',
  '㏻': '28日',
  '㏼': '29日',
  '㏽': '30日',
  '㏾': '31日',

  '㍘': '0点',
  '㍙': '1点',
  '㍚': '2点',
  '㍛': '3点',
  '㍜': '4点',
  '㍝': '5点',
  '㍞': '6点',
  '㍟': '7点',
  '㍠': '8点',
  '㍡': '9点',
  '㍢': '10点',
  '㍣': '11点',
  '㍤': '12点',
  '㍥': '13点',
  '㍦': '14点',
  '㍧': '15点',
  '㍨': '16点',
  '㍩': '17点',
  '㍪': '18点',
  '㍫': '19点',
  '㍬': '20点',
  '㍭': '21点',
  '㍮': '22点',
  '㍯': '23点',
  '㍰': '24点',

  '㍻': '平成',
  '㍼': '昭和',
  '㍽': '大正',
  '㍾': '明治',
  '㍿': '株式会社',

  '㌀': 'アパート',
  '㌁': 'アルファ',
  '㌂': 'アンペア',
  '㌃': 'アール',
  '㌄': 'イニング',
  '㌅': 'インチ',
  '㌆': 'ウオン',
  '㌇': 'エスクード',
  '㌈': 'エーカー',
  '㌉': 'オンス',
  '㌊': 'オーム',
  '㌋': 'カイリ', //海里
  '㌌': 'カラット',
  '㌍': 'カロリー',
  '㌎': 'ガロン',
  '㌏': 'ガンマ',
  '㌐': 'ギガ',
  '㌑': 'ギニー',
  '㌒': 'キュリー',
  '㌓': 'ギルダー',
  '㌔': 'キロ',
  '㌕': 'キログラム',
  '㌖': 'キロメートル',
  '㌗': 'キロワット',
  '㌘': 'グラム',
  '㌙': 'グラムトン',
  '㌚': 'クルゼイロ',
  '㌛': 'クローネ',
  '㌜': 'ケース',
  '㌝': 'コルナ',
  '㌞': 'コーポ',
  '㌟': 'サイクル',
  '㌠': 'サンチーム',
  '㌡': 'シリング',
  '㌢': 'センチ',
  '㌣': 'セント',
  '㌤': 'ダース',
  '㌥': 'デシ',
  '㌦': 'ドル',
  '㌧': 'トン',
  '㌨': 'ナノ',
  '㌩': 'ノット',
  '㌪': 'ハイツ',
  '㌫': 'パーセント',
  '㌬': 'パーツ',
  '㌭': 'バーレル',
  '㌮': 'ピアストル',
  '㌯': 'ピクル',
  '㌰': 'ピコ',
  '㌱': 'ビル',
  '㌲': 'ファラッド',
  '㌳': 'フィート',
  '㌴': 'ブッシェル',
  '㌵': 'フラン',
  '㌶': 'ヘクタール',
  '㌷': 'ペソ',
  '㌸': 'ペニヒ',
  '㌹': 'ヘルツ',
  '㌺': 'ペンス',
  '㌻': 'ページ',
  '㌼': 'ベータ',
  '㌽': 'ポイント',
  '㌾': 'ボルト',
  '㌿': 'ホン',
  '㍀': 'ポンド',
  '㍁': 'ホール',
  '㍂': 'ホーン',
  '㍃': 'マイクロ',
  '㍄': 'マイル',
  '㍅': 'マッハ',
  '㍆': 'マルク',
  '㍇': 'マンション',
  '㍈': 'ミクロン',
  '㍉': 'ミリ',
  '㍊': 'ミリバール',
  '㍋': 'メガ',
  '㍌': 'メガトン',
  '㍍': 'メートル',
  '㍎': 'ヤード',
  '㍏': 'ヤール',
  '㍐': 'ユアン',
  '㍑': 'リットル',
  '㍒': 'リラ',
  '㍓': 'ルピー',
  '㍔': 'ルーブル',
  '㍕': 'レム',
  '㍖': 'レントゲン',
  '㍗': 'ワット'
};

// punctuation is pure_punctuation
conversionTables.fullwidthToHalfwidth.punctuation = merge(
    conversionTables.fullwidthToHalfwidth.symbol,
    conversionTables.fullwidthToHalfwidth.purePunctuation
)

// Fill in the conversion tables with the flipped tables.
conversionTables.halfwidthToFullwidth.alphabet = flip(conversionTables.fullwidthToHalfwidth.alphabet);
conversionTables.halfwidthToFullwidth.numbers = flip(conversionTables.fullwidthToHalfwidth.numbers);
conversionTables.halfwidthToFullwidth.symbol = flip(conversionTables.fullwidthToHalfwidth.symbol);
conversionTables.halfwidthToFullwidth.purePunctuation = flip(conversionTables.fullwidthToHalfwidth.purePunctuation);
conversionTables.halfwidthToFullwidth.punctuation = flip(conversionTables.fullwidthToHalfwidth.punctuation);
conversionTables.halfwidthToFullwidth.katakana = flip(conversionTables.fullwidthToHalfwidth.katakana);

// Build the normalization table.
conversionTables.normalize = merge(
    conversionTables.fullwidthToHalfwidth.alphabet,
    conversionTables.fullwidthToHalfwidth.numbers,
    conversionTables.fullwidthToHalfwidth.symbol,
    conversionTables.halfwidthToFullwidth.purePunctuation,
    conversionTables.halfwidthToFullwidth.katakana
    );

var converters = {
  fullwidthToHalfwidth: {
    alphabet: replacer(conversionTables.fullwidthToHalfwidth.alphabet),
    numbers: replacer(conversionTables.fullwidthToHalfwidth.numbers),
    symbol: replacer(conversionTables.fullwidthToHalfwidth.symbol),
    purePunctuation: replacer(conversionTables.fullwidthToHalfwidth.purePunctuation),
    punctuation: replacer(conversionTables.fullwidthToHalfwidth.punctuation),
    katakana: replacer(conversionTables.fullwidthToHalfwidth.katakana)
  },

  halfwidthToFullwidth: {
    alphabet: replacer(conversionTables.halfwidthToFullwidth.alphabet),
    numbers: replacer(conversionTables.halfwidthToFullwidth.numbers),
    symbol: replacer(conversionTables.halfwidthToFullwidth.symbol),
    purePunctuation: replacer(conversionTables.halfwidthToFullwidth.purePunctuation),
    punctuation: replacer(conversionTables.halfwidthToFullwidth.punctuation),
    katakana: replacer(conversionTables.halfwidthToFullwidth.katakana)
  },

  fixFullwidthKana: replacer(fixFullwidthKana),
  normalize: replacer(conversionTables.normalize)
};

var fixCompositeSymbols = replacer(fixCompositeSymbolsTable);


/**
 * Convert hiragana to fullwidth katakana.
 * According to http://jsperf.com/converting-japanese, these implementations are
 * faster than using lookup tables.
 *
 * @param {string} str A string.
 * @return {string} A string not containing hiragana.
 */
converters.hiraganaToKatakana = function(str) {
  str = converters.halfwidthToFullwidth.katakana(str);
  str = converters.fixFullwidthKana(str);

  str = str.replace(/ゝ/g, 'ヽ');
  str = str.replace(/ゞ/g, 'ヾ');
  //str = str.replace(/?/g, '𛀀'); // Letter archaic E

  str = str.replace(/[ぁ-ゖ]/g, function(str) {
    return String.fromCharCode(str.charCodeAt(0) + 96);
  });

  return str;
};


/**
 * Convert katakana to hiragana.
 *
 * @param {string} str A string.
 * @return {string} A string not containing katakana.
 */
converters.katakanaToHiragana = function(str) {
  str = converters.halfwidthToFullwidth.katakana(str);
  str = converters.fixFullwidthKana(str);

  str = str.replace(/ヽ/g, 'ゝ');
  str = str.replace(/ヾ/g, 'ゞ');
  //str = str.replace(/?/g, '𛀁'); // Letter archaic E

  str = str.replace(/[ァ-ヶ]/g, function(str) {
    return String.fromCharCode(str.charCodeAt(0) - 96);
  });

  return str;
};


/**
 * Fix kana and apply the following processes;
 * * Replace repeat characters
 * * Alphabet to halfwidth
 * * Numbers to halfwidth
 * * Punctuation to fullwidth
 * * Katakana to fullwidth
 * * Fix fullwidth kana
 * * Replace composite symbols
 *
 * @param {string} str
 * @return {string}
 */
var normalize_ja = function(str) {
  // Replace repeat characters.
  str = str
    .replace(/(..)々々/g, '$1$1')
    .replace(/(.)々/g, '$1$1');

  str = converters.normalize(str);
  str = converters.fixFullwidthKana(str);

  // Replace composite symbols.
  str = fixCompositeSymbols(str);

  return str;
};

exports.normalize_ja = normalize_ja;
exports.converters = converters;

},{"../util/utils":121,"../util/utils.js":121}],58:[function(require,module,exports){
/*
 Copyright (c) 2014, Kristoffer Brabrand

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * Remove commonly used diacritic marks from a string as these
 * are not used in a consistent manner. Leave only ä, ö, ü.
 */
var remove_diacritics = function(text) {
    text = text.replace('à', 'a');
    text = text.replace('À', 'A');
    text = text.replace('á', 'a');
    text = text.replace('Á', 'A');
    text = text.replace('â', 'a');
    text = text.replace('Â', 'A');
    text = text.replace('ç', 'c');
    text = text.replace('Ç', 'C');
    text = text.replace('è', 'e');
    text = text.replace('È', 'E');
    text = text.replace('é', 'e');
    text = text.replace('É', 'E');
    text = text.replace('ê', 'e');
    text = text.replace('Ê', 'E');
    text = text.replace('î', 'i');
    text = text.replace('Î', 'I');
    text = text.replace('ñ', 'n');
    text = text.replace('Ñ', 'N');
    text = text.replace('ó', 'o');
    text = text.replace('Ó', 'O');
    text = text.replace('ô', 'o');
    text = text.replace('Ô', 'O');
    text = text.replace('û', 'u');
    text = text.replace('Û', 'U');
    text = text.replace('š', 's');
    text = text.replace('Š', 'S');

    return text;
};

// export the relevant stuff.
exports.remove_diacritics = remove_diacritics;
},{}],59:[function(require,module,exports){
/*
 Copyright (c) 2012, Alexy Maslennikov

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * Script to remove diacritics. Original source was taken from
 * http://lehelk.com/2011/05/06/script-to-remove-diacritics/
 */
var diacriticsRemovalMap = [
    {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
    {'base':'AA','letters':/[\uA732]/g},
    {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
    {'base':'AO','letters':/[\uA734]/g},
    {'base':'AU','letters':/[\uA736]/g},
    {'base':'AV','letters':/[\uA738\uA73A]/g},
    {'base':'AY','letters':/[\uA73C]/g},
    {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
    {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
    {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
    {'base':'DZ','letters':/[\u01F1\u01C4]/g},
    {'base':'Dz','letters':/[\u01F2\u01C5]/g},
    {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
    {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
    {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
    {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
    {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
    {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
    {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
    {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
    {'base':'LJ','letters':/[\u01C7]/g},
    {'base':'Lj','letters':/[\u01C8]/g},
    {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
    {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
    {'base':'NJ','letters':/[\u01CA]/g},
    {'base':'Nj','letters':/[\u01CB]/g},
    {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
    {'base':'OE','letters':/[\u0152]/g},
    {'base':'OI','letters':/[\u01A2]/g},
    {'base':'OO','letters':/[\uA74E]/g},
    {'base':'OU','letters':/[\u0222]/g},
    {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
    {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
    {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
    {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
    {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
    {'base':'TZ','letters':/[\uA728]/g},
    {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
    {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
    {'base':'VY','letters':/[\uA760]/g},
    {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
    {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
    {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
    {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
    {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
    {'base':'aa','letters':/[\uA733]/g},
    {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
    {'base':'ao','letters':/[\uA735]/g},
    {'base':'au','letters':/[\uA737]/g},
    {'base':'av','letters':/[\uA739\uA73B]/g},
    {'base':'ay','letters':/[\uA73D]/g},
    {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
    {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
    {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
    {'base':'dz','letters':/[\u01F3\u01C6]/g},
    {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
    {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
    {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
    {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
    {'base':'hv','letters':/[\u0195]/g},
    {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
    {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
    {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
    {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
    {'base':'lj','letters':/[\u01C9]/g},
    {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
    {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
    {'base':'nj','letters':/[\u01CC]/g},
    {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
    {'base':'oe','letters':/[\u0153]/g},
    {'base':'oi','letters':/[\u01A3]/g},
    {'base':'ou','letters':/[\u0223]/g},
    {'base':'oo','letters':/[\uA74F]/g},
    {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
    {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
    {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
    {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
    {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
    {'base':'tz','letters':/[\uA729]/g},
    {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
    {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
    {'base':'vy','letters':/[\uA761]/g},
    {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
    {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
    {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
    {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
];


module.exports = function(str) {
	var rules = diacriticsRemovalMap;
	for (var i = 0; i < rules.length; i++) {
		str = str.replace(rules[i].letters, rules[i].base);
	}
	return str;
};

},{}],60:[function(require,module,exports){
/*
Copyright (c) 2012, Alexy Maslenninkov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
 * Daitch-Mokotoff Soundex Coding
 *
 * The Daitch-Mokotoff Soundex System was created by Randy Daitch and Gary
 * Mokotoff of the Jewish Genealogical Society because they concluded the system
 * developed by Robert Russell in 1918, and in use today by the U.S. National
 * Archives and Records Administration (NARA) does not apply well to many Slavic
 * and Yiddish surnames.  It also includes refinements that are independent of
 * ethnic considerations.
 *
 * The rules for converting surnames into D-M Code numbers are listed below.
 * They are followed by the coding chart.
 *
 * 1. Names are coded to six digits, each digit representing a sound listed in
 * the coding chart (below).
 *
 * 2. When a name lacks enough coded sounds for six digits, use zeros to fill to
 * six digits. GOLDEN which has only four coded sounds [G-L-D-N] is coded as
 * 583600.
 *
 * 3. The letters A, E, I, O, U, J, and Y are always coded at the beginning of a
 * name as in Alpert 087930. In any other situation, they are ignored except
 * when two of them form a pair and the pair comes before a vowel, as in Breuer
 * 791900 but not Freud.
 *
 * 4. The letter H is coded at the beginning of a name, as in Haber 579000, or
 * preceding a vowel, as in Manheim 665600, otherwise it is not coded.
 *
 * 5. When adjacent sounds can combine to form a larger sound, they are given
 * the code number of the larger sound.  Mintz which is not coded MIN-T-Z but
 * MIN-TZ 664000.
 *
 * 6. When adjacent letters have the same code number, they are coded as one
 * sound, as in TOPF, which is not coded TO-P-F 377000 but TO-PF 370000.
 * Exceptions to this rule are the letter combinations MN and NM, whose letters
 * are coded separately, as in Kleinman, which is coded 586660 not 586600.
 *
 * 7. When a surname consists or more than one word, it is coded as if one word,
 * such as Ben Aron which is treated as Benaron.
 *
 * 8. Several letter and letter combinations pose the problem that they may
 * sound in one of two ways.  The letter and letter combinations CH, CK, C, J,
 * and RS are assigned two possible code numbers.
 *
 * For more info, see http://www.jewishgen.org/InfoFiles/soundex.html
 */

/**
 * D-M transformation table in the form of finite-state machine.
 * Every element of the table having member with zero index represents
 * legal FSM state; every non-zero key is the transition rule.
 *
 * Every legal state comprises tree values chosen according to the position
 * of the letter combination in the word:
 *   0: start of a word;
 *   1: before a vowel;
 *   2: any other situation.
 */
var codes = {
    A: {
        0: [0, -1, -1],
        I: [[0, 1, -1]],
        J: [[0, 1, -1]],
        Y: [[0, 1, -1]],
        U: [[0, 7, -1]]},
    B: [[7, 7, 7]],
    C: {
        0: [5, 5, 5],
        Z: {0: [4, 4, 4], S: [[4, 4, 4]]},
        S: {0: [4, 4, 4], Z: [[4, 4, 4]]},
        K: [[5, 5, 5], [45, 45, 45]],
        H: {0: [5, 5, 5], S: [[5, 54, 54]]}},
    D: {
        0: [3, 3, 3],
        T: [[3, 3, 3]],
        Z: {0: [4, 4, 4], H: [[4, 4, 4]], S: [[4, 4, 4]]},
        S: {0: [4, 4, 4], H: [[4, 4, 4]], Z: [[4, 4, 4]]},
        R: {S: [[4, 4, 4]], Z: [[4, 4, 4]]}},
    E: {
        0: [0, -1, -1],
        I: [[0, 1, -1]],
        J: [[0, 1, -1]],
        Y: [[0, 1, -1]],
        U: [[1, 1, -1]],
        W: [[1, 1, -1]]},
    F: {
        0: [7, 7, 7],
        B: [[7, 7, 7]]},
    G: [[5, 5, 5]],
    H: [[5, 5, -1]],
    I: {
        0: [0, -1, -1],
        A: [[1, -1, -1]],
        E: [[1, -1, -1]],
        O: [[1, -1, -1]],
        U: [[1, -1, -1]]},
    J: [[4, 4, 4]],
    K: {
        0: [5, 5, 5],
        H: [[5, 5, 5]],
        S: [[5, 54, 54]]},
    L: [[8, 8, 8]],
    M: {
        0: [6, 6, 6],
        N: [[66, 66, 66]]},
    N: {
        0: [6, 6, 6],
        M: [[66, 66, 66]]},
    O: {
        0: [0, -1, -1],
        I: [[0, 1, -1]],
        J: [[0, 1, -1]],
        Y: [[0, 1, -1]]},
    P: {
        0: [7, 7, 7],
        F: [[7, 7, 7]],
        H: [[7, 7, 7]]},
    Q: [[5, 5, 5]],
    R: {
        0: [9, 9, 9],
        Z: [[94, 94, 94], [94, 94, 94]],
        S: [[94, 94, 94], [94, 94, 94]]},
    S: {
        0: [4, 4, 4],
        Z: {0: [4, 4, 4], T: [[2, 43, 43]], C: {Z: [[2, 4, 4]], S: [[2, 4, 4]]}, D: [[2, 43, 43]]},
        D: [[2, 43, 43]],
        T: {0: [2, 43, 43], R: {Z: [[2, 4, 4]], S: [[2, 4, 4]]}, C: {H: [[2, 4, 4]]}, S: {H: [[2, 4, 4]], C: {H: [[2, 4, 4]]}}},
        C: {0: [2, 4, 4], H: {0: [4, 4, 4], T: {0: [2, 43, 43], S: {C: {H: [[2, 4, 4]]}, H: [[2, 4, 4]]}, C: {H: [[2, 4, 4]]}}, D: [[2, 43, 43]]}},
        H: {0: [4, 4, 4], T: {0: [2, 43, 43], C: {H: [[2, 4, 4]]}, S: {H: [[2, 4, 4]]}}, C: {H: [[2, 4, 4]]}, D: [[2, 43, 43]]}},
    T: {
        0: [3, 3, 3],
        C: {0: [4, 4, 4], H: [[4, 4, 4]]},
        Z: {0: [4, 4, 4], S: [[4, 4, 4]]},
        S: {0: [4, 4, 4], Z: [[4, 4, 4]], H: [[4, 4, 4]], C: {H: [[4, 4, 4]]}},
        T: {S: {0: [4, 4, 4], Z: [[4, 4, 4]], C: {H: [[4, 4, 4]]}}, C: {H: [[4, 4, 4]]}, Z: [[4, 4, 4]]},
        H: [[3, 3, 3]],
        R: {Z: [[4, 4, 4]], S: [[4, 4, 4]]}},
    U: {
        0: [0, -1, -1],
        E: [[0, -1, -1]],
        I: [[0, 1, -1]],
        J: [[0, 1, -1]],
        Y: [[0, 1, -1]]},
    V: [[7, 7, 7]],
    W: [[7, 7, 7]],
    X: [[5, 54, 54]],
    Y: [[1, -1, -1]],
    Z: {
        0: [4, 4, 4],
        D: {0: [2, 43, 43], Z: {0: [2, 4, 4], H: [[2, 4, 4]]}},
        H: {0: [4, 4, 4], D: {0: [2, 43, 43], Z: {H: [[2, 4, 4]]}}},
        S: {0: [4, 4, 4], H: [[4, 4, 4]], C: {H: [[4, 4, 4]]}}}
};


function process(word, codeLength) {
	codeLength = codeLength || 6;
    word = word.toUpperCase();
    var output = '';

    var pos = 0, lastCode = -1;
    while (pos < word.length) {
        var substr = word.slice(pos);
        var rules = findRules(substr);

        var code;
        if (pos == 0) {
            // at the beginning of the word
            code = rules.mapping[0];
        } else if (substr[rules.length] && findRules(substr[rules.length]).mapping[0] == 0) {
            // before a vowel
            code = rules.mapping[1];
        } else {
            // any other situation
            code = rules.mapping[2];
        }

        if ((code != -1) && (code != lastCode)) output += code;
        lastCode = code;
        pos += rules.length;

    }

    return normalizeLength(output, codeLength);
}


function findRules(str) {
    var state = codes[str[0]];
    var legalState = state || [[-1,-1,-1]],
        charsInvolved = 1;

    for (var offs = 1; offs < str.length; offs++) {
        if (!state || !state[str[offs]]) break;

        state = state[str[offs]];
        if (state[0]) {
            legalState = state;
            charsInvolved = offs + 1;
        }
    }

    return {
        length: charsInvolved,
        mapping: legalState[0]
    };
}


/**
 * Pad right with zeroes or cut excess symbols to fit length
 */
function normalizeLength(token, length) {
	length = length || 6;
	if (token.length < length) {
		token += (new Array(length - token.length + 1)).join('0');
	}
    return token.slice(0, length);
}

var Phonetic = require('./phonetic');
var soundex = new Phonetic();
soundex.process = process;
module.exports = soundex;


},{"./phonetic":63}],61:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Phonetic = require('./phonetic');

var DoubleMetaphone = new Phonetic();
module.exports = DoubleMetaphone;

function isVowel(c) {
	return c && c.match(/[aeiouy]/i);
}

function truncate(string, length) {
    if(string.length >= length)
        string = string.substring(0, length);
        
    return string;
}

function process(token, maxLength) {
	token = token.toUpperCase();
	var primary = '', secondary = '';	
    var pos = 0;
    maxLength == maxLength || 32;

    function subMatch(startOffset, stopOffset, terms) {
        return subMatchAbsolute(pos + startOffset, pos + stopOffset, terms);
    }

    function subMatchAbsolute(startOffset, stopOffset, terms) {
        return terms.indexOf(token.substring(startOffset, stopOffset)) > -1;
    }

    function addSecondary(primaryAppendage, secondaryAppendage) {
    	primary += primaryAppendage;
    	secondary += secondaryAppendage;
    }

    function add(primaryAppendage) {
    	addSecondary(primaryAppendage, primaryAppendage);
    }

    function addCompressedDouble(c, encoded) {
    	if(token[pos + 1] == c)
    		pos++;
    	add(encoded || c);
    }

    function handleC() {

        if(pos >= 1 && !isVowel(token[pos - 2]) 
                && token[pos - 1] == 'A' && token[pos + 1] == 'H'
                    && (token[pos + 2] != 'I' && token[pos + 2] != 'I')
                        || subMatch(-2, 4, ['BACHER', 'MACHER'])) {
            add('K');
            pos++;
        } else if(pos == 0 && token.substring(1, 6) == 'EASAR') {
            add('S');
            add('S');
            add('R');
            pos += 6;
        } else if(token.substring(pos + 1, pos + 4) == 'HIA') {
            add('K');
            pos++;
        } else if(token[pos + 1] == 'H') {
            if(pos > 0 && token.substring(pos + 2, pos + 4) == 'AE') {
                addSecondary('K', 'X');
                pos++;
            } else if(pos == 0 
                        && (subMatch(1, 6, ['HARAC', 'HARIS']) 
                            || subMatch(1, 4, ['HOR', 'HUM', 'HIA', 'HEM']))
                        && token.substring(pos + 1, pos + 5) != 'HORE') {
                add('K');
                pos++;
            } else {
                if((subMatchAbsolute(0, 3, ['VAN', 'VON']) || token.substring(0,  3) == 'SCH')
                    || subMatch(-2, 4, ['ORCHES', 'ARCHIT', 'ORCHID'])
                    || subMatch(2, 3, ['T', 'S'])
                    || ((subMatch(-1, 0, ['A', 'O', 'U', 'E']) || pos == 0) 
                        && subMatch(2, 3, ['B', 'F', 'H', 'L', 'M', 'N', 'R', 'V', 'W']))) {
                    add('K');
                } else if(pos > 0) {

                    if(token.substring(0, 2) == 'MC') {
                        add('K');
                    } else {
                        addSecondary('X', 'K');   
                    }
                } else {
                    add('X');
                }

                pos++;
            } 
        } else if(token.substring(pos, pos + 2) == 'CZ' 
                && token.substring(pos - 2, pos + 1) != 'WICZ') {
            addSecondary('S', 'X');
            pos++;
        } else if(token.substring(pos, pos + 3) == 'CIA') {
            add('X');
            pos += 2;
        } else if(token[pos + 1] == 'C' && pos != 1 && token[0] != 'M') {
            if(['I', 'E', 'H'].indexOf(token[pos + 2]) > -1 
                    && token.substring(pos + 2, pos + 4) != 'HU') {
                if(pos == 1 && token[pos - 1] == 'A'
                        || subMatch(-1, 4, ['UCCEE', 'UCCES'])) {
                    add('KS');
                } else {
                   add('X');
                }

               pos +=2;
            } else {
                add('K');
                pos++;
            }
        } else if(['K', 'G', 'Q'].indexOf(token[pos + 1]) > -1) {
            add('K');
            pos++;
        } else if(['E', 'I', 'Y'].indexOf(token[pos + 1]) > -1) {
            if(subMatch(1, 3, ['IA', 'IE', 'IO'])) {
                addSecondary('S', 'X');   
            } else {
                add('S');
            }
            pos++;
        } else {            
            add('K');
            if(token[pos + 1] == ' ' && ['C', 'Q', 'G'].indexOf(token[pos + 2])) {
                pos += 2;
            } else if(['C', 'K', 'Q'].indexOf(token[pos + 1]) > -1
                    && !subMatch(1, 3, ['CE', 'CI'])) {
                pos++;
            } 
        }
    }

    function handleD() {
    	if(token[pos + 1] == 'G') {
    		if(['I', 'E', 'Y'].indexOf(token[pos + 2]) > -1)  {
    			add('J');
    			pos += 2;
    		} else {
    			add('TK');
    			pos++;
    		}
	    } else if(token[pos + 1] == 'T') {
    		add('T');
	    	pos++;    		
    	} else
    		addCompressedDouble('D', 'T');
    }

    function handleG() {
        if(token[pos + 1] == 'H') {
            if(pos > 0 && !isVowel(token[pos - 1])) {
                add('K');
                pos++;
            } else if(pos == 0) {
                if(token[pos + 2] == 'I') {
                    add('J');
                } else {
                    add('K');
                }
                pos++;
            } else if(pos > 1 
                && (['B', 'H', 'D'].indexOf(token[pos - 2]) > -1
                    || ['B', 'H', 'D'].indexOf(token[pos - 3]) > -1
                    || ['B', 'H'].indexOf(token[pos - 4]) > -1)) {
                pos++;
            } else {
                if(pos > 2
                        && token[pos - 1] == 'U'
                        && ['C', 'G', 'L', 'R', 'T'].indexOf(token[pos - 3]) > -1) {
                    add('F');
                } else if(token[pos - 1] != 'I') {
                    add('K');
                }

                pos++;
            }
        } else if(token[pos + 1] == 'N') {
            if(pos == 1 && startsWithVowel && !slavoGermanic) {
                addSecondary('KN', 'N');
            } else {
                if(token.substring(pos + 2, pos + 4) != 'EY'
                        && (token[pos + 1] != 'Y'
                            && !slavoGermanic)) {
                    addSecondary('N', 'KN');
                } else
                    add('KN');
            }
            pos++;
        } else if(token.substring(pos + 1, pos + 3) == 'LI' && !slavoGermanic) {
            addSecondary('KL', 'L');
            pos++;
        } else if(pos == 0 && (token[pos + 1] == 'Y'                
                || subMatch(1, 3, ['ES', 'EP', 'EB', 'EL', 'EY', 'IB', 'IL', 'IN', 'IE', 'EI', 'ER']))) {
            addSecondary('K', 'J')
        } else {
            addCompressedDouble('G', 'K');
        }
    }

    function handleH() {
		// keep if starts a word or is surrounded by vowels
		if((pos == 0 || isVowel(token[pos - 1])) && isVowel(token[pos + 1])) {
			add('H');
			pos++;
		}    	
    }    

    function handleJ() {
        var jose = (token.substring(pos + 1, pos + 4) == 'OSE');

        if(san || jose) {
            if((pos == 0 && token[pos + 4] == ' ') 
                    || san) {
                add('H');            
            } else
                add('J', 'H');
        } else {
            if(pos == 0/* && !jose*/) {
                addSecondary('J', 'A');
            } else if(isVowel(token[pos - 1]) && !slavoGermanic 
                    && (token[pos + 1] == 'A' || token[pos + 1] == 'O')) {
                addSecondary('J', 'H');
            } else if(pos == token.length - 1) {
                addSecondary('J', ' ');
            } else
                addCompressedDouble('J');
        }
    }

    function handleL() {
    	if(token[pos + 1] == 'L') {
    		if(pos == token.length - 3 && (
    					subMatch(-1, 3, ['ILLO', 'ILLA', 'ALLE']) || (
    						token.substring(pos - 1, pos + 3) == 'ALLE' &&
    						(subMatch(-2, -1, ['AS', 'OS']) > -1 ||
    						['A', 'O'].indexOf(token[token.length - 1]) > -1)))) {
    			addSecondary('L', '');
    			pos++;
    			return;
    		}
    		pos++;	
    	}
    	add('L');
    }

    function handleM() {
    	addCompressedDouble('M');
    	if(token[pos - 1] == 'U' && token[pos + 1] == 'B' && 
    			((pos == token.length - 2  || token.substring(pos + 2, pos + 4) == 'ER')))
    		pos++;
    }

    function handleP() {
    	if(token[pos + 1] == 'H') {
    		add('F');
    		pos++;	
    	} else {
    		addCompressedDouble('P');
    		    		
			if(token[pos + 1] == 'B')
    			pos++;
    	}
    }

    function handleR() {
    	if(pos == token.length - 1 && !slavoGermanic
    			&& token.substring(pos - 2, pos) == 'IE'
    			&& !subMatch(-4, -3, ['ME', 'MA'])) {
    		addSecondary('', 'R');
    	} else
	    	addCompressedDouble('R');    		
    }

    function handleS() {
        if(pos == 0 && token.substring(0, 5) == 'SUGAR') {
            addSecondary('X', 'S');
        } else if(token[pos + 1] == 'H') {
            if(subMatch(2, 5, ['EIM', 'OEK', 'OLM', 'OLZ'])) {
                add('S');
            } else {
                add('X');
            }
            pos++;
        } else if(subMatch(1, 3, ['IO', 'IA'])) {
            if(slavoGermanic) {
                add('S');
            } else {
                addSecondary('S', 'X');
            }
            pos++;
        } else if((pos == 0 && ['M', 'N', 'L', 'W'].indexOf(token[pos + 1]) > -1) 
                || token[pos + 1] == 'Z') {
            addSecondary('S', 'X');
            if(token[pos + 1] == 'Z')
                pos++;
        } else if(token.substring(pos, pos + 2) == 'SC') {
            if(token[pos + 2] == 'H') {
                if(subMatch(3, 5, ['ER', 'EN'])) {
                    addSecondary('X', 'SK');
                } else if(subMatch(3, 5, ['OO', 'UY', 'ED', 'EM'])) {
                    add('SK');
                } else if(pos == 0 && !isVowel(token[3]) && token[3] != 'W') {
                    addSecondary('X', 'S');
                } else {
                    add('X');   
                } 
            } else if(['I', 'E', 'Y'].indexOf(token[pos + 2]) > -1) {
                add('S');
            } else {
                add('SK');
            }

            pos += 2;            
        } else if(pos == token.length - 1
                && subMatch(-2, 0, ['AI', 'OI'])) {
            addSecondary('', 'S');            
        } else if(token[pos + 1] != 'L' && (
                token[pos - 1] != 'A' && token[pos - 1] != 'I')) {
            addCompressedDouble('S');
            if(token[pos + 1] == 'Z')
                pos++;
        }
    }

    function handleT() {
        if(token.substring(pos + 1, pos + 4) == 'ION') {
            add('XN');
            pos += 3;
        } else if(subMatch(1, 3, ['IA', 'CH'])) {
            add('X');
            pos += 2;
        } else if(token[pos + 1] == 'H' 
                || token.substring(1, 2) == 'TH') {
            if(subMatch(2, 4, ['OM', 'AM']) 
                    || ['VAN ', 'VON '].indexOf(token.substring(0, 4)) > -1
                    || token.substring(0, 3) == 'SCH') {
                add('T');            
            } else
                addSecondary('0', 'T');
            pos++;
        } else {
            addCompressedDouble('T');

            if(token[pos + 1] == 'D')
                pos++;
        }
    }

    function handleX() {
    	if(pos == 0) {
    		add('S');
    	} else if(!(pos == token.length - 1 
	    		&& (['IAU', 'EAU', 'IEU'].indexOf(token.substring(pos - 3, pos)) > -1
	    			|| ['AU', 'OU'].indexOf(token.substring(pos - 2, pos)) > -1))) {
    		add('KS');
    	}
    }

    function handleW() {
        if(pos == 0) {
            if(token[1] == 'H') {
                add('A');
            } else if (isVowel(token[1])) {
                addSecondary('A', 'F');
            }
        } else if((pos == token.length - 1 && isVowel(token[pos - 1]) 
                    || subMatch(-1, 4, ['EWSKI', 'EWSKY', 'OWSKI', 'OWSKY'])
                    || token.substring(0, 3) == 'SCH')) {
                addSecondary('', 'F');
                pos++;
        } else if(['ICZ', 'ITZ'].indexOf(token.substring(pos + 1, pos + 4)) > -1) {
            addSecondary('TS', 'FX');
            pos += 3;
        }
    }

    function handleZ() {
        if(token[pos + 1] == 'H') {
            add('J');
            pos++;            
        } else if(subMatch(1, 3, ['ZO', 'ZI', 'ZA']) 
                || (slavoGermanic && pos > 0 && token[pos - 1] != 'T')) {
            addSecondary('S', 'TS');
            pos++; 
        } else
            addCompressedDouble('Z', 'S');
    }

    var san = (token.substring(0, 3) == 'SAN');
    var startsWithVowel = isVowel(token[0]);
    var slavoGermanic = token.match(/(W|K|CZ|WITZ)/);

    if(subMatch(0, 2, ['GN', 'KN', 'PN', 'WR', 'PS'])) {
    	pos++;
    }

    while(pos < token.length) {

    	switch(token[pos]) {
	        case 'A': case 'E': case 'I': case 'O': case 'U': case 'Y': 	        
	        case 'Ê': case 'É': case 'É': case'À':
		        if(pos == 0)
		        	add('A');
		        break;
		    case 'B':
		    	addCompressedDouble('B', 'P');
		    	break;
            case 'C':
                handleC();
                break;
	        case 'Ç':
	            add("S");
	            break;
	        case 'D':
	        	handleD();
	        	break;
	        case 'F': case 'K': case 'N':
	        	addCompressedDouble(token[pos]);
	        	break;
            case 'G':
                handleG();
                break;
	        case 'H':
	        	handleH();
	        	break;
            case 'J':
                handleJ();
                break;
	        case 'L':
	        	handleL();
	        	break;
	        case 'M':
	        	handleM();
	        	break;
	        case 'Ñ':
	        	add('N');
	        	break;
	        case 'P':
	        	handleP();
	        	break;
	        case 'Q':
	        	addCompressedDouble('Q', 'K');
	        	break;
	        case 'R':
	        	handleR();
	        	break;
            case 'S':
                handleS();
                break;
            case 'T':
                handleT();
                break;
	        case 'V':
	        	addCompressedDouble('V', 'F');
	        	break;
            case 'W':
                handleW();
                break;
	        case 'X':
	        	handleX();
	        	break;
	        case 'Z':
	        	handleZ();
	        	break;
    	}

        if(primary.length >= maxLength && secondary.length >= maxLength) {
            break;
        }

    	pos++;
    }

    return [truncate(primary, maxLength), truncate(secondary, maxLength)];
}

function compare(stringA, stringB) {
    var encodingsA = process(stringA),
        encodingsB = process(stringB);

    return encodingsA[0] == encodingsB[0] || 
        encodingsA[1] == encodingsB[1];
};

DoubleMetaphone.compare = compare
DoubleMetaphone.process = process;
DoubleMetaphone.isVowel = isVowel;

},{"./phonetic":63}],62:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Phonetic = require('./phonetic');

function dedup(token) {
    return token.replace(/([^c])\1/g, '$1');
}

function dropInitialLetters(token) {
    if(token.match(/^(kn|gn|pn|ae|wr)/))
        return token.substr(1, token.length - 1);
        
    return token;
}

function dropBafterMAtEnd(token) {
    return token.replace(/mb$/, 'm');
}

function cTransform(token) {
    

    token = token.replace(/([^s]|^)(c)(h)/g, '$1x$3').trim();


    token = token.replace(/cia/g, 'xia');
    token = token.replace(/c(i|e|y)/g, 's$1');
    token = token.replace(/c/g, 'k'); 
    
    return token;
}

function dTransform(token) {
    token = token.replace(/d(ge|gy|gi)/g, 'j$1');
    token = token.replace(/d/g, 't');
    
    return token;
}

function dropG(token) {
    token = token.replace(/gh(^$|[^aeiou])/g, 'h$1');
    token = token.replace(/g(n|ned)$/g, '$1');    
    
    return token;
}

function transformG(token) {
    token = token.replace(/gh/g, 'f'); 
    token = token.replace(/([^g]|^)(g)(i|e|y)/g, '$1j$3');
    token = token.replace(/gg/g, 'g');
    token = token.replace(/g/g, 'k');    
    
    return token;
}

function dropH(token) {
    return token.replace(/([aeiou])h([^aeiou]|$)/g, '$1$2');
}

function transformCK(token) {
    return token.replace(/ck/g, 'k');
}
function transformPH(token) {
    return token.replace(/ph/g, 'f');
}

function transformQ(token) {
    return token.replace(/q/g, 'k');
}

function transformS(token) {
    return token.replace(/s(h|io|ia)/g, 'x$1');
}

function transformT(token) {
    token = token.replace(/t(ia|io)/g, 'x$1');
    token = token.replace(/th/, '0');
    
    return token;
}

function dropT(token) {
    return token.replace(/tch/g, 'ch');
}

function transformV(token) {
    return token.replace(/v/g, 'f');
}

function transformWH(token) {
    return token.replace(/^wh/, 'w');
}

function dropW(token) {
    return token.replace(/w([^aeiou]|$)/g, '$1');
}

function transformX(token) {
    token = token.replace(/^x/, 's');
    token = token.replace(/x/g, 'ks');
    return token;
}

function dropY(token) {
    return token.replace(/y([^aeiou]|$)/g, '$1');
}

function transformZ(token) {
    return token.replace(/z/, 's');
}

function dropVowels(token) {
    return token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, '');
}

var Metaphone = new Phonetic();
module.exports = Metaphone;

Metaphone.process = function(token, maxLength) {
    maxLength == maxLength || 32;
    token = token.toLowerCase();
    token = dedup(token);
    token = dropInitialLetters(token);
    token = dropBafterMAtEnd(token);
    token = transformCK(token);
    token = cTransform(token);
    token = dTransform(token);
    token = dropG(token);
    token = transformG(token);
    token = dropH(token);
    token = transformPH(token);
    token = transformQ(token);
    token = transformS(token);
    token = transformX(token);    
    token = transformT(token);
    token = dropT(token);
    token = transformV(token);
    token = transformWH(token);
    token = dropW(token);
    token = dropY(token);
    token = transformZ(token);
    token = dropVowels(token);
    
    token.toUpperCase();
    if(token.length >= maxLength)
        token = token.substring(0, maxLength);        

    return token.toUpperCase();
};

// expose functions for testing    
Metaphone.dedup = dedup;
Metaphone.dropInitialLetters = dropInitialLetters;
Metaphone.dropBafterMAtEnd = dropBafterMAtEnd;
Metaphone.cTransform = cTransform;
Metaphone.dTransform = dTransform;
Metaphone.dropG = dropG;
Metaphone.transformG = transformG;
Metaphone.dropH = dropH;
Metaphone.transformCK = transformCK;
Metaphone.transformPH = transformPH;
Metaphone.transformQ = transformQ;
Metaphone.transformS = transformS;
Metaphone.transformT = transformT;
Metaphone.dropT = dropT;
Metaphone.transformV = transformV;
Metaphone.transformWH = transformWH;
Metaphone.dropW = dropW;
Metaphone.transformX = transformX;
Metaphone.dropY = dropY;
Metaphone.transformZ = transformZ;
Metaphone.dropVowels = dropVowels;

},{"./phonetic":63}],63:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords');
var Tokenizer = require('../tokenizers/aggressive_tokenizer'),
    tokenizer = new Tokenizer();

module.exports = function() {
    this.compare = function(stringA, stringB) {
        return this.process(stringA) == this.process(stringB);
    };

    this.attach = function() {
	var phonetic = this;

        String.prototype.soundsLike = function(compareTo) {
            return phonetic.compare(this, compareTo);
        }
        
        String.prototype.phonetics = function() {
            return phonetic.process(this);
        }
	
        String.prototype.tokenizeAndPhoneticize = function(keepStops) {
            var phoneticizedTokens = [];
            
            tokenizer.tokenize(this).forEach(function(token) {
                if(keepStops || stopwords.words.indexOf(token) < 0)
                    phoneticizedTokens.push(token.phonetics());
            });
            
            return phoneticizedTokens;
        }
    };
};

},{"../tokenizers/aggressive_tokenizer":88,"../util/stopwords":110}],64:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Phonetic = require('./phonetic');

function transformLipps(token) {
    return token.replace(/[bfpv]/g, '1');
}

function transformThroats(token) {
    return token.replace(/[cgjkqsxz]/g, '2');
}

function transformToungue(token) {
    return token.replace(/[dt]/g, '3');
}

function transformL(token) {
    return token.replace(/l/g, '4');
}

function transformHum(token) {
    return token.replace(/[mn]/g, '5');
}

function transformR(token) {
    return token.replace(/r/g, '6');
}

function condense(token) {
    return token.replace(/(\d)?\1+/g, '$1');
}

function padRight0(token) {
    if(token.length < 4)
        return token + Array(4 - token.length).join('0');
    else
        return token;
}

function transform(token) {
    return transformLipps(transformThroats(
        transformToungue(transformL(transformHum(transformR(token))))));
}

var SoundEx = new Phonetic();
module.exports = SoundEx;

SoundEx.process = function(token, maxLength) {
    token = token.toLowerCase();    
    var transformed = condense(transform(token.substr(1, token.length - 1))); // anything that isn't a digit goes
    // deal with duplicate INITIAL consonant SOUNDS
    transformed = transformed.replace(new RegExp("^" + transform(token.charAt(0))), '');
    return token.charAt(0).toUpperCase() + padRight0(transformed.replace(/\D/g, '')).substr(0, (maxLength && maxLength - 1) || 3);
};

// export for tests;
SoundEx.transformLipps = transformLipps;
SoundEx.transformThroats = transformThroats;
SoundEx.transformToungue = transformToungue;
SoundEx.transformL = transformL;
SoundEx.transformHum = transformHum;
SoundEx.transformR = transformR;
SoundEx.condense = condense;
SoundEx.padRight0 = padRight0;

},{"./phonetic":63}],65:[function(require,module,exports){

var Trie = require('../trie/trie');

// Probabilistic spellchecker based on http://norvig.com/spell-correct.html
// The general idea is simple. Given a word, the spellchecker calculates all strings that are some user-defined edit distance away. Of those many candidates, it filters the ones that are not words and then returns an array of possible corrections in order of decreasing probability, based on the edit distance and the candidate's frequency in the input corpus
// Words that are an edit distance of n away from the mispelled word are considered infinitely more probable than words that are of an edit distance >n

// wordlist is a corpus (an array) from which word probabilities are calculated (so something like /usr/share/dict/words (on OSX) will work okay, but real world text will work better)
function Spellcheck(wordlist) {
    this.trie = new Trie();
    this.trie.addStrings(wordlist);
    this.word2frequency = {};
    for(var i in wordlist) {
        if(!this.word2frequency[wordlist[i]]) {
            this.word2frequency[wordlist[i]] = 0;
        }
        this.word2frequency[wordlist[i]]++;
    }
}

Spellcheck.prototype.isCorrect = function(word) {
    return this.trie.contains(word);
}

// Returns a list of suggested corrections, from highest to lowest probability 
// maxDistance is the maximum edit distance 
// According to Norvig, literature suggests that 80% to 95% of spelling errors are an edit distance of 1 away from the correct word. This is good, because there are roughly 54n+25 strings 1 edit distance away from any given string of length n. So after maxDistance = 2, this becomes very slow.
Spellcheck.prototype.getCorrections = function(word, maxDistance) {
    var self = this;
    if(!maxDistance) maxDistance = 1;
    var edits = this.editsWithMaxDistance(word, maxDistance);
    edits = edits.slice(1,edits.length);
    edits = edits.map(function(editList) {
       return editList.filter(function(word) { return self.isCorrect(word); })
                      .map(function(word) { return [word, self.word2frequency[word]]; })
                      .sort(function(a,b) { return a[1] > b[1] ? -1 : 1; })
                      .map(function(wordscore) { return wordscore[0]; });
    });
    var flattened = [];
    for(var i in edits) {
        if(edits[i].length) flattened = flattened.concat(edits[i]);
    }
    return flattened.filter(function (v, i, a) { return a.indexOf(v) == i });
}

// Returns all edits that are 1 edit-distance away from the input word
Spellcheck.prototype.edits = function(word) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var edits = [];
    for(var i=0; i<word.length+1; i++) {
        if(i>0) edits.push(word.slice(0,i-1)+word.slice(i,word.length)); // deletes
        if(i>0 && i<word.length+1) edits.push(word.slice(0,i-1) + word.slice(i,i+1) + word.slice(i-1, i) + word.slice(i+1,word.length)); // transposes
        for(var k=0; k<alphabet.length; k++) {
            if(i>0) edits.push(word.slice(0,i-1)+alphabet[k]+word.slice(i,word.length)); // replaces
            edits.push(word.slice(0,i)+alphabet[k]+word.slice(i,word.length)); // inserts
        }
    }
    // Deduplicate edits
    edits = edits.filter(function (v, i, a) { return a.indexOf(v) == i });
    return edits;
}

// Returns all edits that are up to "distance" edit distance away from the input word
Spellcheck.prototype.editsWithMaxDistance = function(word, distance) { 
    return this.editsWithMaxDistanceHelper(distance, [[word]]);
}

Spellcheck.prototype.editsWithMaxDistanceHelper = function(distanceCounter, distance2edits) {
    if(distanceCounter == 0) return distance2edits;
    var currentDepth = distance2edits.length-1;
    var words = distance2edits[currentDepth];
    var edits = this.edits(words[0]);
    distance2edits[currentDepth+1] = [];
    for(var i in words) {
        distance2edits[currentDepth+1] = distance2edits[currentDepth+1].concat(this.edits(words[i]));
    }
    return this.editsWithMaxDistanceHelper(distanceCounter-1, distance2edits);
}

module.exports = Spellcheck;

},{"../trie/trie":105}],66:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

exports.rules = {
    "a": [
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "ia", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "a", 
            "size": "1"
        }
    ], 
    "b": [
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "bb", 
            "size": "1"
        }
    ], 
    "c": [
        {
            "appendage": "s", 
            "continuation": false, 
            "intact": false, 
            "pattern": "ytic", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ic", 
            "size": "2"
       }, 
        {
            "appendage": "t", 
            "continuation": true, 
            "intact": false, 
            "pattern": "nc", 
            "size": "1"
        }
    ], 
    "d": [
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "dd", 
            "size": "1"
        }, 
        {
            "appendage": "y", 
            "continuation": true, 
            "intact": false, 
            "pattern": "ied", 
            "size": "3"
        }, 
        {
            "appendage": "ss", 
            "continuation": false, 
            "intact": false, 
            "pattern": "ceed", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "eed", 
            "size": "1"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ed", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "hood", 
            "size": "4"
        }
    ], 
    "e": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "e", 
            "size": "1"
        }
    ], 
    "f": [
        {
            "appendage": "v", 
            "continuation": false, 
            "intact": false, 
            "pattern": "lief", 
            "size": "1"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "if", 
            "size": "2"
        }
    ], 
    "g": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ing", 
            "size": "3"
        }, 
        {
            "appendage": "y", 
            "continuation": false, 
            "intact": false, 
            "pattern": "iag", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ag", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "gg", 
            "size": "1"
        }
    ], 
    "h": [
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "th", 
            "size": "2"
        }, 
        {
            "appendage": "ct", 
            "continuation": false, 
            "intact": false, 
            "pattern": "guish", 
            "size": "5"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ish", 
            "size": "3"
        }
    ], 
    "i": [
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "i", 
            "size": "1"
        }, 
        {
            "appendage": "y", 
            "continuation": true, 
            "intact": false, 
            "pattern": "i", 
            "size": "1"
        }
    ], 
    "j": [
        {
            "appendage": "d", 
            "continuation": false, 
            "intact": false, 
            "pattern": "ij", 
            "size": "1"
        }, 
        {
            "appendage": "s", 
            "continuation": false, 
            "intact": false, 
            "pattern": "fuj", 
            "size": "1"
        }, 
        {
            "appendage": "d", 
            "continuation": false, 
            "intact": false, 
            "pattern": "uj", 
            "size": "1"
        }, 
        {
            "appendage": "d", 
            "continuation": false, 
            "intact": false, 
            "pattern": "oj", 
            "size": "1"
        }, 
        {
            "appendage": "r", 
            "continuation": false, 
            "intact": false, 
            "pattern": "hej", 
            "size": "1"
        }, 
        {
            "appendage": "t", 
            "continuation": false, 
            "intact": false, 
            "pattern": "verj", 
            "size": "1"
        }, 
        {
            "appendage": "t", 
            "continuation": false, 
            "intact": false, 
            "pattern": "misj", 
            "size": "2"
        }, 
        {
            "appendage": "d", 
            "continuation": false, 
            "intact": false, 
            "pattern": "nj", 
            "size": "1"
        }, 
        {
            "appendage": "s", 
            "continuation": false, 
            "intact": false, 
            "pattern": "j", 
            "size": "1"
        }
    ], 
    "l": [
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ifiabl", 
            "size": "6"
        }, 
        {
            "appendage": "y", 
            "continuation": false, 
            "intact": false, 
            "pattern": "iabl", 
            "size": "4"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "abl", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ibl", 
            "size": "3"
        }, 
        {
            "appendage": "l", 
            "continuation": true, 
            "intact": false, 
            "pattern": "bil", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "cl", 
            "size": "1"
        }, 
        {
            "appendage": "y", 
            "continuation": false, 
            "intact": false, 
            "pattern": "iful", 
            "size": "4"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ful", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ul", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ial", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ual", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "al", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ll", 
            "size": "1"
        }
    ], 
    "m": [
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ium", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "um", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ism", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "mm", 
            "size": "1"
        }
    ], 
    "n": [
        {
            "appendage": "j", 
            "continuation": true, 
            "intact": false, 
            "pattern": "sion", 
            "size": "4"
        }, 
        {
            "appendage": "ct", 
            "continuation": false, 
            "intact": false, 
            "pattern": "xion", 
            "size": "4"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ion", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ian", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "an", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "een", 
            "size": "0"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "en", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "nn", 
            "size": "1"
        }
    ], 
    "p": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ship", 
            "size": "4"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "pp", 
            "size": "1"
        }
    ], 
    "r": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "er", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ear", 
            "size": "0"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ar", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "or", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ur", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "rr", 
            "size": "1"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "tr", 
            "size": "1"
        }, 
        {
            "appendage": "y", 
            "continuation": true, 
            "intact": false, 
            "pattern": "ier", 
            "size": "3"
        }
    ], 
    "s": [
        {
            "appendage": "y", 
            "continuation": true, 
            "intact": false, 
            "pattern": "ies", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "sis", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "is", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ness", 
            "size": "4"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ss", 
            "size": "0"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ous", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": true, 
            "pattern": "us", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": true, 
            "pattern": "s", 
            "size": "1"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "s", 
            "size": "0"
        }
    ], 
    "t": [
        {
            "appendage": "y", 
            "continuation": false, 
            "intact": false, 
            "pattern": "plicat", 
            "size": "4"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "at", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ment", 
            "size": "4"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ent", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ant", 
            "size": "3"
        }, 
        {
            "appendage": "b", 
            "continuation": false, 
            "intact": false, 
            "pattern": "ript", 
            "size": "2"
        }, 
        {
            "appendage": "b", 
            "continuation": false, 
            "intact": false, 
            "pattern": "orpt", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "duct", 
            "size": "1"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "sumpt", 
            "size": "2"
        }, 
        {
            "appendage": "iv", 
            "continuation": false, 
            "intact": false, 
            "pattern": "cept", 
            "size": "2"
        }, 
        {
            "appendage": "v", 
            "continuation": false, 
            "intact": false, 
            "pattern": "olut", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "sist", 
            "size": "0"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ist", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "tt", 
            "size": "1"
        }
    ], 
    "u": [
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "iqu", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ogu", 
            "size": "1"
        }
    ], 
    "v": [
        {
            "appendage": "j", 
            "continuation": true, 
            "intact": false, 
            "pattern": "siv", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "eiv", 
            "size": "0"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "iv", 
            "size": "2"
        }
    ], 
    "y": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "bly", 
            "size": "1"
        }, 
        {
            "appendage": "y", 
            "continuation": true, 
            "intact": false, 
            "pattern": "ily", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ply", 
            "size": "0"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ly", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ogy", 
            "size": "1"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "phy", 
            "size": "1"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "omy", 
            "size": "1"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "opy", 
            "size": "1"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ity", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ety", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "lty", 
            "size": "2"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "istry", 
            "size": "5"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ary", 
            "size": "3"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "ory", 
            "size": "3"
        }, 
        {
            "continuation": false, 
            "intact": false, 
            "pattern": "ify", 
            "size": "3"
        }, 
        {
            "appendage": "t", 
            "continuation": true, 
            "intact": false, 
            "pattern": "ncy", 
            "size": "2"
        }, 
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "acy", 
            "size": "3"
        }
    ], 
    "z": [
        {
            "continuation": true, 
            "intact": false, 
            "pattern": "iz", 
            "size": "2"
        }, 
        {
            "appendage": "s", 
            "continuation": false, 
            "intact": false, 
            "pattern": "yz", 
            "size": "1"
        }
    ]
};


},{}],67:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer');
var ruleTable = require('./lancaster_rules').rules;

function acceptable(candidate) {
    if (candidate.match(/^[aeiou]/))
        return (candidate.length > 1);
    else
        return (candidate.length > 2 && candidate.match(/[aeiouy]/));
}

// take a token, look up the applicatble rule section and attempt some stemming!
function applyRuleSection(token, intact) {
    var section = token.substr( - 1);
    var rules = ruleTable[section];

    if (rules) {
        for (var i = 0; i < rules.length; i++) {
            if ((intact || !rules[i].intact)
            // only apply intact rules to intact tokens
            && token.substr(0 - rules[i].pattern.length) == rules[i].pattern) {
                // hack off only as much as the rule indicates
                var result = token.substr(0, token.length - rules[i].size);

                // if the rules wants us to apply an appendage do so
                if (rules[i].appendage)
                    result += rules[i].appendage;

                if (acceptable(result)) {
                    token = result;

                    // see what the rules wants to do next
                    if (rules[i].continuation) {
                        // this rule thinks there still might be stem left. keep at it.
                        // since we've applied a change we'll pass false in for intact
                        return applyRuleSection(result, false);
                    } else {
                        // the rule thinks we're done stemming. drop out.
                        return result;
                    }
                }
            }
        }
    }

    return token;
}

var LancasterStemmer = new Stemmer();
module.exports = LancasterStemmer;

LancasterStemmer.stem = function(token) {
    return applyRuleSection(token.toLowerCase(), true);
}
},{"./lancaster_rules":66,"./stemmer":76}],68:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer');

// denote groups of consecutive consonants with a C and consecutive vowels
// with a V.
function categorizeGroups(token) {
    return token.replace(/[^aeiouy]+y/g, 'CV').replace(/[aeiou]+/g, 'V').replace(/[^V]+/g, 'C');
}

// denote single consonants with a C and single vowels with a V
function categorizeChars(token) {
    return token.replace(/[^aeiouy]y/g, 'CV').replace(/[aeiou]/g, 'V').replace(/[^V]/g, 'C');
}

// calculate the "measure" M of a word. M is the count of VC sequences dropping
// an initial C if it exists and a trailing V if it exists.
function measure(token) {
    if(!token)
    	return -1;

    return categorizeGroups(token).replace(/^C/, '').replace(/V$/, '').length / 2;
}

// determine if a token end with a double consonant i.e. happ
function endsWithDoublCons(token) {
    return token.match(/([^aeiou])\1$/);
}

// replace a pattern in a word. if a replacement occurs an optional callback
// can be called to post-process the result. if no match is made NULL is
// returned.
function attemptReplace(token, pattern, replacement, callback) {
    var result = null;
    
    if((typeof pattern == 'string') && token.substr(0 - pattern.length) == pattern)
        result = token.replace(new RegExp(pattern + '$'), replacement);
    else if((pattern instanceof RegExp) && token.match(pattern))
        result = token.replace(pattern, replacement);
        
    if(result && callback)
        return callback(result);
    else
        return result;
}

// attempt to replace a list of patterns/replacements on a token for a minimum
// measure M.
function attemptReplacePatterns(token, replacements, measureThreshold) {
    var replacement = token;

    for(var i = 0; i < replacements.length; i++) {   
    	if(measureThreshold == null || measure(attemptReplace(token, replacements[i][0], replacements[i][1])) > measureThreshold) {
    	    replacement = attemptReplace(replacement, replacements[i][0], replacements[i][2]) || replacement;
        }
    }
    
    return replacement;
}

// replace a list of patterns/replacements on a word. if no match is made return
// the original token.
function replacePatterns(token, replacements, measureThreshold) {
    return attemptReplacePatterns(token, replacements, measureThreshold) || token;
}

// TODO: this should replace all of the messy replacement stuff above
function replaceRegex(token, regex, includeParts, minimumMeasure) {
    var parts;
    var result = '';

    if(regex.test(token)) {
        parts = regex.exec(token);

        includeParts.forEach(function(i) {
            result += parts[i];
        });
    }

    if(measure(result) > minimumMeasure) {
        return result;
    }

    return null;
}

// step 1a as defined for the porter stemmer algorithm. 
function step1a(token) {    
    if(token.match(/(ss|i)es$/)) {
        return token.replace(/(ss|i)es$/, '$1');
    }

    if(token.substr(-1) == 's' && token.substr(-2, 1) != 's' && token.length > 2) {
        return token.replace(/s?$/, '');
    }

    return token;
}

// step 1b as defined for the porter stemmer algorithm. 
function step1b(token) {   
    if(token.substr(-3) == 'eed') {
        if(measure(token.substr(0, token.length - 3)) > 0)
            return token.replace(/eed$/, 'ee');
    } else {
        var result = attemptReplace(token, /(ed|ing)$/, '', function(token) {
            if(categorizeGroups(token).indexOf('V') >= 0) {
                result = attemptReplacePatterns(token, [['at', '', 'ate'],  ['bl', '', 'ble'], ['iz', '', 'ize']]);

                if(result != token) {
        		    return result;
        		} else {
        		  if(endsWithDoublCons(token) && token.match(/[^lsz]$/)) {
        			 return token.replace(/([^aeiou])\1$/, '$1');
                    }

        		  if(measure(token) == 1 && categorizeChars(token).substr(-3) == 'CVC' && token.match(/[^wxy]$/)) {
        			 return token + 'e';
                    }
        		}                

        		return token;
    	    }
    	    
    	    return null;
    	});
    	
    	if(result) {
    	    return result;
        }
    }

    return token;   
}

// step 1c as defined for the porter stemmer algorithm. 
function step1c(token) {
    var categorizedGroups = categorizeGroups(token);

    if(token.substr(-1) == 'y' && categorizedGroups.substr(0, categorizedGroups.length - 1).indexOf('V') > -1) {
        return token.replace(/y$/, 'i');
    }

    return token;
}

// step 2 as defined for the porter stemmer algorithm. 
function step2(token) {
    token = replacePatterns(token, [['ational', '', 'ate'], ['tional', '', 'tion'], ['enci', '', 'ence'], ['anci', '', 'ance'],
        ['izer', '', 'ize'], ['abli', '', 'able'], ['bli', '', 'ble'], ['alli', '', 'al'], ['entli', '', 'ent'], ['eli', '', 'e'],
        ['ousli', '', 'ous'], ['ization', '', 'ize'], ['ation', '', 'ate'], ['ator', '', 'ate'],['alism', '', 'al'],
        ['iveness', '', 'ive'], ['fulness', '', 'ful'], ['ousness', '', 'ous'], ['aliti', '', 'al'],
        ['iviti', '', 'ive'], ['biliti', '', 'ble'], ['logi', '', 'log']], 0);

    return token;
}

// step 3 as defined for the porter stemmer algorithm. 
function step3(token) {
    return replacePatterns(token, [['icate', '', 'ic'], ['ative', '', ''], ['alize', '', 'al'],
				   ['iciti', '', 'ic'], ['ical', '', 'ic'], ['ful', '', ''], ['ness', '', '']], 0);
}

// step 4 as defined for the porter stemmer algorithm. 
function step4(token) {
    return replaceRegex(token, /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/, [1], 1) || 
        replaceRegex(token, /^(.+?)(s|t)(ion)$/, [1, 2], 1) ||
        token; 
}

// step 5a as defined for the porter stemmer algorithm. 
function step5a(token) {
    var m = measure(token.replace(/e$/, ''));



    if(m > 1 || (m == 1 && !(categorizeChars(token).substr(-4, 3) == 'CVC' && token.match(/[^wxy].$/)))) {
        token = token.replace(/e$/, '');
    }

    return token;
}

// step 5b as defined for the porter stemmer algorithm. 
function step5b(token) {
    if(measure(token) > 1) {
       return token.replace(/ll$/, 'l'); 
    }
    
    return token;
}

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;


// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
    if(token.length < 3) return token;
    return step5b(step5a(step4(step3(step2(step1c(step1b(step1a(token.toLowerCase())))))))).toString();
};

//exports for tests
PorterStemmer.categorizeGroups = categorizeGroups;
PorterStemmer.measure = measure;
PorterStemmer.step1a = step1a;
PorterStemmer.step1b = step1b;
PorterStemmer.step1c = step1c;
PorterStemmer.step2 = step2;
PorterStemmer.step3 = step3;
PorterStemmer.step4 = step4;
PorterStemmer.step5a = step5a;
PorterStemmer.step5b = step5b;

},{"./stemmer":76}],69:[function(require,module,exports){
/*
Copyright (c) 2012, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer_es');

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;


function isVowel(letter){
	return (letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o' || letter == 'u' || letter == 'á' || letter == 'é' ||
			letter == 'í' || letter == 'ó' || letter == 'ú');
};

function getNextVowelPos(token,start){
	length=token.length
			for (var i = start; i < length; i++)
				if (isVowel(token[i])) return i;
			return length;
};

function getNextConsonantPos(token,start){
	length=token.length
			for (var i = start; i < length; i++)
				if (!isVowel(token[i])) return i;
			return length;
};


function endsin(token, suffix) {
	if (token.length < suffix.length) return false;
	return (token.slice(-suffix.length) == suffix);
};

function endsinArr(token, suffixes) {
	for(var i=0;i<suffixes.length;i++){
		if (endsin(token, suffixes[i])) return suffixes[i];
	}
	return '';
};

function removeAccent(token) {
	var str=token.replace(/á/gi,'a');
	str=str.replace(/é/gi,'e');
	str=str.replace(/í/gi,'i');
	str=str.replace(/ó/gi,'o');
	str=str.replace(/ú/gi,'u');
	return str;
};

// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
	token = token.toLowerCase();

	if (token.length<3){
		return token;
	}

	var r1,r2,rv,len= token.length;
	//looking for regions after vowels

	for(var i=0; i< token.length-1 && r1==len;i++){
 		if(isVowel(token[i]) && !isVowel(token[i+1]) ){
 			r1=i+2;
 		}

	}

	for(var i=r1; i< token.length-1 && r2==len;i++){
		if(isVowel(token[i]) && !isVowel(token[i+1])){
			r2=i+2;
		}
	}

	if (len > 3) {
			if(isVowel(token[1])) {
				// If the second letter is a consonant, RV is the region after the next following vowel
				rv = getNextVowelPos(token, 2) +1;
			} else if (isVowel(token[0]) && isVowel(token[1])) {
				// or if the first two letters are vowels, RV is the region after the next consonant
				rv = getNextConsonantPos(token, 2) + 1;
			} else {
				//otherwise (consonant-vowel case) RV is the region after the third letter. But RV is the end of the word if these positions cannot be found.
				rv = 3;
			}
		}

	var r1_txt = token.substring(r1-1);
	var r2_txt = token.substring(r2-1);
	var rv_txt = token.substring(rv-1);


	var token_orig = token;

	// Step 0: Attached pronoun
	var pronoun_suf = new Array('me', 'se', 'sela', 'selo', 'selas', 'selos', 'la', 'le', 'lo', 'las', 'les', 'los', 'nos');
	var pronoun_suf_pre1 = new Array('éndo', 'ándo', 'ár', 'ér', 'ír');
	var pronoun_suf_pre2 = new Array('ando', 'iendo', 'ar', 'er', 'ir');
	var suf = endsinArr(token, pronoun_suf);


	if (suf!='') {

		var pre_suff = endsinArr(rv_txt.slice(0,-suf.length),pronoun_suf_pre1);

		if (pre_suff != '') {

				token = removeAccent(token.slice(0,-suf.length));
		} else {
			var pre_suff = endsinArr(rv_txt.slice(0,-suf.length),pronoun_suf_pre2);

			if (pre_suff != '' ||
				(endsin(token, 'yendo' ) &&
				(token.slice(-suf.length-6,1) == 'u'))) {
				token = token.slice(0,-suf.length);
			}
		}
	}

		if (token != token_orig) {
			r1_txt = token.substring(r1-1);
			r2_txt = token.substring(r2-1);
			rv_txt = token.substring(rv-1);
		}
		var token_after0 = token;

		if ((suf = endsinArr(r2_txt, new Array('anza', 'anzas', 'ico', 'ica', 'icos', 'icas', 'ismo', 'ismos', 'able', 'ables', 'ible', 'ibles', 'ista', 'istas', 'oso', 'osa', 'osos', 'osas', 'amiento', 'amientos', 'imiento', 'imientos'))) != '') {
			token = token.slice(0, -suf.length);
		} else if ((suf = endsinArr(r2_txt, new  Array('icadora', 'icador', 'icación', 'icadoras', 'icadores', 'icaciones', 'icante', 'icantes', 'icancia', 'icancias', 'adora', 'ador', 'ación', 'adoras', 'adores', 'aciones', 'ante', 'antes', 'ancia', 'ancias'))) != '') {
			token = token.slice(0,  -suf.length);
		} else if ((suf = endsinArr(r2_txt, new  Array('logía', 'logías'))) != '') {
			token = token.slice(0,  -suf.length)+ 'log';
		} else if ((suf =endsinArr(r2_txt, new  Array('ución', 'uciones'))) != '') {
			token = token.slice(0,  -suf.length) + 'u';
		} else if ((suf = endsinArr(r2_txt, new  Array('encia', 'encias'))) != '') {
			token = token.slice(0,  -suf.length)+ 'ente';
		} else if ((suf = endsinArr(r2_txt, new  Array('ativamente', 'ivamente', 'osamente', 'icamente', 'adamente'))) != '') {
			token = token.slice(0,  -suf.length);
		} else if ((suf = endsinArr(r1_txt, new  Array('amente'))) != '') {
			token = token.slice(0,  -suf.length);
		} else if ((suf = endsinArr(r2_txt, new  Array('antemente', 'ablemente', 'iblemente', 'mente'))) != '') {
			token = token.slice(0,  -suf.length);
		} else if ((suf = endsinArr(r2_txt, new  Array('abilidad', 'abilidades', 'icidad', 'icidades', 'ividad', 'ividades', 'idad', 'idades'))) != '') {
			token = token.slice(0,  -suf.length);
		} else if ((suf = endsinArr(r2_txt, new  Array('ativa', 'ativo', 'ativas', 'ativos', 'iva', 'ivo', 'ivas', 'ivos'))) != '') {
			token = token.slice(0,  -suf.length);
		}

		if (token != token_after0) {
			r1_txt = token.substring(r1-1);
			r2_txt = token.substring(r2-1);
			rv_txt = token.substring(rv-1);
		}
		var token_after1 = token;

		if (token_after0 == token_after1) {
			// Do step 2a if no ending was removed by step 1.
			if ((suf = endsinArr(rv_txt, new Array('ya', 'ye', 'yan', 'yen', 'yeron', 'yendo', 'yo', 'yó', 'yas', 'yes', 'yais', 'yamos'))) != '' && (token.substring(suf.length-1,1) == 'u')) {
				token = token.slice(0, -suf.length);
			}

			if (token != token_after1) {
				r1_txt = token.substring(r1-1);
				r2_txt = token.substring(r2-1);
				rv_txt = token.substring(rv-1);
			}
			var token_after2a = token;

			// Do Step 2b if step 2a was done, but failed to remove a suffix.
			if (token_after2a == token_after1) {

				if ((suf = endsinArr(rv_txt,new Array('en', 'es', 'éis', 'emos'))) != '') {
					token = token.slice(0,-suf.length);
					if (endsin(token, 'gu')) {
						token = token.slice(0,-1);
					}
				} else if ((suf = endsinArr(rv_txt, new Array('arían', 'arías', 'arán', 'arás', 'aríais', 'aría', 'aréis', 'aríamos', 'aremos', 'ará', 'aré', 'erían', 'erías', 'erán', 'erás', 'eríais', 'ería', 'eréis', 'eríamos', 'eremos', 'erá', 'eré', 'irían', 'irías', 'irán', 'irás', 'iríais', 'iría', 'iréis', 'iríamos', 'iremos', 'irá', 'iré', 'aba', 'ada', 'ida', 'ía', 'ara', 'iera', 'ad', 'ed', 'id', 'ase', 'iese', 'aste', 'iste', 'an', 'aban', 'ían', 'aran', 'ieran', 'asen', 'iesen', 'aron', 'ieron', 'ado', 'ido', 'ando', 'iendo', 'ió', 'ar', 'er', 'ir', 'as', 'abas', 'adas', 'idas', 'ías', 'aras', 'ieras', 'ases', 'ieses', 'ís', 'áis', 'abais', 'íais', 'arais', 'ierais', '  aseis', 'ieseis', 'asteis', 'isteis', 'ados', 'idos', 'amos', 'ábamos', 'íamos', 'imos', 'áramos', 'iéramos', 'iésemos', 'ásemos'))) != '') {

					token = token.slice(0, -suf.length);

				}
			}
		}

		// Always do step 3.
		r1_txt = token.substring(r1-1);
		r2_txt = token.substring(r2-1);
		rv_txt = token.substring(rv-1);

		if ((suf = endsinArr(rv_txt, new Array('os', 'a', 'o', 'á', 'í', 'ó'))) != '') {
			token = token.slice(0, -suf.length);
		} else if ((suf = endsinArr(rv_txt ,new Array('e','é'))) != '') {
			token = token.slice(0,-1);
			rv_txt = token.substring(rv-1);
			if (endsin(rv_txt,'u') && endsin(token,'gu')) {
				token = token.slice(0,-1);
			}
		}

		return removeAccent(token);

};

},{"./stemmer_es":77}],70:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel
Farsi Porter Stemmer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer_fa');

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;

// disabled stemming for Farsi
// Farsi stemming will be supported soon
PorterStemmer.stem = function(token) {
    return token;
};
},{"./stemmer_fa":78}],71:[function(require,module,exports){
'use strict';

/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
 * Spec for the French Porter Stemmer can be found at:
 * http://snowball.tartarus.org/algorithms/french/stemmer.html
 */

var Stemmer = require('./stemmer_fr');

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;

// Export
PorterStemmer.stem = stem;

// Exports for test purpose
PorterStemmer.prelude = prelude;
PorterStemmer.regions = regions;
PorterStemmer.endsinArr = endsinArr;

/**
 * Stem a word thanks to Porter Stemmer rules
 * @param  {String} token Word to be stemmed
 * @return {String}       Stemmed word
 */
function stem(token) {
  token = prelude(token.toLowerCase());

  if (token.length == 1)
    return token;

  var regs = regions(token);

  var r1_txt, r2_txt, rv_txt;
  r1_txt = token.substring(regs.r1);
  r2_txt = token.substring(regs.r2);
  rv_txt = token.substring(regs.rv);

  // Step 1
  var beforeStep1 = token;
  var suf, pref2, pref3, letterBefore, letter2Before, i;
  var doStep2a = false;

  if ((suf = endsinArr(r2_txt, ['ance', 'iqUe', 'isme', 'able', 'iste', 'eux', 'ances', 'iqUes', 'ismes', 'ables', 'istes'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(token, ['icatrice', 'icateur', 'ication', 'icatrices', 'icateurs', 'ications'])) != '') {
    if (endsinArr(r2_txt, ['icatrice', 'icateur', 'ication', 'icatrices', 'icateurs', 'ications']) != '') {
      token = token.slice(0, -suf.length); // delete
    } else {
      token = token.slice(0, -suf.length) + 'iqU'; // replace by iqU
    }
  } else if ((suf = endsinArr(r2_txt, ['atrice', 'ateur', 'ation', 'atrices', 'ateurs', 'ations'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(r2_txt, ['logie', 'logies'])) != '') {
    token = token.slice(0, -suf.length) + 'log'; // replace with log
  } else if ((suf = endsinArr(r2_txt, ['usion', 'ution', 'usions', 'utions'])) != '') {
    token = token.slice(0, -suf.length) + 'u'; // replace with u
  } else if ((suf = endsinArr(r2_txt, ['ence', 'ences'])) != '') {
    token = token.slice(0, -suf.length) + 'ent'; // replace with ent
  }
  // ement(s)
  else if ((suf = endsinArr(r1_txt, ['issement', 'issements'])) != '') {
    if (!isVowel(token[token.length - suf.length - 1])) {
      token = token.slice(0, -suf.length); // delete
      r1_txt = token.substring(regs.r1);
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
  } else if ((suf = endsinArr(r2_txt, ['ativement', 'ativements'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(r2_txt, ['ivement', 'ivements'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(token, ['eusement', 'eusements'])) != '') {
    if ((suf = endsinArr(r2_txt, ['eusement', 'eusements'])) != '')
      token = token.slice(0, -suf.length); // delete
    else if ((suf = endsinArr(r1_txt, ['eusement', 'eusements'])) != '')
      token = token.slice(0, -suf.length) + 'eux'; // replace by eux
    else if ((suf = endsinArr(rv_txt, ['ement', 'ements'])) != '')
      token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(r2_txt, ['ablement', 'ablements', 'iqUement', 'iqUements'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(rv_txt, ['ièrement', 'ièrements', 'Ièrement', 'Ièrements'])) != '') {
    token = token.slice(0, -suf.length) + 'i'; // replace by i
  } else if ((suf = endsinArr(rv_txt, ['ement', 'ements'])) != '') {
    token = token.slice(0, -suf.length); // delete
  }
  // ité(s)
  else if ((suf = endsinArr(token, ['icité', 'icités'])) != '') {
    if (endsinArr(r2_txt, ['icité', 'icités']) != '')
      token = token.slice(0, -suf.length); // delete
    else
      token = token.slice(0, -suf.length) + 'iqU'; // replace by iqU
  } else if ((suf = endsinArr(token, ['abilité', 'abilités'])) != '') {
    if (endsinArr(r2_txt, ['abilité', 'abilités']) != '')
      token = token.slice(0, -suf.length); // delete
    else
      token = token.slice(0, -suf.length) + 'abl'; // replace by abl
  } else if ((suf = endsinArr(r2_txt, ['ité', 'ités'])) != '') {
    token = token.slice(0, -suf.length); // delete if in R2
  } else if ((suf = endsinArr(token, ['icatif', 'icative', 'icatifs', 'icatives'])) != '') {
    if ((suf = endsinArr(r2_txt, ['icatif', 'icative', 'icatifs', 'icatives'])) != '') {
      token = token.slice(0, -suf.length); // delete
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
    if ((suf = endsinArr(r2_txt, ['atif', 'ative', 'atifs', 'atives'])) != '') {
      token = token.slice(0, -suf.length - 2) + 'iqU'; // replace with iqU
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
  } else if ((suf = endsinArr(r2_txt, ['atif', 'ative', 'atifs', 'atives'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(r2_txt, ['if', 'ive', 'ifs', 'ives'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(token, ['eaux'])) != '') {
    token = token.slice(0, -suf.length) + 'eau'; // replace by eau
  } else if ((suf = endsinArr(r1_txt, ['aux'])) != '') {
    token = token.slice(0, -suf.length) + 'al'; // replace by al
  } else if ((suf = endsinArr(r2_txt, ['euse', 'euses'])) != '') {
    token = token.slice(0, -suf.length); // delete
  } else if ((suf = endsinArr(r1_txt, ['euse', 'euses'])) != '') {
    token = token.slice(0, -suf.length) + 'eux'; // replace by eux
  } else if ((suf = endsinArr(rv_txt, ['amment'])) != '') {
    token = token.slice(0, -suf.length) + 'ant'; // replace by ant
    doStep2a = true;
  } else if ((suf = endsinArr(rv_txt, ['emment'])) != '') {
    token = token.slice(0, -suf.length) + 'ent'; // replace by ent
    doStep2a = true;
  } else if ((suf = endsinArr(rv_txt, ['ment', 'ments'])) != '') {
    // letter before must be a vowel in RV
    letterBefore = token[token.length - suf.length - 1];
    if (isVowel(letterBefore) && endsin(rv_txt, letterBefore + suf)) {
      token = token.slice(0, -suf.length); // delete
      doStep2a = true;
    }
  }

  // re compute regions
  r1_txt = token.substring(regs.r1);
  r2_txt = token.substring(regs.r2);
  rv_txt = token.substring(regs.rv);

  // Step 2a
  var beforeStep2a = token;
  var step2aDone = false;
  if (beforeStep1 === token || doStep2a) {
    step2aDone = true;
    if ((suf = endsinArr(rv_txt, ['îmes', 'ît', 'îtes', 'i', 'ie', 'Ie', 'ies', 'ir', 'ira', 'irai', 'iraIent', 'irais', 'irait', 'iras', 'irent', 'irez', 'iriez', 'irions', 'irons', 'iront', 'is', 'issaIent', 'issais', 'issait', 'issant', 'issante', 'issantes', 'issants', 'isse', 'issent', 'isses', 'issez', 'issiez', 'issions', 'issons', 'it'])) != '') {
      letterBefore = token[token.length - suf.length - 1];
      if (!isVowel(letterBefore) && endsin(rv_txt, letterBefore + suf))
        token = token.slice(0, -suf.length); // delete
    }
  }

  // Step 2b
  if (step2aDone && token === beforeStep2a) {
    if ((suf = endsinArr(rv_txt, ['é', 'ée', 'ées', 'és', 'èrent', 'er', 'era', 'erai', 'eraIent', 'erais', 'erait', 'eras', 'erez', 'eriez', 'erions', 'erons', 'eront', 'ez', 'iez', 'Iez'])) != '') {
      token = token.slice(0, -suf.length); // delete
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    } else if ((suf = endsinArr(rv_txt, ['ions'])) != '' && endsinArr(r2_txt, ['ions'])) {
      token = token.slice(0, -suf.length); // delete
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
    // add 'Ie' suffix to pass test for 'évanouie'
    else if ((suf = endsinArr(rv_txt, ['âmes', 'ât', 'âtes', 'a', 'ai', 'aIent', 'ais', 'ait', 'ant', 'ante', 'antes', 'ants', 'as', 'asse', 'assent', 'asses', 'assiez', 'assions'])) != '') {
      token = token.slice(0, -suf.length); // delete

      letterBefore = token[token.length - 1];
      if (letterBefore === 'e' && endsin(rv_txt, 'e' + suf))
        token = token.slice(0, -1);

      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
  }

  // Step 3
  if (!(token === beforeStep1)) {
    if (token[token.length - 1] === 'Y')
      token = token.slice(0, -1) + 'i';
    if (token[token.length - 1] === 'ç')
      token = token.slice(0, -1) + 'c';
  } // Step 4
  else {
    letterBefore = token[token.length - 1];
    letter2Before = token[token.length - 2];

    if (letterBefore === 's' && ['a', 'i', 'o', 'u', 'è', 's'].indexOf(letter2Before) == -1) {
      token = token.slice(0, -1);
      r1_txt = token.substring(regs.r1);
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }

    if ((suf = endsinArr(r2_txt, ['ion'])) != '') {
      letterBefore = token[token.length - suf.length - 1];
      if (letterBefore === 's' || letterBefore === 't') {
        token = token.slice(0, -suf.length); // delete
        r1_txt = token.substring(regs.r1);
        r2_txt = token.substring(regs.r2);
        rv_txt = token.substring(regs.rv);
      }
    }

    if ((suf = endsinArr(rv_txt, ['ier', 'ière', 'Ier', 'Ière'])) != '') {
      token = token.slice(0, -suf.length) + 'i'; // replace by i
      r1_txt = token.substring(regs.r1);
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
    if ((suf = endsinArr(rv_txt, 'e')) != '') {
      token = token.slice(0, -suf.length); // delete
      r1_txt = token.substring(regs.r1);
      r2_txt = token.substring(regs.r2);
      rv_txt = token.substring(regs.rv);
    }
    if ((suf = endsinArr(rv_txt, 'ë')) != '') {
      if (token.slice(token.length - 3, -1) === 'gu')
        token = token.slice(0, -suf.length); // delete
    }
  }

  // Step 5
  if ((suf = endsinArr(token, ['enn', 'onn', 'ett', 'ell', 'eill'])) != '') {
    token = token.slice(0, -1); // delete last letter
  }

  // Step 6
  i = token.length - 1;
  while (i > 0) {
    if (!isVowel(token[i])) {
      i--;
    } else if (i !== token.length - 1 && (token[i] === 'é' || token[i] === 'è')) {
      token = token.substring(0, i) + 'e' + token.substring(i + 1, token.length);
      break;
    } else {
      break;
    }
  }

  return token.toLowerCase();

};

/**
 * Compute r1, r2, rv regions as required by french porter stemmer algorithm
 * @param  {String} token Word to compute regions on
 * @return {Object}       Regions r1, r2, rv as offsets from the begining of the word
 */
function regions(token) {
  var r1, r2, rv, len;
  var i;

  r1 = r2 = rv = len = token.length;

  // R1 is the region after the first non-vowel following a vowel,
  for (var i = 0; i < len - 1 && r1 == len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r1 = i + 2;
    }
  }
  // Or is the null region at the end of the word if there is no such non-vowel.

  // R2 is the region after the first non-vowel following a vowel in R1
  for (i = r1; i < len - 1 && r2 == len; i++) {
    if (isVowel(token[i]) && !isVowel(token[i + 1])) {
      r2 = i + 2;
    }
  }
  // Or is the null region at the end of the word if there is no such non-vowel.

  // RV region
  var three = token.slice(0, 3);
  if (isVowel(token[0]) && isVowel(token[1])) {
    rv = 3;
  }
  if (three === 'par' || three == 'col' || three === 'tap')
    rv = 3;
  // the region after the first vowel not at the beginning of the word or null
  else {
    for (i = 1; i < len - 1 && rv == len; i++) {
      if (isVowel(token[i])) {
        rv = i + 1;
      }
    }
  }

  return {
    r1: r1,
    r2: r2,
    rv: rv
  };
};

/**
 * Pre-process/prepare words as required by french porter stemmer algorithm
 * @param  {String} token Word to be prepared
 * @return {String}       Prepared word
 */
function prelude(token) {
  token = token.toLowerCase();

  var result = '';
  var i = 0;

  // special case for i = 0 to avoid '-1' index
  if (token[i] === 'y' && isVowel(token[i + 1])) {
    result += token[i].toUpperCase();
  } else {
    result += token[i];
  }

  for (i = 1; i < token.length; i++) {
    if ((token[i] === 'u' || token[i] === 'i') && isVowel(token[i - 1]) && isVowel(token[i + 1])) {
      result += token[i].toUpperCase();
    } else if (token[i] === 'y' && (isVowel(token[i - 1]) || isVowel(token[i + 1]))) {
      result += token[i].toUpperCase();
    } else if (token[i] === 'u' && token[i - 1] === 'q') {
      result += token[i].toUpperCase();
    } else {
      result += token[i];
    }
  }

  return result;
};

/**
 * Return longest matching suffixes for a token or '' if no suffix match
 * @param  {String} token    Word to find matching suffix
 * @param  {Array} suffixes  Array of suffixes to test matching
 * @return {String}          Longest found matching suffix or ''
 */
function endsinArr(token, suffixes) {
  var i, longest = '';
  for (i = 0; i < suffixes.length; i++) {
    if (endsin(token, suffixes[i]) && suffixes[i].length > longest.length)
      longest = suffixes[i];
  }

  return longest;
};


function isVowel(letter) {
  return (letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o' || letter == 'u' || letter == 'y' || letter == 'â' || letter == 'à' || letter == 'ë' ||
    letter == 'é' || letter == 'ê' || letter == 'è' || letter == 'ï' || letter == 'î' || letter == 'ô' || letter == 'û' || letter == 'ù');
};

function endsin(token, suffix) {
  if (token.length < suffix.length) return false;
  return (token.slice(-suffix.length) == suffix);
};
},{"./stemmer_fr":79}],72:[function(require,module,exports){
/*
Copyright (c) 2012, Leonardo Fenu, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer_it');

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;


function isVowel(letter){
	return (letter == 'a' || letter == 'e' || letter == 'i' || letter == 'o' || letter == 'u' || letter == 'à' ||
			letter == 'è' || letter == 'ì' || letter == 'ò' || letter == 'ù');
};

function getNextVowelPos(token,start){
	start = start + 1;
	var length = token.length;
	for (var i = start; i < length; i++) {
		if (isVowel(token[i])) {
			return i;
		}
	}
	return length;
};

function getNextConsonantPos(token,start){
	length=token.length
			for (var i = start; i < length; i++)
				if (!isVowel(token[i])) return i;
			return length;
};


function endsin(token, suffix) {
	if (token.length < suffix.length) return false;
	return (token.slice(-suffix.length) == suffix);
};

function endsinArr(token, suffixes) {
	for(var i=0;i<suffixes.length;i++){
		if (endsin(token, suffixes[i])) return suffixes[i];
	}
	return '';
};

function replaceAcute(token) {
	var str=token.replace(/á/gi,'à');
	str=str.replace(/é/gi,'è');
	str=str.replace(/í/gi,'ì');
	str=str.replace(/ó/gi,'ò');
	str=str.replace(/ú/gi,'ù');
	return str;
};

function vowelMarking(token) {
	function replacer(match, p1, p2, p3){
  		return p1+p2.toUpperCase()+p3;
	};	
	str=token.replace(/([aeiou])(i|u)([aeiou])/g, replacer);	
	return str;
}


// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
	
	token = token.toLowerCase();
	token = replaceAcute(token);
	token = token.replace(/qu/g,'qU');	
	token = vowelMarking(token);
	
	if (token.length<3){
		return token;
	}

	var r1 = r2 = rv = len = token.length;
	// R1 is the region after the first non-vowel following a vowel, 
	for(var i=0; i < token.length-1 && r1==len;i++){
 		if(isVowel(token[i]) && !isVowel(token[i+1]) ){
 			r1=i+2;
 		}
	}
	// Or is the null region at the end of the word if there is no such non-vowel.  

	// R2 is the region after the first non-vowel following a vowel in R1
	for(var i=r1; i< token.length-1 && r2==len;i++){
		if(isVowel(token[i]) && !isVowel(token[i+1])){
			r2=i+2;
		}
	}

	// Or is the null region at the end of the word if there is no such non-vowel. 

	// If the second letter is a consonant, RV is the region after the next following vowel, 
	
	// RV as follow

	if (len > 3) {
		if(!isVowel(token[1])) {
			// If the second letter is a consonant, RV is the region after the next following vowel
			rv = getNextVowelPos(token, 1) +1;
		} else if (isVowel(token[0]) && isVowel(token[1])) { 
			// or if the first two letters are vowels, RV is the region after the next consonant
			rv = getNextConsonantPos(token, 2) + 1;
		} else {
			//otherwise (consonant-vowel case) RV is the region after the third letter. But RV is the end of the word if these positions cannot be found.
			rv = 3;
		}
	}

	var r1_txt = token.substring(r1);
	var r2_txt = token.substring(r2);
	var rv_txt = token.substring(rv);

	var token_orig = token;

	// Step 0: Attached pronoun

	var pronoun_suf = new Array('glieli','glielo','gliene','gliela','gliele','sene','tene','cela','cele','celi','celo','cene','vela','vele','veli','velo','vene','mela','mele','meli','melo','mene','tela','tele','teli','telo','gli','ci', 'la','le','li','lo','mi','ne','si','ti','vi');	
	var pronoun_suf_pre1 = new Array('ando','endo');	
	var pronoun_suf_pre2 = new Array('ar', 'er', 'ir');
	var suf = endsinArr(token, pronoun_suf);

	if (suf!='') {
		var pre_suff1 = endsinArr(rv_txt.slice(0,-suf.length),pronoun_suf_pre1);
		var pre_suff2 = endsinArr(rv_txt.slice(0,-suf.length),pronoun_suf_pre2);	
		
		if (pre_suff1 != '') {
			token = token.slice(0,-suf.length);
		}
		if (pre_suff2 != '') {
			token = token.slice(0,  -suf.length)+ 'e';
		}
	}

	if (token != token_orig) {
		r1_txt = token.substring(r1);
		r2_txt = token.substring(r2);
		rv_txt = token.substring(rv);
	}

	var token_after0 = token;

	// Step 1:  Standard suffix removal
	
	if ((suf = endsinArr(r2_txt, new  Array('ativamente','abilamente','ivamente','osamente','icamente'))) != '') {
		token = token.slice(0, -suf.length);	// delete
	} else if ((suf = endsinArr(r2_txt, new  Array('icazione','icazioni','icatore','icatori','azione','azioni','atore','atori'))) != '') {
		token = token.slice(0,  -suf.length);	// delete
	} else if ((suf = endsinArr(r2_txt, new  Array('logia','logie'))) != '') {
		token = token.slice(0,  -suf.length)+ 'log'; // replace with log
	} else if ((suf =endsinArr(r2_txt, new  Array('uzione','uzioni','usione','usioni'))) != '') {
		token = token.slice(0,  -suf.length) + 'u'; // replace with u
	} else if ((suf = endsinArr(r2_txt, new  Array('enza','enze'))) != '') {
		token = token.slice(0,  -suf.length)+ 'ente'; // replace with ente
	} else if ((suf = endsinArr(rv_txt, new  Array('amento', 'amenti', 'imento', 'imenti'))) != '') {
		token = token.slice(0,  -suf.length);	// delete
	} else if ((suf = endsinArr(r1_txt, new  Array('amente'))) != '') {
		token = token.slice(0,  -suf.length); // delete
	} else if ((suf = endsinArr(r2_txt, new Array('atrice','atrici','abile','abili','ibile','ibili','mente','ante','anti','anza','anze','iche','ichi','ismo','ismi','ista','iste','isti','istà','istè','istì','ico','ici','ica','ice','oso','osi','osa','ose'))) != '') {
		token = token.slice(0,  -suf.length); // delete
	} else if ((suf = endsinArr(r2_txt, new  Array('abilità', 'icità', 'ività', 'ità'))) != '') {
		token = token.slice(0,  -suf.length); // delete
	} else if ((suf = endsinArr(r2_txt, new  Array('icativa','icativo','icativi','icative','ativa','ativo','ativi','ative','iva','ivo','ivi','ive'))) != '') {
		token = token.slice(0,  -suf.length);
	}
	
	
	if (token != token_after0) {
		r1_txt = token.substring(r1);
		r2_txt = token.substring(r2);
		rv_txt = token.substring(rv);
	}
	

	var token_after1 = token;
	
	// Step 2:  Verb suffixes

	if (token_after0 == token_after1) {
		if ((suf = endsinArr(rv_txt, new Array('erebbero','irebbero','assero','assimo','eranno','erebbe','eremmo','ereste','eresti','essero','iranno','irebbe','iremmo','ireste','iresti','iscano','iscono','issero','arono','avamo','avano','avate','eremo','erete','erono','evamo','evano','evate','iremo','irete','irono','ivamo','ivano','ivate','ammo','ando','asse','assi','emmo','enda','ende','endi','endo','erai','Yamo','iamo','immo','irai','irei','isca','isce','isci','isco','erei','uti','uto','ita','ite','iti','ito','iva','ivi','ivo','ono','uta','ute','ano','are','ata','ate','ati','ato','ava','avi','avo','erà','ere','erò','ete','eva','evi','evo','irà','ire','irò','ar','ir'))) != '') {
			token = token.slice(0, -suf.length);
		}
	}

	
	r1_txt = token.substring(r1);
	r2_txt = token.substring(r2);
	rv_txt = token.substring(rv);

	// Always do step 3. 

	if ((suf = endsinArr(rv_txt, new Array('ia', 'ie', 'ii', 'io', 'ià', 'iè','iì', 'iò','a','e','i','o','à','è','ì','ò'))) != '') {
		token = token.slice(0, -suf.length);
	} 

	r1_txt = token.substring(r1);
	r2_txt = token.substring(r2);
	rv_txt = token.substring(rv);
	
	if ((suf =endsinArr(rv_txt, new  Array('ch'))) != '') {
		token = token.slice(0,  -suf.length) + 'c'; // replace with c
	} else if ((suf =endsinArr(rv_txt, new  Array('gh'))) != '') {
		token = token.slice(0,  -suf.length) + 'g'; // replace with g
	}

	
	r1_txt = token.substring(r1);
	r2_txt = token.substring(r2);
	rv_txt = token.substring(rv);

	return token.toLowerCase();

};
},{"./stemmer_it":80}],73:[function(require,module,exports){
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer_no');

// Get the part of the token after the first non-vowel following a vowel
function getR1(token) {
    var match = token.match(/[aeiouyæåø]{1}[^aeiouyæåø]([A-Za-z0-9_æøåÆØÅäÄöÖüÜ]+)/);

    if (match) {
        var preR1Length = match.index + 2;

        if (preR1Length < 3 && preR1Length > 0) {
            return token.slice(3);
        } else if (preR1Length >= 3) {
            return match[1];
        } else {
            return token;
        }
    }

    return null;
}

function step1(token) {
    // Perform step 1a-c
    var step1aResult = step1a(token),
        step1bResult = step1b(token),
        step1cResult = step1c(token);

    // Returne the shortest result string (from 1a, 1b and 1c)
    if (step1aResult.length < step1bResult.length) {
        return (step1aResult.length < step1cResult.length) ? step1aResult : step1cResult;
    } else {
        return (step1bResult.length < step1cResult.length) ? step1bResult : step1cResult;
    }
}

// step 1a as defined for the porter stemmer algorithm.
function step1a(token) {
    var r1 = getR1(token);

    if (!r1) {
        return token;
    }

    var r1Match = r1.match(/(a|e|ede|ande|ende|ane|ene|hetene|en|heten|ar|er|heter|as|es|edes|endes|enes|hetenes|ens|hetens|ers|ets|et|het|ast)$/);

    if (r1Match) {
        return token.replace(new RegExp(r1Match[1] + '$'), '');
    }

    return token;
}

// step 1b as defined for the porter stemmer algorithm.
function step1b(token) {
    var r1 = getR1(token);

    if (!r1) {
        return token;
    }

    if (token.match(/(b|c|d|f|g|h|j|l|m|n|o|p|r|t|v|y|z)s$/)) {
        return token.slice(0, -1);
    }

    if (token.match(/([^aeiouyæåø]k)s$/)) {
        return token.slice(0, -1);
    }

    return token;
}

// step 1c as defined for the porter stemmer algorithm.
function step1c(token) {
    var r1 = getR1(token);

    if (!r1) {
        return token;
    }

    if (r1.match(/(erte|ert)$/)) {
        return token.replace(/(erte|ert)$/, 'er');
    }

    return token;
}

// step 2 as defined for the porter stemmer algorithm.
function step2(token) {
    var r1 = getR1(token);

    if (!r1) {
        return token;
    }

    if (r1.match(/(d|v)t$/)) {
        return token.slice(0, -1);
    }

    return token;
}

// step 3 as defined for the porter stemmer algorithm.
function step3(token) {
    var r1 = getR1(token);

    if (!r1)
        return token;

    var r1Match = r1.match(/(leg|eleg|ig|eig|lig|elig|els|lov|elov|slov|hetslov)$/);

    if (r1Match) {
        return token.replace(new RegExp(r1Match[1] + '$'), '');
    }

    return token;
}

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;

// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
    return step3(step2(step1(token.toLowerCase()))).toString();
};

//exports for tests
PorterStemmer.getR1  = getR1;
PorterStemmer.step1  = step1;
PorterStemmer.step1a = step1a;
PorterStemmer.step1b = step1b;
PorterStemmer.step1c = step1c;
PorterStemmer.step2  = step2;
PorterStemmer.step3  = step3;
},{"./stemmer_no":82}],74:[function(require,module,exports){
/*
Copyright (c) 2015, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

module.exports = (function () {
  'use strict';

  var Stemmer     = require('./stemmer_pt'),
    Token         = require('./token'),
    PorterStemmer = new Stemmer();

  /**
   * Marks a region after the first non-vowel following a vowel, or the
   * null region at the end of the word if there is no such non-vowel.
   *
   * @param {Object} token Token to stem.
   * @param {Number} start Start index (defaults to 0).
   * @param {Number}       Region start index.
   */
   var markRegionN = function (start) {
    var index = start || 0,
      length = this.string.length,
      region = length;

    while (index < length - 1 && region === length) {
      if (this.hasVowelAtIndex(index) && !this.hasVowelAtIndex(index + 1)) {
        region = index + 2;
      }
      index++;
    }

    return region;
  };

  /**
   * Mark RV.
   *
   * @param  {Object} token Token to stem.
   * @return {Number}       Region start index.
   */
  var markRegionV = function () {
    var rv = this.string.length;

    if (rv > 3) {
      if (!this.hasVowelAtIndex(1)) {
        rv = this.nextVowelIndex(2) + 1;

      } else if (this.hasVowelAtIndex(0) && this.hasVowelAtIndex(1)) {
        rv = this.nextConsonantIndex(2) + 1;

      } else {
        rv = 3;
      }
    }

    return rv;
  };

  /**
   * Prelude.
   *
   * Nasalised vowel forms should be treated as a vowel followed by a consonant.
   *
   * @param  {String} token Word to stem.
   * @return {String}       Stemmed token.
   */
  function prelude (token) {
    return token
    .replaceAll('ã', 'a~')
    .replaceAll('õ', 'o~');
  }

  /**
   * Step 1: Standard suffix removal.
   *
   * This step should always be performed.
   *
   * @param  {Token} token Word to stem.
   * @return {Token}       Stemmed token.
   */
  function standardSuffix (token) {

    token.replaceSuffixInRegion([
      'amentos', 'imentos', 'aço~es', 'adoras', 'adores', 'amento', 'imento',

      'aça~o', 'adora', 'ância', 'antes', 'ismos', 'istas',

      'ador', 'ante', 'ável', 'ezas', 'icas', 'icos', 'ismo', 'ista', 'ível',
      'osas', 'osos',

      'eza', 'ica', 'ico', 'osa', 'oso'

      ], '', 'r2');

    token.replaceSuffixInRegion(['logias', 'logia'], 'log', 'r2');

    // token.replaceSuffixInRegion(['uço~es', 'uça~o'], 'u', 'r1');

    token.replaceSuffixInRegion(['ências', 'ência'], 'ente', 'r2');

    token.replaceSuffixInRegion([
      'ativamente', 'icamente', 'ivamente', 'osamente', 'adamente'
    ], '', 'r2');

    token.replaceSuffixInRegion('amente', '', 'r1');

    token.replaceSuffixInRegion([
      'antemente', 'avelmente', 'ivelmente', 'mente'
    ], '', 'r2');

    token.replaceSuffixInRegion([
      'abilidades', 'abilidade',
      'icidades', 'icidade',
      'ividades', 'ividade',
      'idades', 'idade'
    ], '', 'r2');

    token.replaceSuffixInRegion([
      'ativas', 'ativos', 'ativa', 'ativo',
      'ivas', 'ivos', 'iva', 'ivo'
    ], '', 'r2');

    if (token.hasSuffix('eiras') || token.hasSuffix('eira')) {
      token.replaceSuffixInRegion(['iras', 'ira'], 'ir', 'rv');
    }

    return token;
  }

  /**
   * Step 2: Verb suffix removal.
   *
   * Perform this step if no ending was removed in step 1.
   *
   * @param  {Token} token   Token to stem.
   * @return {Token}         Stemmed token.
   */
  function verbSuffix (token) {

    token.replaceSuffixInRegion([
      'aríamos', 'ássemos', 'eríamos', 'êssemos', 'iríamos', 'íssemos',

      'áramos', 'aremos', 'aríeis', 'ásseis', 'ávamos', 'éramos', 'eremos',
      'eríeis', 'ésseis', 'íramos', 'iremos', 'iríeis', 'ísseis',

      'ara~o', 'ardes', 'areis', 'áreis', 'ariam', 'arias', 'armos', 'assem',
      'asses', 'astes', 'áveis', 'era~o', 'erdes', 'ereis', 'éreis', 'eriam',
      'erias', 'ermos', 'essem', 'esses', 'estes', 'íamos', 'ira~o', 'irdes',
      'ireis', 'íreis', 'iriam', 'irias', 'irmos', 'issem', 'isses', 'istes',

      'adas', 'ados', 'amos', 'ámos', 'ando', 'aram', 'aras', 'arás', 'arei',
      'arem', 'ares', 'aria', 'asse', 'aste', 'avam', 'avas', 'emos', 'endo',
      'eram', 'eras', 'erás', 'erei', 'erem', 'eres', 'eria', 'esse', 'este',
      'idas', 'idos', 'íeis', 'imos', 'indo', 'iram', 'iras', 'irás', 'irei',
      'irem', 'ires', 'iria', 'isse', 'iste',

      'ada', 'ado', 'ais', 'ara', 'ará', 'ava', 'eis', 'era', 'erá', 'iam',
      'ias', 'ida', 'ido', 'ira', 'irá',

      'am', 'ar', 'as', 'ei', 'em', 'er', 'es', 'eu', 'ia', 'ir', 'is', 'iu', 'ou'

    ], '', 'rv');

    return token;
  }

  /**
   * Step 3: Delete suffix i.
   *
   * Perform this step if the word was changed, in RV and preceded by c.
   *
   * @param  {Token} token   Token to stem.
   * @return {Token}         Stemmed token.
   */
  function iPrecededByCSuffix (token) {

    if (token.hasSuffix('ci')) {
      token.replaceSuffixInRegion('i', '', 'rv');
    }

    return token;
  }

  /**
   * Step 4: Residual suffix.
   *
   * Perform this step if steps 1 and 2 did not alter the word.
   *
   * @param  {Token} token Token to stem.
   * @return {Token}       Stemmed token.
   */
  function residualSuffix (token) {

    token.replaceSuffixInRegion(['os', 'a', 'i', 'o', 'á', 'í', 'ó'], '', 'rv');

    return token;
  }

  /**
   * Step 5: Residual form.
   *
   * This step should always be performed.
   *
   * @param  {Token} token Token to stem.
   * @return {Token}       Stemmed token.
   */
  function residualForm (token) {

    var tokenString = token.string;

    if (token.hasSuffix('gue') || token.hasSuffix('gué') || token.hasSuffix('guê')) {
      token.replaceSuffixInRegion(['ue', 'ué', 'uê'], '', 'rv');
    }

    if (token.hasSuffix('cie') || token.hasSuffix('cié') || token.hasSuffix('ciê')) {
      token.replaceSuffixInRegion(['ie', 'ié', 'iê'], '', 'rv');
    }

    if (tokenString === token.string) {
      token.replaceSuffixInRegion(['e', 'é', 'ê'], '', 'rv');
    }

    token.replaceSuffixInRegion('ç', 'c', 'all');

    return token;
  }

  /**
   * Postlude.
   *
   * Turns a~, o~ back into ã, õ.
   *
   * @param  {String} token Word to stem.
   * @return {String}       Stemmed token.
   */
  function postlude (token) {
    return token
      .replaceAll('a~', 'ã')
      .replaceAll('o~', 'õ');
  }

  /**
   * Stems a word using a Porter stemmer algorithm.
   *
   * @param  {String} word Word to stem.
   * @return {String}      Stemmed token.
   */
  PorterStemmer.stem = function (word) {
    var token = new Token(word.toLowerCase()),
      original;

    token = prelude(token);

    token.usingVowels('aeiouáéíóúâêôàãõ')
      .markRegion('all', 0)
      .markRegion('r1', null, markRegionN)
      .markRegion('r2', token.regions.r1, markRegionN)
      .markRegion('rv', null, markRegionV);

    original = token.string;

    // Always do step 1.
    token = standardSuffix(token);

    // Do step 2 if no ending was removed by step 1.
    if (token.string === original) {
      token = verbSuffix(token);
    }

    // If the last step to be obeyed — either step 1 or 2 — altered the word,
    // do step 3. Alternatively, if neither steps 1 nor 2 altered the word, do
    // step 4.
    token = token.string !== original ? iPrecededByCSuffix(token) : residualSuffix(token);

    // Always do step 5.
    token = residualForm(token);

    token = postlude(token);

    return token.string;
  };

  return PorterStemmer;
})();

},{"./stemmer_pt":84,"./token":86}],75:[function(require,module,exports){
/*
Copyright (c) 2012, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Stemmer = require('./stemmer_ru');

var PorterStemmer = new Stemmer();
module.exports = PorterStemmer;

function attemptReplacePatterns(token, patterns) {
	var replacement = null;
	var i = 0, isReplaced = false;
	while ((i < patterns.length) && !isReplaced) {
		if (patterns[i][0].test(token)) {
			replacement = token.replace(patterns[i][0], patterns[i][1]);
			isReplaced = true;
		}
		i++;
	}
	return replacement;
};

function perfectiveGerund(token) {
	var result = attemptReplacePatterns(token, [
			[/[ая]в(ши|шись)$/g, ''],
			[/(ив|ивши|ившись|ывши|ывшись|ыв)$/g, '']
		]);
	return result;
};

function adjectival(token) {
	var result = adjective(token);
	if (result != null) {
		var pariticipleResult = participle(result);
		result = pariticipleResult ? pariticipleResult : result;
	}
	return result;
};

function adjective(token) {
	var result = attemptReplacePatterns(token, [
			[/(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/g, '']
		]);
	return result;
};

function participle(token) {
	var result = attemptReplacePatterns(token, [
		[/([ая])(ем|нн|вш|ющ|щ)$/g, '$1'],
		[/(ивш|ывш|ующ)$/g, '']
	]);
	return result;
};

function reflexive(token) {
	var result = attemptReplacePatterns(token, [
		[/(ся|сь)$/g, '']
	]);
	return result;
};

function verb(token) {
	var result = attemptReplacePatterns(token, [
		[/([ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/g, '$1'],
		[/(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/g, '']
	]);
	return result;
};

function noun(token) {
	var result = attemptReplacePatterns(token, [
		[/(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/g, '']
	]);
	return result;
};

function superlative (token) {
	var result = attemptReplacePatterns(token, [
		[/(ейш|ейше)$/g, '']
	]);
	return result;
};

function derivational (token) {
	var result = attemptReplacePatterns(token, [
		[/(ост|ость)$/g, '']
	]);
	return result;
};

// perform full stemming algorithm on a single word
PorterStemmer.stem = function(token) {
	token = token.toLowerCase().replace(/ё/g, 'е');
	var volwesRegexp = /^(.*?[аеиоюяуыиэ])(.*)$/g;
	var RV = volwesRegexp.exec(token);
	if (!RV || RV.length < 3) {
		return token;
	}
	var head = RV[1];
	RV = RV[2];
	volwesRegexp.lastIndex = 0;
	var R2 = volwesRegexp.exec(RV);
	var result = perfectiveGerund(RV);
	if (result === null) {
		var resultReflexive = reflexive(RV) || RV;
		result = adjectival(resultReflexive);
		if (result === null) {
			result = verb(resultReflexive);
			if (result === null) {
				result = noun(resultReflexive);
				if (result === null) {
					result = resultReflexive;
				}
			}
		}
	}
	result = result.replace(/и$/g, '');
	var derivationalResult = result
	if (R2 && R2[2]) {
		derivationalResult = derivational(R2[2]);
		if (derivationalResult != null) {
			derivationalResult = derivational(result);
		} else {
			derivationalResult = result;
		}
	}

	var superlativeResult = superlative(derivationalResult) || derivationalResult;

	superlativeResult = superlativeResult.replace(/(н)н/g, '$1');
	superlativeResult = superlativeResult.replace(/ь$/g, '');
	return head + superlativeResult;
};

},{"./stemmer_ru":85}],76:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords');
var Tokenizer = require('../tokenizers/aggressive_tokenizer');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.addStopWord = function(stopWord) {
        stopwords.words.push(stopWord);
    };

    stemmer.addStopWords = function(moreStopWords) {
        stopwords.words = stopwords.words.concat(moreStopWords);
    };

    stemmer.removeStopWord = function(stopWord) {
        this.removeStopWords([stopWord])
    };

    stemmer.removeStopWords = function(moreStopWords) {
        moreStopWords.forEach(function(stopWord){
            var idx = stopwords.words.indexOf(stopWord);
            if (idx >= 0) {
                stopwords.words.splice(idx, 1);
            }
        });

    };


    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];
        var lowercaseText = text.toLowerCase();
        var tokens = new Tokenizer().tokenize(lowercaseText);

        if (keepStops) {
            tokens.forEach(function(token) {
                stemmedTokens.push(stemmer.stem(token));
            });
        }

        else {
            tokens.forEach(function(token) {
                if (stopwords.words.indexOf(token) == -1)
                    stemmedTokens.push(stemmer.stem(token));
            });
        }

        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };

        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer":88,"../util/stopwords":110}],77:[function(require,module,exports){
/*
Copyright (c) 2012, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_es');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_es');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];
        
        new Tokenizer().tokenize(text).forEach(function(token) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(new RegExp('[a-záéíóúüñ0-9]+', 'gi'))) {
                    resultToken = stemmer.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        });
        
        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };
        
        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer_es":89,"../util/stopwords_es":111}],78:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel
Farsi Stemmer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_fa');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_fa');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];
        
        new Tokenizer().tokenize(text).forEach(function(token) {
            if(keepStops || stopwords.words.indexOf(token) == -1)
                stemmedTokens.push(stemmer.stem(token));
        });
        
        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };
        
        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer_fa":90,"../util/stopwords_fa":112}],79:[function(require,module,exports){
/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_fr');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_fr');

module.exports = function() {
   var stemmer = this;

   stemmer.stem = function(token) {
      return token;
   };

   stemmer.tokenizeAndStem = function(text, keepStops) {
      var stemmedTokens = [];

      new Tokenizer().tokenize(text).forEach(function(token) {
         if (keepStops || stopwords.words.indexOf(token) == -1) {
            var resultToken = token.toLowerCase();
            if (resultToken.match(/[a-zâàëéêèïîôûùç0-9]/gi)) {
               resultToken = stemmer.stem(resultToken);
            }
            stemmedTokens.push(resultToken);
         }
      });

      return stemmedTokens;
   };

   stemmer.attach = function() {
      String.prototype.stem = function() {
         return stemmer.stem(this);
      };

      String.prototype.tokenizeAndStem = function(keepStops) {
         return stemmer.tokenizeAndStem(this, keepStops);
      };
   };
}

},{"../tokenizers/aggressive_tokenizer_fr":91,"../util/stopwords_fr":113}],80:[function(require,module,exports){
var stopwords = require('../util/stopwords_it');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_it');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];
        
        new Tokenizer().tokenize(text).forEach(function(token) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(/[a-zàèìòù0-9]/gi)) {
                    resultToken = stemmer.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        });
        
        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };
        
        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}
},{"../tokenizers/aggressive_tokenizer_it":92,"../util/stopwords_it":114}],81:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A very basic stemmer that performs the following steps:
 * * Stem katakana.
 * Inspired by:
 * http://svn.apache.org/repos/asf/lucene/dev/trunk/lucene/analysis/kuromoji/src/java/org/apache/lucene/analysis/ja/JapaneseKatakanaStemFilter.java
 *
 * This script assumes input is normalized using normalizer_ja().
 *
 * \@todo Use .bind() in StemmerJa.prototype.attach().
 */

var Tokenizer = require('../tokenizers/tokenizer_ja');
var stopwords = require('../util/stopwords_ja');



/**
 * @constructor
 */
var StemmerJa = function() {
};


/**
 * Tokenize and stem a text.
 * Stop words are excluded except if the second argument is true.
 *
 * @param {string} text
 * @param {boolean} keepStops Whether to keep stop words from the output or not.
 * @return {Array.<string>}
 */
StemmerJa.prototype.tokenizeAndStem = function(text, keepStops) {
  var self = this;
  var stemmedTokens = [];
  var tokens = new Tokenizer().tokenize(text);

  // This is probably faster than an if at each iteration.
  if (keepStops) {
    tokens.forEach(function(token) {
      var resultToken = token.toLowerCase();
      resultToken = self.stem(resultToken);
      stemmedTokens.push(resultToken);
    });
  } else {
    tokens.forEach(function(token) {
      if (stopwords.indexOf(token) == -1) {
        var resultToken = token.toLowerCase();
        resultToken = self.stem(resultToken);
        stemmedTokens.push(resultToken);
      }
    });
  }

  return stemmedTokens;
};


/**
 * Stem a term.
 *
 * @param {string} token
 * @return {string}
 */
StemmerJa.prototype.stem = function(token) {
  token = this.stemKatakana(token);

  return token;
};


/**
 * Remove the final prolonged sound mark on katakana if length is superior to
 * a threshold.
 *
 * @param {string} token A katakana string to stem.
 * @return {string} A katakana string stemmed.
 */
StemmerJa.prototype.stemKatakana = function(token) {
  var HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK = 'ー';
  var DEFAULT_MINIMUM_LENGTH = 4;

  if (token.length >= DEFAULT_MINIMUM_LENGTH
      && token.slice(-1) === HIRAGANA_KATAKANA_PROLONGED_SOUND_MARK
      && this.isKatakana(token)) {
    token = token.slice(0, token.length - 1);
  }
  return token;
};


/**
 * Is a string made of fullwidth katakana only?
 * This implementation is the fastest I know:
 * http://jsperf.com/string-contain-katakana-only/2
 *
 * @param {string} str A string.
 * @return {boolean} True if the string has katakana only.
 */
StemmerJa.prototype.isKatakana = function(str) {
  return !!str.match(/^[゠-ヿ]+$/);
};

// Expose an attach function that will patch String with new methods.
StemmerJa.prototype.attach = function() {
  var self = this;

  String.prototype.stem = function() {
    return self.stem(this);
  };

  String.prototype.tokenizeAndStem = function(keepStops) {
    return self.tokenizeAndStem(this, keepStops);
  };
};

module.exports = StemmerJa;

},{"../tokenizers/tokenizer_ja":102,"../util/stopwords_ja":115}],82:[function(require,module,exports){
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_no');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_no');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.addStopWord = function(stopWord) {
        stopwords.words.push(stopWord);
    };

    stemmer.addStopWords = function(moreStopWords) {
        stopwords.words = stopwords.words.concat(moreStopWords);
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];

        new Tokenizer().tokenize(text).forEach(function(token) {
            if(keepStops || stopwords.words.indexOf(token.toLowerCase()) == -1)
                stemmedTokens.push(stemmer.stem(token));
        });

        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };

        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer_no":94,"../util/stopwords_no":116}],83:[function(require,module,exports){
/*
Copyright (c) 2013, Paweł Łaskarzewski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_pl');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_pl');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];

        new Tokenizer().tokenize(text).forEach(function(token) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(new RegExp('[a-zążśźęćńół0-9]+', 'gi'))) {
                    resultToken = stemmer.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        });

        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };

        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer_pl":95,"../util/stopwords_pl":117}],84:[function(require,module,exports){
/*
Copyright (c) 2014, Ismaël Héry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

module.exports = function () {
  'use strict';

  var Stemmer = this,
    stopwords = require('../util/stopwords_pt'),
    Tokenizer = require('../tokenizers/aggressive_tokenizer_pt');

  Stemmer.stem = function (token) {
    return token;
  };

  Stemmer.addStopWords = function (word) {
    stopwords.words.push(word);
  };

  Stemmer.addStopWords = function (words) {
    stopwords.words = stopwords.words.concat(words);
  };

  Stemmer.tokenizeAndStem = function(text, keepStops) {
    var stemmedTokens = [];

    var tokenStemmer = function (token) {
      if (keepStops || stopwords.words.indexOf(token.toLowerCase()) === -1) {
        stemmedTokens.push(Stemmer.stem(token));
      }
    };

    new Tokenizer().tokenize(text).forEach(tokenStemmer);

    return stemmedTokens;
  };

  Stemmer.attach = function () {
    String.prototype.stem = function () {
      return Stemmer.stem(this);
    };

    String.prototype.tokenizeAndStem = function (keepStops) {
      return Stemmer.tokenizeAndStem(this, keepStops);
    };
  };
};

},{"../tokenizers/aggressive_tokenizer_pt":96,"../util/stopwords_pt":118}],85:[function(require,module,exports){
/*
Copyright (c) 2012, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var stopwords = require('../util/stopwords_ru');
var Tokenizer = require('../tokenizers/aggressive_tokenizer_ru');

module.exports = function() {
    var stemmer = this;

    stemmer.stem = function(token) {
        return token;
    };

    stemmer.tokenizeAndStem = function(text, keepStops) {
        var stemmedTokens = [];
        
        new Tokenizer().tokenize(text).forEach(function(token) {
            if (keepStops || stopwords.words.indexOf(token) == -1) {
                var resultToken = token.toLowerCase();
                if (resultToken.match(new RegExp('[а-яё0-9]+', 'gi'))) {
                    resultToken = stemmer.stem(resultToken);
                }
                stemmedTokens.push(resultToken);
            }
        });
        
        return stemmedTokens;
    };

    stemmer.attach = function() {
        String.prototype.stem = function() {
            return stemmer.stem(this);
        };
        
        String.prototype.tokenizeAndStem = function(keepStops) {
            return stemmer.tokenizeAndStem(this, keepStops);
        };
    };
}

},{"../tokenizers/aggressive_tokenizer_ru":97,"../util/stopwords_ru":119}],86:[function(require,module,exports){
/*
Copyright (c) 2015, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

module.exports = (function () {
  'use strict';

  /**
   * Stemmer token constructor.
   *
   * @param {String} string Token string.
   */
  var Token = function (string) {
    this.vowels   = '';
    this.regions  = {};
    this.string   = string;
    this.original = string;
  }

  /**
   * Set vowels.
   *
   * @param  {String|Array} vowels List of vowels.
   * @return {Token}               Token instance.
   */
  Token.prototype.usingVowels = function (vowels) {
    this.vowels = vowels;
    return this;
  };

  /**
   * Marks a region by defining its starting index or providing a callback
   * function that does.
   *
   * @param  {String}       region   Region name.
   * @param  {Array|Number} args     Callback arguments or region start index.
   * @param  {Function}     callback Function that determines the start index (optional).
   * @param  {Object}       context  Callback context (optional, defaults to this).
   * @return {Token}                 Token instance.
   */
  Token.prototype.markRegion = function (region, args, callback, context) {
    if (typeof callback === 'function') {
      this.regions[region] = callback.apply(context || this, [].concat(args));

    } else if (!isNaN(args)) {
      this.regions[region] = args;
    }

    return this;
  };

  /**
   * Replaces all instances of a string with another.
   *
   * @param  {String} find    String to be replaced.
   * @param  {String} replace Replacement string.
   * @return {Token}          Token instance.
   */
  Token.prototype.replaceAll = function (find, replace) {
    this.string = this.string.split(find).join(replace);
    return this;
  };

  /**
   * Replaces the token suffix if in a region.
   *
   * @param  {String} suffix  Suffix to replace.
   * @param  {String} replace Replacement string.
   * @param  {String} region  Region name.
   * @return {Token}          Token instance.
   */
  Token.prototype.replaceSuffixInRegion = function (suffix, replace, region) {
    var suffixes = [].concat(suffix);
    for (var i = 0; i < suffixes.length; i++) {
      if (this.hasSuffixInRegion(suffixes[i], region)) {
        this.string = this.string.slice(0, -suffixes[i].length) + replace;
        return this;
      }
    }
    return this;
  };

  /**
   * Determines whether the token has a vowel at the provided index.
   *
   * @param  {Integer} index Character index.
   * @return {Boolean}       Whether the token has a vowel at the provided index.
   */
  Token.prototype.hasVowelAtIndex = function (index) {
    return this.vowels.indexOf(this.string[index]) !== -1;
  };

  /**
   * Finds the next vowel in the token.
   *
   * @param  {Integer} start Starting index offset.
   * @return {Integer}       Vowel index, or the end of the string.
   */
  Token.prototype.nextVowelIndex = function (start) {
    var index = (start >= 0 && start < this.string.length) ? start : this.string.length;
    while (index < this.string.length && !this.hasVowelAtIndex(index)) {
      index++;
    }
    return index;
  };

  /**
   * Finds the next consonant in the token.
   *
   * @param  {Integer} start Starting index offset.
   * @return {Integer}       Consonant index, or the end of the string.
   */
  Token.prototype.nextConsonantIndex = function (start) {
    var index = (start >= 0 && start < this.string.length) ? start : this.string.length;
    while (index < this.string.length && this.hasVowelAtIndex(index)) {
      index++;
    }
    return index;
  };

  /**
   * Determines whether the token has the provided suffix.
   * @param  {String}  suffix Suffix to match.
   * @return {Boolean}        Whether the token string ends in suffix.
   */
  Token.prototype.hasSuffix = function (suffix) {
    return this.string.slice(-suffix.length) === suffix;
  };

  /**
   * Determines whether the token has the provided suffix within the specified
   * region.
   *
   * @param  {String}  suffix Suffix to match.
   * @param  {String}  region Region name.
   * @return {Boolean}        Whether the token string ends in suffix.
   */
  Token.prototype.hasSuffixInRegion = function (suffix, region) {
    var regionStart = this.regions[region] || 0,
      suffixStart   = this.string.length - suffix.length;
    return this.hasSuffix(suffix) && suffixStart >= regionStart;
  };

  return Token;
})();

},{}],87:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var _ = require("underscore")._,
    Tokenizer = require('../tokenizers/regexp_tokenizer').WordTokenizer,
    tokenizer = new Tokenizer(),
    stopwords = require('../util/stopwords').words,
    fs = require('fs');

function buildDocument(text, key) {
    var stopOut;

    if(typeof text === 'string') {
        text = tokenizer.tokenize(text.toLowerCase());
        stopOut = true;
    } else if(!_.isArray(text)) {
        stopOut = false;
        return text;
    }

    return text.reduce(function(document, term) {
        // next line solves https://github.com/NaturalNode/natural/issues/119
        if(typeof document[term] === 'function') document[term] = 0;
        if(!stopOut || stopwords.indexOf(term) < 0)
            document[term] = (document[term] ? document[term] + 1 : 1);
        return document;
    }, {__key: key});
}

function tf(term, document) {
    return document[term] ? document[term]: 0;
}

function documentHasTerm(term, document) {
    return document[term] && document[term] > 0;
}

function TfIdf(deserialized) {
    if(deserialized)
        this.documents = deserialized.documents;
    else
        this.documents = [];

    this._idfCache = {};
}

// backwards compatibility for < node 0.10
function isEncoding(encoding) {
    if (typeof Buffer.isEncoding !== 'undefined')
        return Buffer.isEncoding(encoding);
    switch ((encoding + '').toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
        case 'raw':
            return true;
    }
    return false;
}

module.exports = TfIdf;
TfIdf.tf = tf;

TfIdf.prototype.idf = function(term, force) {

    // Lookup the term in the New term-IDF caching,
    // this will cut search times down exponentially on large document sets.
    if(this._idfCache[term] && this._idfCache.hasOwnProperty(term) && force !== true)
        return this._idfCache[term];

    var docsWithTerm = this.documents.reduce(function(count, document) {
        return count + (documentHasTerm(term, document) ? 1 : 0);
    }, 0);

    var idf = 1 + Math.log((this.documents.length) / ( 1 + docsWithTerm ));

    // Add the idf to the term cache and return it
    this._idfCache[term] = idf;
    return idf;
};

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addDocument = function(document, key, restoreCache) {
    this.documents.push(buildDocument(document, key));

    // make sure the cache is invalidated when new documents arrive
    if(restoreCache === true) {
        for(var term in this._idfCache) {
            // invoking idf with the force option set will
            // force a recomputation of the idf, and it will
            // automatically refresh the cache value.
            this.idf(term, true);
        }
    }   else {
        this._idfCache = {};
    }
};

// If restoreCache is set to true, all terms idf scores currently cached will be recomputed.
// Otherwise, the cache will just be wiped clean
TfIdf.prototype.addFileSync = function(path, encoding, key, restoreCache) {
    if(!encoding)
        encoding = 'utf8';
    if(!isEncoding(encoding))
        throw new Error('Invalid encoding: ' + encoding);

    var document = fs.readFileSync(path, encoding);
    this.documents.push(buildDocument(document, key));

    // make sure the cache is invalidated when new documents arrive
    if(restoreCache === true) {
        for(var term in this._idfCache) {
            // invoking idf with the force option set will
            // force a recomputation of the idf, and it will
            // automatically refresh the cache value.
            this.idf(term, true);
        }
    }
    else {
        this._idfCache = {};
    }
};

TfIdf.prototype.tfidf = function(terms, d) {
    var _this = this;

    if(!_.isArray(terms))
        terms = tokenizer.tokenize(terms.toString().toLowerCase());

    return terms.reduce(function(value, term) {
        var idf = _this.idf(term);
        idf = idf === Infinity ? 0 : idf;
        return value + (tf(term, _this.documents[d]) * idf);
    }, 0.0);
};

TfIdf.prototype.listTerms = function(d) {
    var terms = [];

    for(var term in this.documents[d]) {
        if(term != '__key')
           terms.push({term: term, tfidf: this.tfidf(term, d)});
    }

    return terms.sort(function(x, y) { return y.tfidf - x.tfidf; });
};

TfIdf.prototype.tfidfs = function(terms, callback) {
    var tfidfs = new Array(this.documents.length);

    for(var i = 0; i < this.documents.length; i++) {
        tfidfs[i] = this.tfidf(terms, i);

        if(callback)
            callback(i, tfidfs[i], this.documents[i].__key);
    }

    return tfidfs;
};

// Define a tokenizer other than the default "WordTokenizer"
TfIdf.prototype.setTokenizer = function(t) {
    if(!_.isFunction(t.tokenize))
        throw new Error('Expected a valid Tokenizer');
    tokenizer = t;
};

}).call(this,require("buffer").Buffer)
},{"../tokenizers/regexp_tokenizer":98,"../util/stopwords":110,"buffer":10,"fs":9,"underscore":137}],88:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/\W+/));
};

},{"./tokenizer":100,"util":140}],89:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/[^a-zA-Zá-úÁ-ÚñÑüÜ]+/));
};

},{"./tokenizer":100,"util":140}],90:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel
Farsi Aggressive Tokenizer by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.clearEmptyString = function(array) {
	return array.filter(function(a) {
		return a != '';
	});
};

AggressiveTokenizer.prototype.clearText = function(text) {
	return text.replace(new RegExp('\.\:\+\-\=\(\)\"\'\!\?\،\,\؛\;', 'g'), ' ');
};

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    text = this.clearText(text);
    return this.clearEmptyString(text.split(/\s+/));
};

},{"./tokenizer":100,"util":140}],91:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/[^a-z0-9äâàéèëêïîöôùüûœç]+/i));
};

},{"./tokenizer":100,"util":140}],92:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/\W+/));
};

},{"./tokenizer":100,"util":140}],93:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel, Martijn de Boer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/[^a-zA-Z0-9_']+/));
};

},{"./tokenizer":100,"util":140}],94:[function(require,module,exports){
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    normalizer = require('../normalizers/normalizer_no'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.tokenize = function(text) {
    text = normalizer.remove_diacritics(text);

    // break a string up into an array of tokens by anything non-word
    return this.trim(text.split(/[^A-Za-z0-9_æøåÆØÅäÄöÖüÜ]+/));
};

},{"../normalizers/normalizer_no":58,"./tokenizer":100,"util":140}],95:[function(require,module,exports){
/*
Copyright (c) 2013, Paweł Łaskarzewski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);
};

util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.withoutEmpty = function(array) {
	return array.filter(function(a) {return a;});
};

AggressiveTokenizer.prototype.clearText = function(text) {
	return text.replace(/[^a-zążśźęćńół0-9]/gi, ' ').replace(/[\s\n]+/g, ' ').trim();
};

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.withoutEmpty(this.clearText(text).split(' '));
};

},{"./tokenizer":100,"util":140}],96:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel,David Przybilla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);
};
util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.withoutEmpty = function(array) {
	return array.filter(function(a) {return a;});
};

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.withoutEmpty(this.trim(text.split(/[^a-zA-Zà-úÀ-Ú]/)));
};

},{"./tokenizer":100,"util":140}],97:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var AggressiveTokenizer = function() {
    Tokenizer.call(this);    
};

util.inherits(AggressiveTokenizer, Tokenizer);

module.exports = AggressiveTokenizer;

AggressiveTokenizer.prototype.withoutEmpty = function(array) {
	return array.filter(function(a) {return a;});
};

AggressiveTokenizer.prototype.clearText = function(text) {
	return text.replace(/[^a-zа-яё0-9]/gi, ' ').replace(/[\s\n]+/g, ' ').trim();
};

AggressiveTokenizer.prototype.tokenize = function(text) {
    // break a string up into an array of tokens by anything non-word
    return this.withoutEmpty(this.clearText(text).split(' '));
};

},{"./tokenizer":100,"util":140}],98:[function(require,module,exports){
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require("util"),
    _ = require('underscore')._;

// Base Class for RegExp Matching
var RegexpTokenizer = function(options) {
    var options = options || {};
    this._pattern = options.pattern || this._pattern;
    this.discardEmpty = options.discardEmpty || true;

    // Match and split on GAPS not the actual WORDS
    this._gaps = options.gaps;
    
    if (this._gaps === undefined) {
        this._gaps = true;
    }
};

util.inherits(RegexpTokenizer, Tokenizer);

RegexpTokenizer.prototype.tokenize = function(s) {
    var results;

    if (this._gaps) {
        results = s.split(this._pattern);
        return (this.discardEmpty) ? _.without(results,'',' ') : results;
    } else {
        return s.match(this._pattern);
    }
};

exports.RegexpTokenizer = RegexpTokenizer;

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordTokenizer().tokenize("She said 'hello'.")
 *      ['She', 'said', 'hello']
 * 
 */
var WordTokenizer = function(options) {
    this._pattern = /[^A-Za-zА-Яа-я0-9_]+/;
    RegexpTokenizer.call(this,options)
};

util.inherits(WordTokenizer, RegexpTokenizer);
exports.WordTokenizer = WordTokenizer;

/***
 * A tokenizer that divides a text into sequences of alphabetic and
 * non-alphabetic characters.  E.g.:
 *
 *      >>> WordPunctTokenizer().tokenize("She said 'hello'.")
 *      ["She","said","'","hello","'","."]
 * 
 */
var WordPunctTokenizer = function(options) {
    this._pattern = new RegExp(/(\w+|[а-я0-9_]+|\.|\!|\'|\"")/i);
    RegexpTokenizer.call(this,options)
};

util.inherits(WordPunctTokenizer, RegexpTokenizer);
exports.WordPunctTokenizer = WordPunctTokenizer;

},{"./tokenizer":100,"underscore":137,"util":140}],99:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require('util');

var SentenceTokenizer = function() {
    Tokenizer.call(this);
};
util.inherits(SentenceTokenizer, Tokenizer);

SentenceTokenizer.prototype.tokenize = function(text) {
    // break string up in to sentences based on punctation and quotation marks
    var tokens = text.match(/([\"\'\‘\“\'\"\[\(\{\⟨][^\.\?\!]+[\.\?\!][\"\'\’\”\'\"\]\)\}\⟩]|[^\.\?\!]+[\.\?\!])\s?/g);

    // remove unecessary white space
    tokens = tokens.map(Function.prototype.call, String.prototype.trim);

    return this.trim(tokens);
};

module.exports = SentenceTokenizer;

},{"./tokenizer":100,"util":140}],100:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * \@todo Use .bind() in Tokenizer.prototype.attach().
 */

var Tokenizer = function() {
};

Tokenizer.prototype.trim = function(array) {
  while (array[array.length - 1] == '')
    array.pop();

  while (array[0] == '')
    array.shift();

  return array;
};

// Expose an attach function that will patch String with new methods.
Tokenizer.prototype.attach = function() {
  var self = this;

  String.prototype.tokenize = function() {
    return self.tokenize(this);
  }
};

Tokenizer.prototype.tokenize = function() {};

module.exports = Tokenizer;

},{}],101:[function(require,module,exports){
/*
 Copyright (c) 2011, Chris Umbel, Alex Langberg

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

var Tokenizer = require('./tokenizer'),
  util = require('util'),
  CaseTokenizer = function() {
    Tokenizer.call(this);
  };

util.inherits(CaseTokenizer, Tokenizer);

CaseTokenizer.prototype.attach = function() {
  var self = this;

  String.prototype.tokenize = function(preserveApostrophe) {
    return self.tokenize(this, preserveApostrophe);
  }
};

// Idea from Seagull: http://stackoverflow.com/a/26482650
CaseTokenizer.prototype.tokenize = function(text, preserveApostrophe) {
  var whitelist = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var lower = text.toLowerCase();
  var upper = text.toUpperCase();
  var result = '';
  var i;

  for (i = 0; i < lower.length; ++i) {
    if (lower[i] !== upper[i] || whitelist.indexOf(lower[i]) > -1 || (text[i] === '\'' && preserveApostrophe)) {
      result += text[i];
    } else {
      result += ' ';
    }
  }

  return this.trim(result.replace(/\s+/g, ' ').split(' '));
};

module.exports = CaseTokenizer;

},{"./tokenizer":100,"util":140}],102:[function(require,module,exports){
// Original copyright:
/*
 Copyright (c) 2008, Taku Kudo

 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of the <ORGANIZATION> nor the names of its
 contributors may be used to endorse or promote products derived from this
 software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// This version:
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// TinySegmenter 0.1 -- Super compact Japanese tokenizer in Javascript
// (c) 2008 Taku Kudo <taku@chasen.org>
// TinySegmenter is freely distributable under the terms of a new BSD licence.
// For details, see http://chasen.org/~taku/software/TinySegmenter/LICENCE.txt

var Tokenizer = require('./tokenizer'),
    normalize = require('../normalizers/normalizer_ja').normalize_ja,
    util = require('util');



/**
 * @constructor
 */
var TokenizerJa = function() {
  this.chartype_ = [
    [/[〇一二三四五六七八九十百千万億兆]/, 'M'],
    [/[一-鿌〆]/, 'H'],
    [/[ぁ-ゟ]/, 'I'],
    [/[゠-ヿ]/, 'K'],
    [/[a-zA-Z]/, 'A'],
    [/[0-9]/, 'N']
  ];

  this.BIAS__ = -332;
  this.BC1__ = {'HH': 6, 'II': 2461, 'KH': 406, 'OH': -1378};
  this.BC2__ = {'AA': -3267, 'AI': 2744, 'AN': -878, 'HH': -4070, 'HM': -1711, 'HN': 4012, 'HO': 3761, 'IA': 1327, 'IH': -1184, 'II': -1332, 'IK': 1721, 'IO': 5492, 'KI': 3831, 'KK': -8741, 'MH': -3132, 'MK': 3334, 'OO': -2920};
  this.BC3__ = {'HH': 996, 'HI': 626, 'HK': -721, 'HN': -1307, 'HO': -836, 'IH': -301, 'KK': 2762, 'MK': 1079, 'MM': 4034, 'OA': -1652, 'OH': 266};
  this.BP1__ = {'BB': 295, 'OB': 304, 'OO': -125, 'UB': 352};
  this.BP2__ = {'BO': 60, 'OO': -1762};
  this.BQ1__ = {'BHH': 1150, 'BHM': 1521, 'BII': -1158, 'BIM': 886, 'BMH': 1208, 'BNH': 449, 'BOH': -91, 'BOO': -2597, 'OHI': 451, 'OIH': -296, 'OKA': 1851, 'OKH': -1020, 'OKK': 904, 'OOO': 2965};
  this.BQ2__ = {'BHH': 118, 'BHI': -1159, 'BHM': 466, 'BIH': -919, 'BKK': -1720, 'BKO': 864, 'OHH': -1139, 'OHM': -181, 'OIH': 153, 'UHI': -1146};
  this.BQ3__ = {'BHH': -792, 'BHI': 2664, 'BII': -299, 'BKI': 419, 'BMH': 937, 'BMM': 8335, 'BNN': 998, 'BOH': 775, 'OHH': 2174, 'OHM': 439, 'OII': 280, 'OKH': 1798, 'OKI': -793, 'OKO': -2242, 'OMH': -2402, 'OOO': 11699};
  this.BQ4__ = {'BHH': -3895, 'BIH': 3761, 'BII': -4654, 'BIK': 1348, 'BKK': -1806, 'BMI': -3385, 'BOO': -12396, 'OAH': 926, 'OHH': 266, 'OHK': -2036, 'ONN': -973};
  this.BW1__ = {'，と': 660, '，同': 727, 'B1あ': 1404, 'B1同': 542, '、と': 660, '、同': 727, '｣と': 1682, 'あっ': 1505, 'いう': 1743, 'いっ': -2055, 'いる': 672, 'うし': -4817, 'うん': 665, 'から': 3472, 'がら': 600, 'こう': -790, 'こと': 2083, 'こん': -1262, 'さら': -4143, 'さん': 4573, 'した': 2641, 'して': 1104, 'すで': -3399, 'そこ': 1977, 'それ': -871, 'たち': 1122, 'ため': 601, 'った': 3463, 'つい': -802, 'てい': 805, 'てき': 1249, 'でき': 1127, 'です': 3445, 'では': 844, 'とい': -4915, 'とみ': 1922, 'どこ': 3887, 'ない': 5713, 'なっ': 3015, 'など': 7379, 'なん': -1113, 'にし': 2468, 'には': 1498, 'にも': 1671, 'に対': -912, 'の一': -501, 'の中': 741, 'ませ': 2448, 'まで': 1711, 'まま': 2600, 'まる': -2155, 'やむ': -1947, 'よっ': -2565, 'れた': 2369, 'れで': -913, 'をし': 1860, 'を見': 731, '亡く': -1886, '京都': 2558, '取り': -2784, '大き': -2604, '大阪': 1497, '平方': -2314, '引き': -1336, '日本': -195, '本当': -2423, '毎日': -2113, '目指': -724};
  this.BW2__ = {'11': -669, '．．': -11822, '――': -5730, '−−': -13175, 'いう': -1609, 'うか': 2490, 'かし': -1350, 'かも': -602, 'から': -7194, 'かれ': 4612, 'がい': 853, 'がら': -3198, 'きた': 1941, 'くな': -1597, 'こと': -8392, 'この': -4193, 'させ': 4533, 'され': 13168, 'さん': -3977, 'しい': -1819, 'しか': -545, 'した': 5078, 'して': 972, 'しな': 939, 'その': -3744, 'たい': -1253, 'たた': -662, 'ただ': -3857, 'たち': -786, 'たと': 1224, 'たは': -939, 'った': 4589, 'って': 1647, 'っと': -2094, 'てい': 6144, 'てき': 3640, 'てく': 2551, 'ては': -3110, 'ても': -3065, 'でい': 2666, 'でき': -1528, 'でし': -3828, 'です': -4761, 'でも': -4203, 'とい': 1890, 'とこ': -1746, 'とと': -2279, 'との': 720, 'とみ': 5168, 'とも': -3941, 'ない': -2488, 'なが': -1313, 'など': -6509, 'なの': 2614, 'なん': 3099, 'にお': -1615, 'にし': 2748, 'にな': 2454, 'によ': -7236, 'に対': -14943, 'に従': -4688, 'に関': -11388, 'のか': 2093, 'ので': -7059, 'のに': -6041, 'のの': -6125, 'はい': 1073, 'はが': -1033, 'はず': -2532, 'ばれ': 1813, 'まし': -1316, 'まで': -6621, 'まれ': 5409, 'めて': -3153, 'もい': 2230, 'もの': -10713, 'らか': -944, 'らし': -1611, 'らに': -1897, 'りし': 651, 'りま': 1620, 'れた': 4270, 'れて': 849, 'れば': 4114, 'ろう': 6067, 'われ': 7901, 'を通': -11877, 'んだ': 728, 'んな': -4115, '一人': 602, '一方': -1375, '一日': 970, '一部': -1051, '上が': -4479, '会社': -1116, '出て': 2163, '分の': -7758, '同党': 970, '同日': -913, '大阪': -2471, '委員': -1250, '少な': -1050, '年度': -8669, '年間': -1626, '府県': -2363, '手権': -1982, '新聞': -4066, '日新': -722, '日本': -7068, '日米': 3372, '曜日': -601, '朝鮮': -2355, '本人': -2697, '東京': -1543, '然と': -1384, '社会': -1276, '立て': -990, '第に': -1612, '米国': -4268};
  this.BW3__ = {'あた': -2194, 'あり': 719, 'ある': 3846, 'い．': -1185, 'い。': -1185, 'いい': 5308, 'いえ': 2079, 'いく': 3029, 'いた': 2056, 'いっ': 1883, 'いる': 5600, 'いわ': 1527, 'うち': 1117, 'うと': 4798, 'えと': 1454, 'か．': 2857, 'か。': 2857, 'かけ': -743, 'かっ': -4098, 'かに': -669, 'から': 6520, 'かり': -2670, 'が，': 1816, 'が、': 1816, 'がき': -4855, 'がけ': -1127, 'がっ': -913, 'がら': -4977, 'がり': -2064, 'きた': 1645, 'けど': 1374, 'こと': 7397, 'この': 1542, 'ころ': -2757, 'さい': -714, 'さを': 976, 'し，': 1557, 'し、': 1557, 'しい': -3714, 'した': 3562, 'して': 1449, 'しな': 2608, 'しま': 1200, 'す．': -1310, 'す。': -1310, 'する': 6521, 'ず，': 3426, 'ず、': 3426, 'ずに': 841, 'そう': 428, 'た．': 8875, 'た。': 8875, 'たい': -594, 'たの': 812, 'たり': -1183, 'たる': -853, 'だ．': 4098, 'だ。': 4098, 'だっ': 1004, 'った': -4748, 'って': 300, 'てい': 6240, 'てお': 855, 'ても': 302, 'です': 1437, 'でに': -1482, 'では': 2295, 'とう': -1387, 'とし': 2266, 'との': 541, 'とも': -3543, 'どう': 4664, 'ない': 1796, 'なく': -903, 'など': 2135, 'に，': -1021, 'に、': -1021, 'にし': 1771, 'にな': 1906, 'には': 2644, 'の，': -724, 'の、': -724, 'の子': -1000, 'は，': 1337, 'は、': 1337, 'べき': 2181, 'まし': 1113, 'ます': 6943, 'まっ': -1549, 'まで': 6154, 'まれ': -793, 'らし': 1479, 'られ': 6820, 'るる': 3818, 'れ，': 854, 'れ、': 854, 'れた': 1850, 'れて': 1375, 'れば': -3246, 'れる': 1091, 'われ': -605, 'んだ': 606, 'んで': 798, 'カ月': 990, '会議': 860, '入り': 1232, '大会': 2217, '始め': 1681, '市': 965, '新聞': -5055, '日，': 974, '日、': 974, '社会': 2024};
  this.TC1__ = {'AAA': 1093, 'HHH': 1029, 'HHM': 580, 'HII': 998, 'HOH': -390, 'HOM': -331, 'IHI': 1169, 'IOH': -142, 'IOI': -1015, 'IOM': 467, 'MMH': 187, 'OOI': -1832};
  this.TC2__ = {'HHO': 2088, 'HII': -1023, 'HMM': -1154, 'IHI': -1965, 'KKH': 703, 'OII': -2649};
  this.TC3__ = {'AAA': -294, 'HHH': 346, 'HHI': -341, 'HII': -1088, 'HIK': 731, 'HOH': -1486, 'IHH': 128, 'IHI': -3041, 'IHO': -1935, 'IIH': -825, 'IIM': -1035, 'IOI': -542, 'KHH': -1216, 'KKA': 491, 'KKH': -1217, 'KOK': -1009, 'MHH': -2694, 'MHM': -457, 'MHO': 123, 'MMH': -471, 'NNH': -1689, 'NNO': 662, 'OHO': -3393};
  this.TC4__ = {'HHH': -203, 'HHI': 1344, 'HHK': 365, 'HHM': -122, 'HHN': 182, 'HHO': 669, 'HIH': 804, 'HII': 679, 'HOH': 446, 'IHH': 695, 'IHO': -2324, 'IIH': 321, 'III': 1497, 'IIO': 656, 'IOO': 54, 'KAK': 4845, 'KKA': 3386, 'KKK': 3065, 'MHH': -405, 'MHI': 201, 'MMH': -241, 'MMM': 661, 'MOM': 841};
  this.TQ1__ = {'BHHH': -227, 'BHHI': 316, 'BHIH': -132, 'BIHH': 60, 'BIII': 1595, 'BNHH': -744, 'BOHH': 225, 'BOOO': -908, 'OAKK': 482, 'OHHH': 281, 'OHIH': 249, 'OIHI': 200, 'OIIH': -68};
  this.TQ2__ = {'BIHH': -1401, 'BIII': -1033, 'BKAK': -543, 'BOOO': -5591};
  this.TQ3__ = {'BHHH': 478, 'BHHM': -1073, 'BHIH': 222, 'BHII': -504, 'BIIH': -116, 'BIII': -105, 'BMHI': -863, 'BMHM': -464, 'BOMH': 620, 'OHHH': 346, 'OHHI': 1729, 'OHII': 997, 'OHMH': 481, 'OIHH': 623, 'OIIH': 1344, 'OKAK': 2792, 'OKHH': 587, 'OKKA': 679, 'OOHH': 110, 'OOII': -685};
  this.TQ4__ = {'BHHH': -721, 'BHHM': -3604, 'BHII': -966, 'BIIH': -607, 'BIII': -2181, 'OAAA': -2763, 'OAKK': 180, 'OHHH': -294, 'OHHI': 2446, 'OHHO': 480, 'OHIH': -1573, 'OIHH': 1935, 'OIHI': -493, 'OIIH': 626, 'OIII': -4007, 'OKAK': -8156};
  this.TW1__ = {'につい': -4681, '東京都': 2026};
  this.TW2__ = {'ある程': -2049, 'いった': -1256, 'ころが': -2434, 'しょう': 3873, 'その後': -4430, 'だって': -1049, 'ていた': 1833, 'として': -4657, 'ともに': -4517, 'もので': 1882, '一気に': -792, '初めて': -1512, '同時に': -8097, '大きな': -1255, '対して': -2721, '社会党': -3216};
  this.TW3__ = {'いただ': -1734, 'してい': 1314, 'として': -4314, 'につい': -5483, 'にとっ': -5989, 'に当た': -6247, 'ので，': -727, 'ので、': -727, 'のもの': -600, 'れから': -3752, '十二月': -2287};
  this.TW4__ = {'いう．': 8576, 'いう。': 8576, 'からな': -2348, 'してい': 2958, 'たが，': 1516, 'たが、': 1516, 'ている': 1538, 'という': 1349, 'ました': 5543, 'ません': 1097, 'ようと': -4258, 'よると': 5865};
  this.UC1__ = {'A': 484, 'K': 93, 'M': 645, 'O': -505};
  this.UC2__ = {'A': 819, 'H': 1059, 'I': 409, 'M': 3987, 'N': 5775, 'O': 646};
  this.UC3__ = {'A': -1370, 'I': 2311};
  this.UC4__ = {'A': -2643, 'H': 1809, 'I': -1032, 'K': -3450, 'M': 3565, 'N': 3876, 'O': 6646};
  this.UC5__ = {'H': 313, 'I': -1238, 'K': -799, 'M': 539, 'O': -831};
  this.UC6__ = {'H': -506, 'I': -253, 'K': 87, 'M': 247, 'O': -387};
  this.UP1__ = {'O': -214};
  this.UP2__ = {'B': 69, 'O': 935};
  this.UP3__ = {'B': 189};
  this.UQ1__ = {'BH': 21, 'BI': -12, 'BK': -99, 'BN': 142, 'BO': -56, 'OH': -95, 'OI': 477, 'OK': 410, 'OO': -2422};
  this.UQ2__ = {'BH': 216, 'BI': 113, 'OK': 1759};
  this.UQ3__ = {'BA': -479, 'BH': 42, 'BI': 1913, 'BK': -7198, 'BM': 3160, 'BN': 6427, 'BO': 14761, 'OI': -827, 'ON': -3212};
  this.UW1__ = {'，': 156, '、': 156, '｢': -463, 'あ': -941, 'う': -127, 'が': -553, 'き': 121, 'こ': 505, 'で': -201, 'と': -547, 'ど': -123, 'に': -789, 'の': -185, 'は': -847, 'も': -466, 'や': -470, 'よ': 182, 'ら': -292, 'り': 208, 'れ': 169, 'を': -446, 'ん': -137, '・': -135, '主': -402, '京': -268, '区': -912, '午': 871, '国': -460, '大': 561, '委': 729, '市': -411, '日': -141, '理': 361, '生': -408, '県': -386, '都': -718};
  this.UW2__ = {'，': -829, '、': -829, '〇': 892, '｢': -645, '｣': 3145, 'あ': -538, 'い': 505, 'う': 134, 'お': -502, 'か': 1454, 'が': -856, 'く': -412, 'こ': 1141, 'さ': 878, 'ざ': 540, 'し': 1529, 'す': -675, 'せ': 300, 'そ': -1011, 'た': 188, 'だ': 1837, 'つ': -949, 'て': -291, 'で': -268, 'と': -981, 'ど': 1273, 'な': 1063, 'に': -1764, 'の': 130, 'は': -409, 'ひ': -1273, 'べ': 1261, 'ま': 600, 'も': -1263, 'や': -402, 'よ': 1639, 'り': -579, 'る': -694, 'れ': 571, 'を': -2516, 'ん': 2095, 'ア': -587, 'カ': 306, 'キ': 568, 'ッ': 831, '三': -758, '不': -2150, '世': -302, '中': -968, '主': -861, '事': 492, '人': -123, '会': 978, '保': 362, '入': 548, '初': -3025, '副': -1566, '北': -3414, '区': -422, '大': -1769, '天': -865, '太': -483, '子': -1519, '学': 760, '実': 1023, '小': -2009, '市': -813, '年': -1060, '強': 1067, '手': -1519, '揺': -1033, '政': 1522, '文': -1355, '新': -1682, '日': -1815, '明': -1462, '最': -630, '朝': -1843, '本': -1650, '東': -931, '果': -665, '次': -2378, '民': -180, '気': -1740, '理': 752, '発': 529, '目': -1584, '相': -242, '県': -1165, '立': -763, '第': 810, '米': 509, '自': -1353, '行': 838, '西': -744, '見': -3874, '調': 1010, '議': 1198, '込': 3041, '開': 1758, '間': -1257};
  this.UW3__ = {'1': -800, '，': 4889, '−': -1723, '、': 4889, '々': -2311, '〇': 5827, '｣': 2670, '〓': -3573, 'あ': -2696, 'い': 1006, 'う': 2342, 'え': 1983, 'お': -4864, 'か': -1163, 'が': 3271, 'く': 1004, 'け': 388, 'げ': 401, 'こ': -3552, 'ご': -3116, 'さ': -1058, 'し': -395, 'す': 584, 'せ': 3685, 'そ': -5228, 'た': 842, 'ち': -521, 'っ': -1444, 'つ': -1081, 'て': 6167, 'で': 2318, 'と': 1691, 'ど': -899, 'な': -2788, 'に': 2745, 'の': 4056, 'は': 4555, 'ひ': -2171, 'ふ': -1798, 'へ': 1199, 'ほ': -5516, 'ま': -4384, 'み': -120, 'め': 1205, 'も': 2323, 'や': -788, 'よ': -202, 'ら': 727, 'り': 649, 'る': 5905, 'れ': 2773, 'わ': -1207, 'を': 6620, 'ん': -518, 'ア': 551, 'グ': 1319, 'ス': 874, 'ッ': -1350, 'ト': 521, 'ム': 1109, 'ル': 1591, 'ロ': 2201, 'ン': 278, '・': -3794, '一': -1619, '下': -1759, '世': -2087, '両': 3815, '中': 653, '主': -758, '予': -1193, '二': 974, '人': 2742, '今': 792, '他': 1889, '以': -1368, '低': 811, '何': 4265, '作': -361, '保': -2439, '元': 4858, '党': 3593, '全': 1574, '公': -3030, '六': 755, '共': -1880, '円': 5807, '再': 3095, '分': 457, '初': 2475, '別': 1129, '前': 2286, '副': 4437, '力': 365, '動': -949, '務': -1872, '化': 1327, '北': -1038, '区': 4646, '千': -2309, '午': -783, '協': -1006, '口': 483, '右': 1233, '各': 3588, '合': -241, '同': 3906, '和': -837, '員': 4513, '国': 642, '型': 1389, '場': 1219, '外': -241, '妻': 2016, '学': -1356, '安': -423, '実': -1008, '家': 1078, '小': -513, '少': -3102, '州': 1155, '市': 3197, '平': -1804, '年': 2416, '広': -1030, '府': 1605, '度': 1452, '建': -2352, '当': -3885, '得': 1905, '思': -1291, '性': 1822, '戸': -488, '指': -3973, '政': -2013, '教': -1479, '数': 3222, '文': -1489, '新': 1764, '日': 2099, '旧': 5792, '昨': -661, '時': -1248, '曜': -951, '最': -937, '月': 4125, '期': 360, '李': 3094, '村': 364, '東': -805, '核': 5156, '森': 2438, '業': 484, '氏': 2613, '民': -1694, '決': -1073, '法': 1868, '海': -495, '無': 979, '物': 461, '特': -3850, '生': -273, '用': 914, '町': 1215, '的': 7313, '直': -1835, '省': 792, '県': 6293, '知': -1528, '私': 4231, '税': 401, '立': -960, '第': 1201, '米': 7767, '系': 3066, '約': 3663, '級': 1384, '統': -4229, '総': 1163, '線': 1255, '者': 6457, '能': 725, '自': -2869, '英': 785, '見': 1044, '調': -562, '財': -733, '費': 1777, '車': 1835, '軍': 1375, '込': -1504, '通': -1136, '選': -681, '郎': 1026, '郡': 4404, '部': 1200, '金': 2163, '長': 421, '開': -1432, '間': 1302, '関': -1282, '雨': 2009, '電': -1045, '非': 2066, '駅': 1620};
  this.UW4__ = {'，': 3930, '．': 3508, '―': -4841, '、': 3930, '。': 3508, '〇': 4999, '｢': 1895, '｣': 3798, '〓': -5156, 'あ': 4752, 'い': -3435, 'う': -640, 'え': -2514, 'お': 2405, 'か': 530, 'が': 6006, 'き': -4482, 'ぎ': -3821, 'く': -3788, 'け': -4376, 'げ': -4734, 'こ': 2255, 'ご': 1979, 'さ': 2864, 'し': -843, 'じ': -2506, 'す': -731, 'ず': 1251, 'せ': 181, 'そ': 4091, 'た': 5034, 'だ': 5408, 'ち': -3654, 'っ': -5882, 'つ': -1659, 'て': 3994, 'で': 7410, 'と': 4547, 'な': 5433, 'に': 6499, 'ぬ': 1853, 'ね': 1413, 'の': 7396, 'は': 8578, 'ば': 1940, 'ひ': 4249, 'び': -4134, 'ふ': 1345, 'へ': 6665, 'べ': -744, 'ほ': 1464, 'ま': 1051, 'み': -2082, 'む': -882, 'め': -5046, 'も': 4169, 'ゃ': -2666, 'や': 2795, 'ょ': -1544, 'よ': 3351, 'ら': -2922, 'り': -9726, 'る': -14896, 'れ': -2613, 'ろ': -4570, 'わ': -1783, 'を': 13150, 'ん': -2352, 'カ': 2145, 'コ': 1789, 'セ': 1287, 'ッ': -724, 'ト': -403, 'メ': -1635, 'ラ': -881, 'リ': -541, 'ル': -856, 'ン': -3637, '・': -4371, 'ー': -11870, '一': -2069, '中': 2210, '予': 782, '事': -190, '井': -1768, '人': 1036, '以': 544, '会': 950, '体': -1286, '作': 530, '側': 4292, '先': 601, '党': -2006, '共': -1212, '内': 584, '円': 788, '初': 1347, '前': 1623, '副': 3879, '力': -302, '動': -740, '務': -2715, '化': 776, '区': 4517, '協': 1013, '参': 1555, '合': -1834, '和': -681, '員': -910, '器': -851, '回': 1500, '国': -619, '園': -1200, '地': 866, '場': -1410, '塁': -2094, '士': -1413, '多': 1067, '大': 571, '子': -4802, '学': -1397, '定': -1057, '寺': -809, '小': 1910, '屋': -1328, '山': -1500, '島': -2056, '川': -2667, '市': 2771, '年': 374, '庁': -4556, '後': 456, '性': 553, '感': 916, '所': -1566, '支': 856, '改': 787, '政': 2182, '教': 704, '文': 522, '方': -856, '日': 1798, '時': 1829, '最': 845, '月': -9066, '木': -485, '来': -442, '校': -360, '業': -1043, '氏': 5388, '民': -2716, '気': -910, '沢': -939, '済': -543, '物': -735, '率': 672, '球': -1267, '生': -1286, '産': -1101, '田': -2900, '町': 1826, '的': 2586, '目': 922, '省': -3485, '県': 2997, '空': -867, '立': -2112, '第': 788, '米': 2937, '系': 786, '約': 2171, '経': 1146, '統': -1169, '総': 940, '線': -994, '署': 749, '者': 2145, '能': -730, '般': -852, '行': -792, '規': 792, '警': -1184, '議': -244, '谷': -1000, '賞': 730, '車': -1481, '軍': 1158, '輪': -1433, '込': -3370, '近': 929, '道': -1291, '選': 2596, '郎': -4866, '都': 1192, '野': -1100, '銀': -2213, '長': 357, '間': -2344, '院': -2297, '際': -2604, '電': -878, '領': -1659, '題': -792, '館': -1984, '首': 1749, '高': 2120};
  this.UW5__ = {'1': -514, '，': 465, '．': -299, 'E2': -32768, '］': -2762, '、': 465, '。': -299, '｢': 363, 'あ': 1655, 'い': 331, 'う': -503, 'え': 1199, 'お': 527, 'か': 647, 'が': -421, 'き': 1624, 'ぎ': 1971, 'く': 312, 'げ': -983, 'さ': -1537, 'し': -1371, 'す': -852, 'だ': -1186, 'ち': 1093, 'っ': 52, 'つ': 921, 'て': -18, 'で': -850, 'と': -127, 'ど': 1682, 'な': -787, 'に': -1224, 'の': -635, 'は': -578, 'べ': 1001, 'み': 502, 'め': 865, 'ゃ': 3350, 'ょ': 854, 'り': -208, 'る': 429, 'れ': 504, 'わ': 419, 'を': -1264, 'ん': 327, 'イ': 241, 'ル': 451, 'ン': -343, '中': -871, '京': 722, '会': -1153, '党': -654, '務': 3519, '区': -901, '告': 848, '員': 2104, '大': -1296, '学': -548, '定': 1785, '嵐': -1304, '市': -2991, '席': 921, '年': 1763, '思': 872, '所': -814, '挙': 1618, '新': -1682, '日': 218, '月': -4353, '査': 932, '格': 1356, '機': -1508, '氏': -1347, '田': 240, '町': -3912, '的': -3149, '相': 1319, '省': -1052, '県': -4003, '研': -997, '社': -278, '空': -813, '統': 1955, '者': -2233, '表': 663, '語': -1073, '議': 1219, '選': -1018, '郎': -368, '長': 786, '間': 1191, '題': 2368, '館': -689};
  this.UW6__ = {'1': -270, '，': 227, '．': 808, 'E1': 306, '、': 227, '。': 808, 'あ': -307, 'う': 189, 'か': 241, 'が': -73, 'く': -121, 'こ': -200, 'じ': 1782, 'す': 383, 'た': -428, 'っ': 573, 'て': -1014, 'で': 101, 'と': -105, 'な': -253, 'に': -149, 'の': -417, 'は': -236, 'も': -206, 'り': 187, 'る': -135, 'を': 195, 'ル': -673, 'ン': -496, '一': -277, '中': 201, '件': -800, '会': 624, '前': 302, '区': 1792, '員': -1212, '委': 798, '学': -960, '市': 887, '広': -695, '後': 535, '業': -697, '相': 753, '社': -507, '福': 974, '空': -822, '者': 1811, '連': 463, '郎': 1082};

  return this;
};

util.inherits(TokenizerJa, Tokenizer);


/**
 * @param {string} str
 * @return {string}
 * @private
 */
TokenizerJa.prototype.ctype_ = function(str) {
  for (var i = 0, length = this.chartype_.length; i < length; i++) {
    if (str.match(this.chartype_[i][0])) {
      return this.chartype_[i][1];
    }
  }
  return 'O';
};


/**
 * @param {string} v
 * @return {number}
 * @private
 */
TokenizerJa.prototype.ts_ = function(v) {
  if (v) { return v; }
  return 0;
};


/**
 * Remove punctuations signs from tokens.
 *
 * @param {Array.<string>} tokens An array of tokens.
 * @return {Array.<string>} An array of tokens.
 * @private
 */
TokenizerJa.prototype.removePuncTokens = function(tokens) {
  return tokens
      .map(function(token) {
        return token.replace(/[＿－・，、；：！？．。（）［］｛｝｢｣＠＊＼／＆＃％｀＾＋＜＝＞｜～≪≫─＄＂_\-･,､;:!?.｡()[\]{}「」@*\/&#%`^+<=>|~«»$"\s]+/g, '');
      })
      .filter(function(token) {
        return token != '';
      });
};


/**
 * @param {string} text
 * @return {Array.<string>}
 */
TokenizerJa.prototype.tokenize = function(text) {
  if (text == null || text == undefined || text == '') {
    return [];
  }
  text = normalize(text);
  var result = [];
  var seg = ['B3', 'B2', 'B1'];
  var ctype = ['O', 'O', 'O'];
  var o = text.split('');
  var i;
  var length;
  for (i = 0, length = o.length; i < length; ++i) {
    seg.push(o[i]);
    ctype.push(this.ctype_(o[i]));
  }
  seg.push('E1');
  seg.push('E2');
  seg.push('E3');
  ctype.push('O');
  ctype.push('O');
  ctype.push('O');
  var word = seg[3];
  var p1 = 'U';
  var p2 = 'U';
  var p3 = 'U';
  for (i = 4, length = seg.length - 3; i < length; ++i) {
    var score = this.BIAS__;
    var w1 = seg[i - 3];
    var w2 = seg[i - 2];
    var w3 = seg[i - 1];
    var w4 = seg[i];
    var w5 = seg[i + 1];
    var w6 = seg[i + 2];
    var c1 = ctype[i - 3];
    var c2 = ctype[i - 2];
    var c3 = ctype[i - 1];
    var c4 = ctype[i];
    var c5 = ctype[i + 1];
    var c6 = ctype[i + 2];
    score += this.ts_(this.UP1__[p1]);
    score += this.ts_(this.UP2__[p2]);
    score += this.ts_(this.UP3__[p3]);
    score += this.ts_(this.BP1__[p1 + p2]);
    score += this.ts_(this.BP2__[p2 + p3]);
    score += this.ts_(this.UW1__[w1]);
    score += this.ts_(this.UW2__[w2]);
    score += this.ts_(this.UW3__[w3]);
    score += this.ts_(this.UW4__[w4]);
    score += this.ts_(this.UW5__[w5]);
    score += this.ts_(this.UW6__[w6]);
    score += this.ts_(this.BW1__[w2 + w3]);
    score += this.ts_(this.BW2__[w3 + w4]);
    score += this.ts_(this.BW3__[w4 + w5]);
    score += this.ts_(this.TW1__[w1 + w2 + w3]);
    score += this.ts_(this.TW2__[w2 + w3 + w4]);
    score += this.ts_(this.TW3__[w3 + w4 + w5]);
    score += this.ts_(this.TW4__[w4 + w5 + w6]);
    score += this.ts_(this.UC1__[c1]);
    score += this.ts_(this.UC2__[c2]);
    score += this.ts_(this.UC3__[c3]);
    score += this.ts_(this.UC4__[c4]);
    score += this.ts_(this.UC5__[c5]);
    score += this.ts_(this.UC6__[c6]);
    score += this.ts_(this.BC1__[c2 + c3]);
    score += this.ts_(this.BC2__[c3 + c4]);
    score += this.ts_(this.BC3__[c4 + c5]);
    score += this.ts_(this.TC1__[c1 + c2 + c3]);
    score += this.ts_(this.TC2__[c2 + c3 + c4]);
    score += this.ts_(this.TC3__[c3 + c4 + c5]);
    score += this.ts_(this.TC4__[c4 + c5 + c6]);
    //score += this.ts_(this.TC5__[c4 + c5 + c6]);
    score += this.ts_(this.UQ1__[p1 + c1]);
    score += this.ts_(this.UQ2__[p2 + c2]);
    score += this.ts_(this.UQ3__[p3 + c3]);
    score += this.ts_(this.BQ1__[p2 + c2 + c3]);
    score += this.ts_(this.BQ2__[p2 + c3 + c4]);
    score += this.ts_(this.BQ3__[p3 + c2 + c3]);
    score += this.ts_(this.BQ4__[p3 + c3 + c4]);
    score += this.ts_(this.TQ1__[p2 + c1 + c2 + c3]);
    score += this.ts_(this.TQ2__[p2 + c2 + c3 + c4]);
    score += this.ts_(this.TQ3__[p3 + c1 + c2 + c3]);
    score += this.ts_(this.TQ4__[p3 + c2 + c3 + c4]);
    var p = 'O';
    if (score > 0) {
      result.push(word);
      word = '';
      p = 'B';
    }
    p1 = p2;
    p2 = p3;
    p3 = p;
    word += seg[i];
  }
  result.push(word);

  result = this.removePuncTokens(result);

  return result;
};

module.exports = TokenizerJa;

},{"../normalizers/normalizer_ja":57,"./tokenizer":100,"util":140}],103:[function(require,module,exports){
/*
Copyright (c) 2011, Rob Ellis, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Tokenizer = require('./tokenizer'),
    util = require("util"),
    _ = require('underscore')._;

var contractions2 = [
    /(.)('ll|'re|'ve|n't|'s|'m|'d)\b/ig,
    /\b(can)(not)\b/ig,
    /\b(D)('ye)\b/ig,
    /\b(Gim)(me)\b/ig,
    /\b(Gon)(na)\b/ig,
    /\b(Got)(ta)\b/ig,
    /\b(Lem)(me)\b/ig,
    /\b(Mor)('n)\b/ig,
    /\b(T)(is)\b/ig,
    /\b(T)(was)\b/ig,
    /\b(Wan)(na)\b/ig];

var contractions3 = [
    /\b(Whad)(dd)(ya)\b/ig,
    /\b(Wha)(t)(cha)\b/ig
];

var TreebankWordTokenizer = function() {
};

util.inherits(TreebankWordTokenizer, Tokenizer);

TreebankWordTokenizer.prototype.tokenize = function(text) {
    contractions2.forEach(function(regexp) {
	text = text.replace(regexp,"$1 $2");
    });
    
    contractions3.forEach(function(regexp) {
	text = text.replace(regexp,"$1 $2 $3");
    });

    // most punctuation
    text = text.replace(/([^\w\.\'\-\/\+\<\>,&])/g, " $1 ");

    // commas if followed by space
    text = text.replace(/(,\s)/g, " $1");

    // single quotes if followed by a space
    text = text.replace(/('\s)/g, " $1");

    // periods before newline or end of string
    text = text.replace(/\. *(\n|$)/g, " . ");
    
    return  _.without(text.split(/\s+/), '');	
};

module.exports = TreebankWordTokenizer;

},{"./tokenizer":100,"underscore":137,"util":140}],104:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

/**
 * A transliteration of Katakana & Hiragana to roman characters using the
 * modified Hepburn system.
 * Rules based on CLDR transform rule set `Katakana-Latin-BGN.xml` but with
 * several bugs fixed:
 *  * Missing ū
 *  * Missing tsu + voiced kana
 *  * typos on my~ transliterations
 *  * support for long vowel sign
 *  * support for final small tsu
 *  * support for u + small vowels
 *  * support for su/shi/ji + small vowels
 *  * support for tchi/tsu/te/to + small vowels
 *  * support for fu + small vowels
 *  * support for katakana middle dot
 *
 * \@todo Take iteration marks into account.
 */

var replacer = require('../../util/utils').replacer;

var transliterationTable1 = {
  'ウァ': 'wa', // KATAKANA LETTER U + SMALL A
  'ウィ': 'wi', // KATAKANA LETTER U + SMALL I
  'ウェ': 'we', // KATAKANA LETTER U + SMALL E
  'ウォ': 'wo', // KATAKANA LETTER U + SMALL O
  'ウー': 'ū', // KATAKANA LETTER VU + PROLONGED SOUND MARK

  'ヴァ': 'va', // KATAKANA LETTER VU + SMALL A
  'ヴィ': 'vi', // KATAKANA LETTER VU + SMALL I
  'ヴェ': 've', // KATAKANA LETTER VU + SMALL E
  'ヴォ': 'vo', // KATAKANA LETTER VU + SMALL O
  'ヴュ': 'vyu', // KATAKANA LETTER VU + SMALL YU

  'うぁ': 'wa', // HIRAGANA LETTER U + SMALL A
  'うぃ': 'wi', // HIRAGANA LETTER U + SMALL I
  'うぇ': 'we', // HIRAGANA LETTER U + SMALL E
  'うぉ': 'wo', // HIRAGANA LETTER U + SMALL O
  'うー': 'ū', // HIRAGANA LETTER VU + PROLONGED SOUND MARK

  'ゔぁ': 'va', // HIRAGANA LETTER VU + SMALL A
  'ゔぃ': 'vi', // HIRAGANA LETTER VU + SMALL I
  'ゔぇ': 've', // HIRAGANA LETTER VU + SMALL E
  'ゔぉ': 'vo', // HIRAGANA LETTER VU + SMALL O
  'ゔゅ': 'vyu' // HIRAGANA LETTER VU + SMALL YU
};

var transliterationTable2 = {
  'イェ': 'ye', // KATAKANA LETTER I + SMALL E

  'ア': 'a', // KATAKANA LETTER A
  'イ': 'i', // KATAKANA LETTER I
  'ウウ': 'ū', // KATAKANA LETTER U + U
  'ウ': 'u', // KATAKANA LETTER U
  'エ': 'e', // KATAKANA LETTER E
  'オウ': 'ō', // KATAKANA LETTER O + U
  'オ': 'o', // KATAKANA LETTER O

  'クァ': 'kwa', // KATAKANA LETTER KU + SMALL A
  'クィ': 'kwi', // KATAKANA LETTER KU + SMALL I
  'クェ': 'kwe', // KATAKANA LETTER KU + SMALL E
  'クォ': 'kwo', // KATAKANA LETTER KU + SMALL O

  'カ': 'ka', // KATAKANA LETTER KA
  'キョウ': 'kyō', // KATAKANA LETTER KI + SMALL YO + U
  'キュウ': 'kyū', // KATAKANA LETTER KI + SMALL YU + U
  'キャ': 'kya', // KATAKANA LETTER KI + SMALL YA
  'キョ': 'kyo', // KATAKANA LETTER KI + SMALL YO
  'キュ': 'kyu', // KATAKANA LETTER KI + SMALL YU
  'キ': 'ki', // KATAKANA LETTER KI
  'ク': 'ku', // KATAKANA LETTER KU
  'ケ': 'ke', // KATAKANA LETTER KE
  'コウ': 'kō', // KATAKANA LETTER KO + U
  'コ': 'ko', // KATAKANA LETTER KO

  'シェ': 'she', // KATAKANA LETTER SI + SMALL E
  'スィ': 'si', // KATAKANA LETTER SU + SMALL I

  'サ': 'sa', // KATAKANA LETTER SA
  'ショウ': 'shō', // KATAKANA LETTER SI + SMALL YO + U
  'シュウ': 'shū', // KATAKANA LETTER SI + SMALL YU + U
  'シャ': 'sha', // KATAKANA LETTER SI + SMALL YA
  'ショ': 'sho', // KATAKANA LETTER SI + SMALL YO
  'シュ': 'shu', // KATAKANA LETTER SI + SMALL YU
  'シ': 'shi', // KATAKANA LETTER SI
  'スウ': 'sū', // KATAKANA LETTER SU + U
  'ス': 'su', // KATAKANA LETTER SU
  'セ': 'se', // KATAKANA LETTER SE
  'ソウ': 'sō', // KATAKANA LETTER SO + U
  'ソ': 'so', // KATAKANA LETTER SO

  'チェ': 'che', // KATAKANA LETTER TI + SMALL E
  'ツァ': 'tsa', // KATAKANA LETTER TU + SMALL A
  'ツィ': 'tsi', // KATAKANA LETTER TU + SMALL I
  'ツェ': 'tse', // KATAKANA LETTER TU + SMALL E
  'ツォ': 'tso', // KATAKANA LETTER TU + SMALL O
  'ティ': 'ti', // KATAKANA LETTER TE + SMALL I
  'ディ': 'di', // KATAKANA LETTER DE + SMALL I
  'テュ': 'tyu', // KATAKANA LETTER TE + SMALL YU
  'デュ': 'dyu', // KATAKANA LETTER DE + SMALL YU
  'トィ': 'twi', // KATAKANA LETTER TO + SMALL I
  'トゥ': 'tu', // KATAKANA LETTER TO + SMALL U
  'ドィ': 'dwi', // KATAKANA LETTER DO + SMALL I
  'ドゥ': 'du', // KATAKANA LETTER DO + SMALL U

  'タ': 'ta', // KATAKANA LETTER TA
  'チョウ': 'chō', // KATAKANA LETTER TI + SMALL YO + U
  'チュウ': 'chū', // KATAKANA LETTER TI + SMALL YU + U
  'チャ': 'cha', // KATAKANA LETTER TI + SMALL YA
  'チョ': 'cho', // KATAKANA LETTER TI + SMALL YO
  'チュ': 'chu', // KATAKANA LETTER TI + SMALL YU
  'チ': 'chi', // KATAKANA LETTER TI
  'ツウ': 'tsū', // KATAKANA LETTER TU + U
  'ツ': 'tsu', // KATAKANA LETTER TU
  'テ': 'te', // KATAKANA LETTER TE
  'トウ': 'tō', // KATAKANA LETTER TO + U
  'ト': 'to', // KATAKANA LETTER TO

  'ナ': 'na', // KATAKANA LETTER NA
  'ニョウ': 'nyō', // KATAKANA LETTER NI + SMALL YO + U
  'ニュウ': 'nyū', // KATAKANA LETTER NI + SMALL YU + U
  'ニャ': 'nya', // KATAKANA LETTER NI + SMALL YA
  'ニョ': 'nyo', // KATAKANA LETTER NI + SMALL YO
  'ニュ': 'nyu', // KATAKANA LETTER NI + SMALL YU
  'ニ': 'ni', // KATAKANA LETTER NI
  'ヌウ': 'nū', // KATAKANA LETTER NU + U
  'ヌ': 'nu', // KATAKANA LETTER NU
  'ネ': 'ne', // KATAKANA LETTER NE
  'ノウ': 'nō', // KATAKANA LETTER NO + U
  'ノ': 'no', // KATAKANA LETTER NO

  'ファ': 'fa', // KATAKANA LETTER HU + SMALL A
  'フィ': 'fi', // KATAKANA LETTER HU + SMALL I
  //'フゥ': 'fu', // KATAKANA LETTER HU + SMALL U
  'フェ': 'fe', // KATAKANA LETTER HU + SMALL E
  'フォ': 'fo', // KATAKANA LETTER HU + SMALL O
  'フュ': 'fyu', // KATAKANA LETTER HU + SMALL YU
  'ホェ': 'hwe', // KATAKANA LETTER HO + SMALL E

  'ハ': 'ha', // KATAKANA LETTER HA
  'ヒョウ': 'hyō', // KATAKANA LETTER HI + SMALL YO + U
  'ヒュウ': 'hyū', // KATAKANA LETTER HI + SMALL YU + U
  'ヒャ': 'hya', // KATAKANA LETTER HI + SMALL YA
  'ヒョ': 'hyo', // KATAKANA LETTER HI + SMALL YO
  'ヒュ': 'hyu', // KATAKANA LETTER HI + SMALL YU
  'ヒ': 'hi', // KATAKANA LETTER HI
  'フウ': 'fū', // KATAKANA LETTER HU + U
  'フ': 'fu', // KATAKANA LETTER HU
  'ヘ': 'he', // KATAKANA LETTER HE
  'ホウ': 'hō', // KATAKANA LETTER HO + U
  'ホ': 'ho', // KATAKANA LETTER HO

  'マ': 'ma', // KATAKANA LETTER MA
  'ミョウ': 'myō', // KATAKANA LETTER MI + SMALL YO + U
  'ミュウ': 'myū', // KATAKANA LETTER MI + SMALL YU + U
  'ミャ': 'mya', // KATAKANA LETTER MI + SMALL YA
  'ミョ': 'myo', // KATAKANA LETTER MI + SMALL YO
  'ミュ': 'myu', // KATAKANA LETTER MI + SMALL YU
  'ミ': 'mi', // KATAKANA LETTER MI
  'ムウ': 'mū', // KATAKANA LETTER MU + U
  'ム': 'mu', // KATAKANA LETTER MU
  'メ': 'me', // KATAKANA LETTER ME
  'モウ': 'mō', // KATAKANA LETTER MO + U
  'モ': 'mo', // KATAKANA LETTER MO

  'ヤ': 'ya', // KATAKANA LETTER YA
  'ユウ': 'yū', // KATAKANA LETTER YU + U
  'ユ': 'yu', // KATAKANA LETTER YU
  'ヨウ': 'yō', // KATAKANA LETTER YO + U
  'ヨ': 'yo', // KATAKANA LETTER YO

  'リェ': 'rye', // KATAKANA LETTER RI + SMALL E

  'ラ': 'ra', // KATAKANA LETTER RA
  'リョウ': 'ryō', // KATAKANA LETTER RI + SMALL YO + U
  'リュウ': 'ryū', // KATAKANA LETTER RI + SMALL YU + U
  'リャ': 'rya', // KATAKANA LETTER RI + SMALL YA
  'リョ': 'ryo', // KATAKANA LETTER RI + SMALL YO
  'リュ': 'ryu', // KATAKANA LETTER RI + SMALL YU
  'リ': 'ri', // KATAKANA LETTER RI
  'ルウ': 'rū', // KATAKANA LETTER RU + U
  'ル': 'ru', // KATAKANA LETTER RU
  'レ': 're', // KATAKANA LETTER RE
  'ロウ': 'rō', // KATAKANA LETTER RO + U
  'ロ': 'ro', // KATAKANA LETTER RO

  'ワ': 'wa', // KATAKANA LETTER WA
  'ヰ': 'i', // KATAKANA LETTER WI
  'ヱ': 'e', // KATAKANA LETTER WE
  'ヲ': 'o', // KATAKANA LETTER WO

  'ン': 'n', // KATAKANA LETTER N

  'グァ': 'gwa', // KATAKANA LETTER GU + SMALL A
  'グィ': 'gwi', // KATAKANA LETTER GU + SMALL I
  'グェ': 'gwe', // KATAKANA LETTER GU + SMALL E
  'グォ': 'gwo', // KATAKANA LETTER GU + SMALL O

  'ガ': 'ga', // KATAKANA LETTER GA
  'ギョウ': 'gyō', // KATAKANA LETTER GI + SMALL YO + U
  'ギュウ': 'gyū', // KATAKANA LETTER GI + SMALL YU + U
  'ギャ': 'gya', // KATAKANA LETTER GI + SMALL YA
  'ギョ': 'gyo', // KATAKANA LETTER GI + SMALL YO
  'ギュ': 'gyu', // KATAKANA LETTER GI + SMALL YU
  'ギ': 'gi', // KATAKANA LETTER GI
  'グウ': 'gū', // KATAKANA LETTER GU + U
  'グ': 'gu', // KATAKANA LETTER GU
  'ゲ': 'ge', // KATAKANA LETTER GE
  'ゴウ': 'gō', // KATAKANA LETTER GO + U
  'ゴ': 'go', // KATAKANA LETTER GO

  'ジェ': 'je', // KATAKANA LETTER ZI + SMALL E
  'ズィ': 'zi', // KATAKANA LETTER ZU + SMALL I

  'ザ': 'za', // KATAKANA LETTER ZA
  'ジョウ': 'jō', // KATAKANA LETTER ZI + SMALL YO + U
  'ジュウ': 'jū', // KATAKANA LETTER ZI + SMALL YU + U
  'ジャ': 'ja', // KATAKANA LETTER ZI + SMALL YA
  'ジョ': 'jo', // KATAKANA LETTER ZI + SMALL YO
  'ジュ': 'ju', // KATAKANA LETTER ZI + SMALL YU
  'ジ': 'ji', // KATAKANA LETTER ZI
  'ズウ': 'zū', // KATAKANA LETTER ZU + U
  'ズ': 'zu', // KATAKANA LETTER ZU
  'ゼ': 'ze', // KATAKANA LETTER ZE
  'ゾウ': 'zō', // KATAKANA LETTER ZO + U
  'ゾ': 'zo', // KATAKANA LETTER ZO

  'ダ': 'da', // KATAKANA LETTER DA
  'ヂ': 'ji', // KATAKANA LETTER DI
  'ヅウ': 'zū', // KATAKANA LETTER DU + U
  'ヅ': 'zu', // KATAKANA LETTER DU
  'デ': 'de', // KATAKANA LETTER DE
  'ドウ': 'dō', // KATAKANA LETTER DO + U
  'ド': 'do', // KATAKANA LETTER DO

  'ブュ': 'byu', // KATAKANA LETTER BU + SMALL YU

  'バ': 'ba', // KATAKANA LETTER BA
  'ビョウ': 'byō', // KATAKANA LETTER BI + SMALL YO + U
  'ビュウ': 'byū', // KATAKANA LETTER BI + SMALL YU + U
  'ビャ': 'bya', // KATAKANA LETTER BI + SMALL YA
  'ビョ': 'byo', // KATAKANA LETTER BI + SMALL YO
  'ビュ': 'byu', // KATAKANA LETTER BI + SMALL YU
  'ビ': 'bi', // KATAKANA LETTER BI
  'ブウ': 'bū', // KATAKANA LETTER BU + U
  'ブ': 'bu', // KATAKANA LETTER BU
  'ベ': 'be', // KATAKANA LETTER BE
  'ボウ': 'bō', // KATAKANA LETTER BO + U
  'ボ': 'bo', // KATAKANA LETTER BO

  'パ': 'pa', // KATAKANA LETTER PA
  'ピョウ': 'pyō', // KATAKANA LETTER PI + SMALL YO + U
  'ピュウ': 'pyū', // KATAKANA LETTER PI + SMALL YU + U
  'ピャ': 'pya', // KATAKANA LETTER PI + SMALL YA
  'ピョ': 'pyo', // KATAKANA LETTER PI + SMALL YO
  'ピュ': 'pyu', // KATAKANA LETTER PI + SMALL YU
  'ピ': 'pi', // KATAKANA LETTER PI
  'プウ': 'pū', // KATAKANA LETTER PU + U
  'プ': 'pu', // KATAKANA LETTER PU
  'ペ': 'pe', // KATAKANA LETTER PE
  'ポウ': 'pō', // KATAKANA LETTER PO + U
  'ポ': 'po', // KATAKANA LETTER PO

  'ヴ': 'v', // KATAKANA LETTER VU

  '・': ' ', // KATAKANA MIDDLE DOT

  'いぇ': 'ye', // HIRAGANA LETTER I + SMALL E

  'あ': 'a', // HIRAGANA LETTER A
  'い': 'i', // HIRAGANA LETTER I
  'うう': 'ū', // HIRAGANA LETTER U + U
  'う': 'u', // HIRAGANA LETTER U
  'え': 'e', // HIRAGANA LETTER E
  'おう': 'ō', // HIRAGANA LETTER O + U
  'お': 'o', // HIRAGANA LETTER O

  'くぁ': 'kwa', // HIRAGANA LETTER KU + SMALL A
  'くぃ': 'kwi', // HIRAGANA LETTER KU + SMALL I
  'くぇ': 'kwe', // HIRAGANA LETTER KU + SMALL E
  'くぉ': 'kwo', // HIRAGANA LETTER KU + SMALL O

  'か': 'ka', // HIRAGANA LETTER KA
  'きょう': 'kyō', // HIRAGANA LETTER KI + SMALL YO + U
  'きゅう': 'kyū', // HIRAGANA LETTER KI + SMALL YU + U
  'きゃ': 'kya', // HIRAGANA LETTER KI + SMALL YA
  'きょ': 'kyo', // HIRAGANA LETTER KI + SMALL YO
  'きゅ': 'kyu', // HIRAGANA LETTER KI + SMALL YU
  'き': 'ki', // HIRAGANA LETTER KI
  'くう': 'kū', // HIRAGANA LETTER KU + U
  'く': 'ku', // HIRAGANA LETTER KU
  'け': 'ke', // HIRAGANA LETTER KE
  'こう': 'kō', // HIRAGANA LETTER KO + U
  'こ': 'ko', // HIRAGANA LETTER KO

  'しぇ': 'she', // HIRAGANA LETTER SI + SMALL E
  'すぃ': 'si', // HIRAGANA LETTER SU + SMALL I

  'さ': 'sa', // HIRAGANA LETTER SA
  'しょう': 'shō', // HIRAGANA LETTER SI + SMALL YO + U
  'しゅう': 'shū', // HIRAGANA LETTER SI + SMALL YU + U
  'しゃ': 'sha', // HIRAGANA LETTER SI + SMALL YA
  'しょ': 'sho', // HIRAGANA LETTER SI + SMALL YO
  'しゅ': 'shu', // HIRAGANA LETTER SI + SMALL YU
  'し': 'shi', // HIRAGANA LETTER SI
  'すう': 'sū', // HIRAGANA LETTER SU + U
  'す': 'su', // HIRAGANA LETTER SU
  'せ': 'se', // HIRAGANA LETTER SE
  'そう': 'sō', // HIRAGANA LETTER SO + U
  'そ': 'so', // HIRAGANA LETTER SO

  'ちぇ': 'che', // HIRAGANA LETTER TI + SMALL E
  'つぁ': 'tsa', // HIRAGANA LETTER TU + SMALL A
  'つぃ': 'tsi', // HIRAGANA LETTER TU + SMALL I
  'つぇ': 'tse', // HIRAGANA LETTER TU + SMALL E
  'つぉ': 'tso', // HIRAGANA LETTER TU + SMALL O
  'てぃ': 'ti', // HIRAGANA LETTER TE + SMALL I
  'でぃ': 'di', // HIRAGANA LETTER DE + SMALL I
  'てゅ': 'tyu', // HIRAGANA LETTER TE + SMALL YU
  'でゅ': 'dyu', // HIRAGANA LETTER DE + SMALL YU
  'とぃ': 'twi', // HIRAGANA LETTER TO + SMALL I
  'とぅ': 'tu', // HIRAGANA LETTER TO + SMALL U
  'どぃ': 'dwi', // HIRAGANA LETTER DO + SMALL I
  'どぅ': 'du', // HIRAGANA LETTER DO + SMALL U

  'た': 'ta', // HIRAGANA LETTER TA
  'ちょう': 'chō', // HIRAGANA LETTER TI + SMALL YO + U
  'ちゅう': 'chū', // HIRAGANA LETTER TI + SMALL YU + U
  'ちゃ': 'cha', // HIRAGANA LETTER TI + SMALL YA
  'ちょ': 'cho', // HIRAGANA LETTER TI + SMALL YO
  'ちゅ': 'chu', // HIRAGANA LETTER TI + SMALL YU
  'ち': 'chi', // HIRAGANA LETTER TI
  'つう': 'tsū', // HIRAGANA LETTER TU + U
  'つ': 'tsu', // HIRAGANA LETTER TU
  'て': 'te', // HIRAGANA LETTER TE
  'とう': 'tō', // HIRAGANA LETTER TO + U
  'と': 'to', // HIRAGANA LETTER TO

  'な': 'na', // HIRAGANA LETTER NA
  'にょう': 'nyō', // HIRAGANA LETTER NI + SMALL YO + U
  'にゅう': 'nyū', // HIRAGANA LETTER NI + SMALL YU + U
  'にゃ': 'nya', // HIRAGANA LETTER NI + SMALL YA
  'にょ': 'nyo', // HIRAGANA LETTER NI + SMALL YO
  'にゅ': 'nyu', // HIRAGANA LETTER NI + SMALL YU
  'に': 'ni', // HIRAGANA LETTER NI
  'ぬう': 'nū', // HIRAGANA LETTER NU + U
  'ぬ': 'nu', // HIRAGANA LETTER NU
  'ね': 'ne', // HIRAGANA LETTER NE
  'のう': 'nō', // HIRAGANA LETTER NO + U
  'の': 'no', // HIRAGANA LETTER NO

  'ふぁ': 'fa', // HIRAGANA LETTER HU + SMALL A
  'ふぃ': 'fi', // HIRAGANA LETTER HU + SMALL I
  //'ふぅ': 'fu', // HIRAGANA LETTER HU + SMALL U
  'ふぇ': 'fe', // HIRAGANA LETTER HU + SMALL E
  'ふぉ': 'fo', // HIRAGANA LETTER HU + SMALL O
  'ふゅ': 'fyu', // HIRAGANA LETTER HU + SMALL YU
  'ほぇ': 'hwe', // HIRAGANA LETTER HO + SMALL E

  'は': 'ha', // HIRAGANA LETTER HA
  'ひょう': 'hyō', // HIRAGANA LETTER HI + SMALL YO + U
  'ひゅう': 'hyū', // HIRAGANA LETTER HI + SMALL YU + U
  'ひゃ': 'hya', // HIRAGANA LETTER HI + SMALL YA
  'ひょ': 'hyo', // HIRAGANA LETTER HI + SMALL YO
  'ひゅ': 'hyu', // HIRAGANA LETTER HI + SMALL YU
  'ひ': 'hi', // HIRAGANA LETTER HI
  'ふう': 'fū', // HIRAGANA LETTER HU + U
  'ふ': 'fu', // HIRAGANA LETTER HU
  'へ': 'he', // HIRAGANA LETTER HE
  'ほう': 'hō', // HIRAGANA LETTER HO + U
  'ほ': 'ho', // HIRAGANA LETTER HO

  'ま': 'ma', // HIRAGANA LETTER MA
  'みょう': 'myō', // HIRAGANA LETTER MI + SMALL YO + U
  'みゅう': 'myū', // HIRAGANA LETTER MI + SMALL YU + U
  'みゃ': 'mya', // HIRAGANA LETTER MI + SMALL YA
  'みょ': 'myo', // HIRAGANA LETTER MI + SMALL YO
  'みゅ': 'myu', // HIRAGANA LETTER MI + SMALL YU
  'み': 'mi', // HIRAGANA LETTER MI
  'むう': 'mū', // HIRAGANA LETTER MU + U
  'む': 'mu', // HIRAGANA LETTER MU
  'め': 'me', // HIRAGANA LETTER ME
  'もう': 'mō', // HIRAGANA LETTER MO + U
  'も': 'mo', // HIRAGANA LETTER MO

  'や': 'ya', // HIRAGANA LETTER YA
  'ゆう': 'yū', // HIRAGANA LETTER YU + U
  'ゆ': 'yu', // HIRAGANA LETTER YU
  'よう': 'yō', // HIRAGANA LETTER YO + U
  'よ': 'yo', // HIRAGANA LETTER YO

  'りぇ': 'rye', // HIRAGANA LETTER RI + SMALL E

  'ら': 'ra', // HIRAGANA LETTER RA
  'りょう': 'ryō', // HIRAGANA LETTER RI + SMALL YO + U
  'りゅう': 'ryū', // HIRAGANA LETTER RI + SMALL YU + U
  'りゃ': 'rya', // HIRAGANA LETTER RI + SMALL YA
  'りょ': 'ryo', // HIRAGANA LETTER RI + SMALL YO
  'りゅ': 'ryu', // HIRAGANA LETTER RI + SMALL YU
  'り': 'ri', // HIRAGANA LETTER RI
  'るう': 'rū', // HIRAGANA LETTER RU + U
  'る': 'ru', // HIRAGANA LETTER RU
  'れ': 're', // HIRAGANA LETTER RE
  'ろう': 'rō', // HIRAGANA LETTER RO + U
  'ろ': 'ro', // HIRAGANA LETTER RO

  'わ': 'wa', // HIRAGANA LETTER WA
  'ゐ': 'i', // HIRAGANA LETTER WI
  'ゑ': 'e', // HIRAGANA LETTER WE
  'を': 'o', // HIRAGANA LETTER WO

  'ん': 'n', // HIRAGANA LETTER N

  'ぐぁ': 'gwa', // HIRAGANA LETTER GU + SMALL A
  'ぐぃ': 'gwi', // HIRAGANA LETTER GU + SMALL I
  'ぐぇ': 'gwe', // HIRAGANA LETTER GU + SMALL E
  'ぐぉ': 'gwo', // HIRAGANA LETTER GU + SMALL O

  'が': 'ga', // HIRAGANA LETTER GA
  'ぎょう': 'gyō', // HIRAGANA LETTER GI + SMALL YO + U
  'ぎゅう': 'gyū', // HIRAGANA LETTER GI + SMALL YU + U
  'ぎゃ': 'gya', // HIRAGANA LETTER GI + SMALL YA
  'ぎょ': 'gyo', // HIRAGANA LETTER GI + SMALL YO
  'ぎゅ': 'gyu', // HIRAGANA LETTER GI + SMALL YU
  'ぎ': 'gi', // HIRAGANA LETTER GI
  'ぐう': 'gū', // HIRAGANA LETTER GU + U
  'ぐ': 'gu', // HIRAGANA LETTER GU
  'げ': 'ge', // HIRAGANA LETTER GE
  'ごう': 'gō', // HIRAGANA LETTER GO + U
  'ご': 'go', // HIRAGANA LETTER GO

  'じぇ': 'je', // HIRAGANA LETTER ZI + SMALL E
  'ずぃ': 'zi', // HIRAGANA LETTER ZU + SMALL I

  'ざ': 'za', // HIRAGANA LETTER ZA
  'じょう': 'jō', // HIRAGANA LETTER ZI + SMALL YO + U
  'じゅう': 'jū', // HIRAGANA LETTER ZI + SMALL YU + U
  'じゃ': 'ja', // HIRAGANA LETTER ZI + SMALL YA
  'じょ': 'jo', // HIRAGANA LETTER ZI + SMALL YO
  'じゅ': 'ju', // HIRAGANA LETTER ZI + SMALL YU
  'じ': 'ji', // HIRAGANA LETTER ZI
  'ずう': 'zū', // HIRAGANA LETTER ZU + U
  'ず': 'zu', // HIRAGANA LETTER ZU
  'ぜ': 'ze', // HIRAGANA LETTER ZE
  'ぞう': 'zō', // HIRAGANA LETTER ZO + U
  'ぞ': 'zo', // HIRAGANA LETTER ZO

  'だ': 'da', // HIRAGANA LETTER DA
  'ぢ': 'ji', // HIRAGANA LETTER DI
  'づう': 'zū', // HIRAGANA LETTER DU + U
  'づ': 'zu', // HIRAGANA LETTER DU
  'で': 'de', // HIRAGANA LETTER DE
  'どう': 'dō', // HIRAGANA LETTER DO + U
  'ど': 'do', // HIRAGANA LETTER DO

  'ぶゅ': 'byu', // HIRAGANA LETTER BU + SMALL YU

  'ば': 'ba', // HIRAGANA LETTER BA
  'びょう': 'byō', // HIRAGANA LETTER BI + SMALL YO + U
  'びゅう': 'byū', // HIRAGANA LETTER BI + SMALL YU + U
  'びゃ': 'bya', // HIRAGANA LETTER BI + SMALL YA
  'びょ': 'byo', // HIRAGANA LETTER BI + SMALL YO
  'びゅ': 'byu', // HIRAGANA LETTER BI + SMALL YU
  'び': 'bi', // HIRAGANA LETTER BI
  'ぶう': 'bū', // HIRAGANA LETTER BU + U
  'ぶ': 'bu', // HIRAGANA LETTER BU
  'べ': 'be', // HIRAGANA LETTER BE
  'ぼう': 'bō', // HIRAGANA LETTER BO + U
  'ぼ': 'bo', // HIRAGANA LETTER BO

  'ぱ': 'pa', // HIRAGANA LETTER PA
  'ぴょう': 'pyō', // HIRAGANA LETTER PI + SMALL YO + U
  'ぴゅう': 'pyū', // HIRAGANA LETTER PI + SMALL YU + U
  'ぴゃ': 'pya', // HIRAGANA LETTER PI + SMALL YA
  'ぴょ': 'pyo', // HIRAGANA LETTER PI + SMALL YO
  'ぴゅ': 'pyu', // HIRAGANA LETTER PI + SMALL YU
  'ぴ': 'pi', // HIRAGANA LETTER PI
  'ぷう': 'pū', // HIRAGANA LETTER PU + U
  'ぷ': 'pu', // HIRAGANA LETTER PU
  'ぺ': 'pe', // HIRAGANA LETTER PE
  'ぽう': 'pō', // HIRAGANA LETTER PO + U
  'ぽ': 'po', // HIRAGANA LETTER PO

  'ゔ': 'v' // HIRAGANA LETTER VU
};

var transliterationTable3 = {
  'aァ': 'ā',
  'aぁ': 'ā',
  'iィー': 'ī',
  'iィ': 'ī',
  'iぃー': 'ī',
  'iぃ': 'ī',
  'aー': 'ā',
  'iー': 'ī',
  'uー': 'ū',
  'eー': 'ē',
  'oー': 'ō',

  // Fallback for small vowels
  'ァ': 'a',
  'ィ': 'i',
  'ゥ': 'u',
  'ェ': 'e',
  'ォ': 'o',
  'ぁ': 'a',
  'ぃ': 'i',
  'ぅ': 'u',
  'ぇ': 'e',
  'ぉ': 'o'
};

var replace1 = replacer(transliterationTable1);
var replace2 = replacer(transliterationTable2);
var replace3 = replacer(transliterationTable3);

module.exports = function(str) {
  str = replace1(str);

  str = str
    .replace(/ッ(?=[ン])/g, 'n')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[ん])/g, 'n')// HIRAGANA LETTER SMALL TU
    .replace(/ン(?=[バビブベボパピプペポマミムメモ])/g, 'm')// KATAKANA LETTER N
    .replace(/ん(?=[ばびぶべぼぱぴぷぺぽまみむめも])/g, 'm')// HIRAGANA LETTER N
    .replace(/ン(?=[ヤユヨアイウエオ])/g, "n'")// KATAKANA LETTER N
    .replace(/ん(?=[やゆよあいうえお])/g, "n'");// HIRAGANA LETTER N
  str = str
    .replace(/ッ(?=[カキクケコ])/g, 'k')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[かきくけこ])/g, 'k')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ガギグゲゴ])/g, 'g')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[がぎぐげご])/g, 'g')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[サシスセソ])/g, 's')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[さしすせそ])/g, 's')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ザズゼゾ])/g, 'z')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[ざずぜぞ])/g, 'z')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ジ])/g, 'j')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[じ])/g, 'j')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[タチツテト])/g, 't')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[たちつてと])/g, 't')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ダヂヅデド])/g, 't')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[だぢづでど])/g, 't')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ハヒヘホ])/g, 'h')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[はひへほ])/g, 'h')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[フ])/g, 'f')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[ふ])/g, 'f')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[バビブベボ])/g, 'b')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[ばびぶべぼ])/g, 'b')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[パピプペポ])/g, 'p')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[ぱぴぷぺぽ])/g, 'p')// HIRAGANA LETTER SMALL TU
    .replace(/ッ(?=[ラリルレロ])/g, 'r')// KATAKANA LETTER SMALL TU
    .replace(/っ(?=[らりるれろ])/g, 'r');// HIRAGANA LETTER SMALL TU

  str = replace2(str);
  str = replace3(str);

  str = str
    .replace(/(ッ|っ)\B/g, 't');// FINAL KATAKANA LETTER SMALL TU

  return str;
};

},{"../../util/utils":121}],105:[function(require,module,exports){
/*
Copyright (c) 2014 Ken Koch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/** 
 * The basis of the TRIE structure.
 **/
function Trie(caseSensitive) {
	this.dictionary = {};
	this.$ = false;

	if(typeof caseSensitive === "undefined") {
		caseSensitive = true;
	}

	this.cs = caseSensitive;
}

/**
 * Add a single string to the TRIE, returns true if the word was already in the 
 * trie.
 **/
Trie.prototype.addString = function(string) {
	if(this.cs === false) {
		string = string.toLowerCase();
	}

	// If the string has only one letter, mark this as a word.
	if(string.length === 0) {
		var wasWord = this.$;
		this.$ = true;
		return wasWord;
	}

	// Make sure theres a Trie node in our dictionary
	var next = this.dictionary[string[0]];

	if(!next) {
		this.dictionary[string[0]] = new Trie(this.cs);
		next = this.dictionary[string[0]];
	}

	// Continue adding the string
	return next.addString(string.substring(1));
};

/**
 * Add multiple strings to the TRIE
 **/
Trie.prototype.addStrings = function(list) {
	for(var i in list) {
		this.addString(list[i]);
	}
};

/**
 * A function to search the TRIE and return an array of
 * words which have same prefix <prefix>
 * for example if we had the following words in our database:
 * a, ab, bc, cd, abc, abd
 * and we search the string: a
 * we will get :
 * [a, ab, abc, abd]
 **/
Trie.prototype.keysWithPrefix = function(prefix) {
    if(this.caseSensitive === false) {
        prefix = prefix.toLowerCase();
    }

    function isEmpty (object) {
        for (var key in object) if (object.hasOwnProperty(key)) return false;
        return true;
    }

    function get (node, word) {
        if(!node) return null;
        if(word.length == 0) return node;
        return get(node.dictionary[word[0]], word.substring(1));
    }

    function recurse ( node, stringAgg, resultsAgg) {
        if (!node) return;

        // Check if this is a word
        if (node.$) {
            resultsAgg.push(stringAgg);
        }

        if (isEmpty(node.dictionary)) {
            return ;
        }

        for (var c in node.dictionary) {
            recurse (node.dictionary[c],stringAgg + c, resultsAgg);
        }
    }

    var results = [];
    recurse (get(this, prefix), prefix, results);
    return results;
};

/** 
 * A function to search the given string and return true if it lands
 * on on a word. Essentially testing if the word exists in the database.
 **/
Trie.prototype.contains = function(string) {
	if(this.cs === false) {
		string = string.toLowerCase();
	}

	if(string.length === 0) {
		return this.$;
	}

	// Otherwise, we need to continue searching
	var firstLetter = string[0];
	var next = this.dictionary[firstLetter];		

	// If we don't have a node, this isn't a word
	if(!next) {
		return false;
	}

	// Otherwise continue the search at the next node
	return next.contains(string.substring(1));
}

/**
 * A function to search the TRIE and return an array of words which were encountered along the way.
 * This will only return words with full prefix matches.
 * for example if we had the following words in our database:
 * a, ab, bc, cd, abc
 * and we searched the string: abcd
 * we would get only:
 * [a, ab, abc]
 **/
Trie.prototype.findMatchesOnPath = function(search) {
	if(this.cs === false) {
		search = search.toLowerCase();
	}

	function recurse(node, search, stringAgg, resultsAgg) {
		// Check if this is a word.
		if(node.$) {
			resultsAgg.push(stringAgg);
		}

		// Check if the have completed the seearch
		if(search.length === 0) {
			return resultsAgg;
		}

		// Otherwise, continue searching
		var next = node.dictionary[search[0]];
		if(!next) {
			return resultsAgg;
		}
		return recurse(next, search.substring(1), stringAgg + search[0], resultsAgg);
	};

	return recurse(this, search, "", []);
};

/**
 * Returns the longest match and the remaining part that could not be matched.
 * inspired by [NLTK containers.trie.find_prefix](http://nltk.googlecode.com/svn-/trunk/doc/api/nltk.containers.Trie-class.html).
 **/
Trie.prototype.findPrefix = function(search) {
	if(this.cs === false) {
		search = search.toLowerCase();
	}
	
	function recurse(node, search, stringAgg, lastWord) {
		// Check if this is a word
		if(node.$) {
			lastWord = stringAgg;
		}

		// Check if we have no more to search
		if(search.length === 0) {
			return [lastWord, search];
		}

		// Continue searching
		var next = node.dictionary[search[0]];
		if(!next) {
			return [lastWord, search];
		}
		return recurse(next, search.substring(1), stringAgg + search[0], lastWord);
	};

	return recurse(this, search, "", null);
};

/**
 * Computes the number of actual nodes from this node to the end.
 * Note: This involves traversing the entire structure and may not be
 * good for frequent use.
 **/
Trie.prototype.getSize = function() { 
	var total = 1;
	for(var c in this.dictionary) {
		total += this.dictionary[c].getSize();
	}
	return total;
};

/**
 * EXPORT THE TRIE
 **/
module.exports = Trie;

},{}],106:[function(require,module,exports){
/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

function Bag() {
    this.dictionary = [];
    this.nElement = 0;
};

Bag.prototype.add = function(element) {
    this.dictionary.push(element);
    this.nElement++;
    return this;
};

Bag.prototype.isEmpty = function() {
    return this.nElement > 0;
};

Bag.prototype.contains = function(item) {
    return this.dictionary.indexOf(item) >= 0;
};

/**
 * unpack the bag , and get all items
 */
Bag.prototype.unpack = function() {
    // return a copy is better than original
    return this.dictionary.slice();
};

module.exports = Bag;

},{}],107:[function(require,module,exports){
/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

var util = require('util'),
    Bag = require('./bag');

var DirectedEdge = function(start, end, weight) {
    this.start = start;
    this.end = end;
    this.weight = weight;
};

DirectedEdge.prototype.weight = function() {
    return this.weight;
};

DirectedEdge.prototype.from = function() {
    return this.start;
};

DirectedEdge.prototype.to = function() {
    return this.end;
};

DirectedEdge.prototype.toString = function() {
    return util.format('%s -> %s, %s', this.start, this.end, this.weight);
};

var EdgeWeightedDigraph = function() {
    this.edgesNum = 0;
    this.adj = []; // adjacency list
};

/**
 * the number of vertexs saved.
 */
EdgeWeightedDigraph.prototype.v = function() {
    return this.adj.length;
};

/**
 * the number of edges saved.
 */
EdgeWeightedDigraph.prototype.e = function() {
    return this.edgesNum;
};

EdgeWeightedDigraph.prototype.add = function(start, end, weight) {
    var e = new DirectedEdge(start, end, weight);
    this.addEdge(e);
};

EdgeWeightedDigraph.prototype.addEdge = function(e) {
    if(!this.adj[e.from()]) {
        this.adj[e.from()] = new Bag();
    }
    this.adj[e.from()].add(e);
    this.edgesNum++;
};

/**
 * use callback on all edges from v.
 */
EdgeWeightedDigraph.prototype.getAdj = function(v) {
    if(!this.adj[v]) return [];
    return this.adj[v].unpack();
};

/**
 * use callback on all edges.
 */
EdgeWeightedDigraph.prototype.edges = function() {
    var adj = this.adj;
    var list = new Bag();
    for(var i in adj) {
        adj[i].unpack().forEach(function(item) {
            list.add(item);
        });
    }
    return list.unpack();
};

EdgeWeightedDigraph.prototype.toString = function() {
    var result = [];
    var list = this.edges();
    list.forEach(function(edge) {
        result.push(edge.toString());
    });
    return result.join('\n');
};

module.exports = EdgeWeightedDigraph;

},{"./bag":106,"util":140}],108:[function(require,module,exports){
/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

var EdgeWeightedDigraph = require('./edge_weighted_digraph'),
    Topological = require('./topological');

/**
  *  The LongestPathTree represents a data type for solving the
  *  single-source longest paths problem in edge-weighted directed
  *  acyclic graphs (DAGs). The edge weights can be positive, negative, or zero.
  *  This implementation uses a topological-sort based algorithm.
  *  the distTo() and hasPathTo() methods take
  *  constant time and the pathTo() method takes time proportional to the
  *  number of edges in the longest path returned.
  */
var LongestPathTree = function(digraph, start) {
    var _this = this;
    this.edgeTo = [];
    this.distTo = [];
    this.distTo[start] = 0.0;
    this.start = start;
    this.top = new Topological(digraph);
    this.top.order().forEach(function(vertex){
        _this.relaxVertex(digraph, vertex, _this);
    });
};

LongestPathTree.prototype.relaxEdge = function(e) {
    var distTo = this.distTo,
        edgeTo = this.edgeTo;
    var v = e.from(), w = e.to();
    if (distTo[w] < distTo[v] + e.weight) {
        distTo[w] = distTo[v] + e.weight;
        edgeTo[w] = e;
    }
};

/**
 * relax a vertex v in the specified digraph g
 * @param {EdgeWeightedDigraph} the apecified digraph
 * @param {Vertex} v vertex to be relaxed
 */
LongestPathTree.prototype.relaxVertex = function(digraph, vertex, tree) {
    var distTo = tree.distTo;
    var edgeTo = tree.edgeTo;

    digraph.getAdj(vertex).forEach(function(edge){
        var w = edge.to();
        distTo[w] = distTo[w] || 0.0;
        distTo[vertex] = distTo[vertex] || 0.0;
        if (distTo[w] < distTo[vertex] + edge.weight) {
            // in case of the result of 0.28+0.34 is 0.62000001
            distTo[w] = parseFloat((distTo[vertex] + edge.weight).toFixed(2));
            edgeTo[w] = edge;
        }
    });

};

LongestPathTree.prototype.getDistTo = function(v) {
    return this.distTo[v];
};

LongestPathTree.prototype.hasPathTo = function(v) {
    return !!this.distTo[v];
};

LongestPathTree.prototype.pathTo = function(v) {
    if (!this.hasPathTo(v)) return [];
    var path = [];
    var edgeTo = this.edgeTo;
    for (var e = edgeTo[v]; !!e; e = edgeTo[e.from()]) {
        path.push(e.to());
    }
    path.push(this.start);
    return path.reverse();
};

module.exports = LongestPathTree;

},{"./edge_weighted_digraph":107,"./topological":120}],109:[function(require,module,exports){
/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

var EdgeWeightedDigraph = require('./edge_weighted_digraph'),
    Topological = require('./topological');

/**
  *  The ShortestPathTree represents a data type for solving the
  *  single-source shortest paths problem in edge-weighted directed
  *  acyclic graphs (DAGs). The edge weights can be positive, negative, or zero.
  *  This implementation uses a topological-sort based algorithm.
  *  the distTo() and hasPathTo() methods take
  *  constant time and the pathTo() method takes time proportional to the
  *  number of edges in the longest path returned.
  */
var ShortestPathTree = function(digraph, start) {
    var _this = this;
    this.edgeTo = [];
    this.distTo = [];
    this.distTo[start] = 0.0;
    this.start = start;
    this.top = new Topological(digraph);
    this.top.order().forEach(function(vertex){
        _this.relaxVertex(digraph, vertex, _this);
    });
};

ShortestPathTree.prototype.relaxEdge = function(e) {
    var distTo = this.distTo,
        edgeTo = this.edgeTo;
    var v = e.from(), w = e.to();
    if (distTo[w] > distTo[v] + e.weight) {
        distTo[w] = distTo[v] + e.weight;
        edgeTo[w] = e;
    }
};

/**
 * relax a vertex v in the specified digraph g
 * @param {EdgeWeightedDigraph} the apecified digraph
 * @param {Vertex} v vertex to be relaxed
 */
ShortestPathTree.prototype.relaxVertex = function(digraph, vertex, tree) {
    var distTo = tree.distTo;
    var edgeTo = tree.edgeTo;
    digraph.getAdj(vertex).forEach(function(edge){
        var w = edge.to();
        distTo[w] = /\d/.test(distTo[w]) ? distTo[w] : Number.MAX_VALUE;
        distTo[vertex] = distTo[vertex] || 0;
        if (distTo[w] > distTo[vertex] + edge.weight) {
            // in case of the result of 0.28+0.34 is 0.62000001
            distTo[w] = parseFloat((distTo[vertex] + edge.weight).toFixed(2));
            edgeTo[w] = edge;
        }
    });

};

ShortestPathTree.prototype.getDistTo = function(v) {
    return this.distTo[v];
};

ShortestPathTree.prototype.hasPathTo = function(v) {
    var dist = this.distTo[v];
    if(v == this.start) return false;
    return /\d/.test(dist) ? dist != Number.MAX_VALUE : false;
};

ShortestPathTree.prototype.pathTo = function(v) {
    if (!this.hasPathTo(v) || v == this.start) return [];
    var path = [];
    var edgeTo = this.edgeTo;
    for (var e = edgeTo[v]; !!e; e = edgeTo[e.from()]) {
        path.push(e.to());
    }
    path.push(this.start);
    return path.reverse();
};

module.exports = ShortestPathTree;

},{"./edge_weighted_digraph":107,"./topological":120}],110:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
    'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
    'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
    'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
    'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
    'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
    'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'said', 'same', 'see', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
    'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
    'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
    '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];

// tell the world about the noise words.
exports.words = words;

},{}],111:[function(require,module,exports){
/*
Copyright (c) 2011, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    'a','un','el','ella','y','sobre','de','la','que','en',
    'los','del','se','las','por','un','para','con','no',
    'una','su','al','lo','como','más','pero','sus','le',
    'ya','o','porque','cuando','muy','sin','sobre','también',
    'me','hasta','donde','quien','desde','nos','durante','uno',
    'ni','contra','ese','eso','mí','qué','otro','él','cual',
    'poco','mi','tú','te','ti','sí',
     '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];
    
// tell the world about the noise words.    
exports.words = words;

},{}],112:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel
Farsi Stop Words by Fardin Koochaki <me@fardinak.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    // Words
    'از', 'با', 'یه', 'برای', 'و', 'باید', 'شاید',

    // Symbols
    '؟', '!', '٪', '.', '،', '؛', ':', ';', ',',
    
    // Numbers
    '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹', '۰'
];
    
// tell the world about the noise words.    
exports.words = words;

},{}],113:[function(require,module,exports){
/*
 Copyright (c) 2014, Ismaël Héry

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// A list of commonly used french words that have little meaning and can be excluded
// from analysis.

var words = ['être', 'avoir', 'faire',
    'a',
    'au',
    'aux',
    'avec',
    'ce',
    'ces',
    'dans',
    'de',
    'des',
    'du',
    'elle',
    'en',
    'et',
    'eux',
    'il',
    'je',
    'la',
    'le',
    'leur',
    'lui',
    'ma',
    'mais',
    'me',
    'même',
    'mes',
    'moi',
    'mon',
    'ne',
    'nos',
    'notre',
    'nous',
    'on',
    'ou',
    'où',
    'par',
    'pas',
    'pour',
    'qu',
    'que',
    'qui',
    'sa',
    'se',
    'ses',
    'son',
    'sur',
    'ta',
    'te',
    'tes',
    'toi',
    'ton',
    'tu',
    'un',
    'une',
    'vos',
    'votre',
    'vous',
    'c',
    'd',
    'j',
    'l',
    'à',
    'm',
    'n',
    's',
    't',
    'y',
    'été',
    'étée',
    'étées',
    'étés',
    'étant',
    'suis',
    'es',
    'est',
    'sommes',
    'êtes',
    'sont',
    'serai',
    'seras',
    'sera',
    'serons',
    'serez',
    'seront',
    'serais',
    'serait',
    'serions',
    'seriez',
    'seraient',
    'étais',
    'était',
    'étions',
    'étiez',
    'étaient',
    'fus',
    'fut',
    'fûmes',
    'fûtes',
    'furent',
    'sois',
    'soit',
    'soyons',
    'soyez',
    'soient',
    'fusse',
    'fusses',
    'fût',
    'fussions',
    'fussiez',
    'fussent',
    'ayant',
    'eu',
    'eue',
    'eues',
    'eus',
    'ai',
    'as',
    'avons',
    'avez',
    'ont',
    'aurai',
    'auras',
    'aura',
    'aurons',
    'aurez',
    'auront',
    'aurais',
    'aurait',
    'aurions',
    'auriez',
    'auraient',
    'avais',
    'avait',
    'avions',
    'aviez',
    'avaient',
    'eut',
    'eûmes',
    'eûtes',
    'eurent',
    'aie',
    'aies',
    'ait',
    'ayons',
    'ayez',
    'aient',
    'eusse',
    'eusses',
    'eût',
    'eussions',
    'eussiez',
    'eussent',
    'ceci',
    'cela',
    'cet',
    'cette',
    'ici',
    'ils',
    'les',
    'leurs',
    'quel',
    'quels',
    'quelle',
    'quelles',
    'sans',
    'soi'
];

exports.words = words;

},{}],114:[function(require,module,exports){
/*
Copyright (c) 2011, David Przybilla, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    'ad','al','allo','ai','agli','all','agl','alla','alle','con','col','coi','da','dal','dallo',
    'dai','dagli','dall','dagl','dalla','dalle','di','del','dello','dei','degli','dell','degl',
    'della','delle','in','nel','nello','nei','negli','nell','negl','nella','nelle','su','sul',
    'sullo','sui','sugli','sull','sugl','sulla','sulle','per','tra','contro','io','tu','lui',
    'lei','noi','voi','loro','mio','mia','miei','mie','tuo','tua','tuoi','tue','suo','sua','suoi',
    'sue','nostro','nostra','nostri','nostre','vostro','vostra','vostri','vostre','mi','ti','ci',
    'vi','lo','la','li','le','gli','ne','il','un','uno','una','ma','ed','se','perché','anche','come',
    'dov','dove','che','chi','cui','non','più','quale','quanto','quanti','quanta','quante','quello',
    'quelli','quella','quelle','questo','questi','questa','queste','si','tutto','tutti','a','c','e',
    'i','l','o','ho','hai','ha','abbiamo','avete','hanno','abbia','abbiate','abbiano','avrò','avrai',
    'avrà','avremo','avrete','avranno','avrei','avresti','avrebbe','avremmo','avreste','avrebbero',
    'avevo','avevi','aveva','avevamo','avevate','avevano','ebbi','avesti','ebbe','avemmo','aveste',
    'ebbero','avessi','avesse','avessimo','avessero','avendo','avuto','avuta','avuti','avute','sono',
    'sei','è','siamo','siete','sia','siate','siano','sarò','sarai','sarà','saremo','sarete','saranno',
    'sarei','saresti','sarebbe','saremmo','sareste','sarebbero','ero','eri','era','eravamo','eravate',
    'erano','fui','fosti','fu','fummo','foste','furono','fossi','fosse','fossimo','fossero','essendo',
    'faccio','fai','facciamo','fanno','faccia','facciate','facciano','farò','farai','farà','faremo',
    'farete','faranno','farei','faresti','farebbe','faremmo','fareste','farebbero','facevo','facevi',
    'faceva','facevamo','facevate','facevano','feci','facesti','fece','facemmo','faceste','fecero',
    'facessi','facesse','facessimo','facessero','facendo','sto','stai','sta','stiamo','stanno','stia',
    'stiate','stiano','starò','starai','starà','staremo','starete','staranno','starei','staresti',
    'starebbe','staremmo','stareste','starebbero','stavo','stavi','stava','stavamo','stavate','stavano',
    'stetti','stesti','stette','stemmo','steste','stettero','stessi','stesse','stessimo','stessero','stando',
     '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];
    
// tell the world about the noise words.    
exports.words = words;

},{}],115:[function(require,module,exports){
// Original copyright:
/*
 Licensed to the Apache Software Foundation (ASF) under one or more
 contributor license agreements.  See the NOTICE file distributed with
 this work for additional information regarding copyright ownership.
 The ASF licenses this file to You under the Apache License, Version 2.0
 the "License"); you may not use this file except in compliance with
 the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// This version:
/*
Copyright (c) 2012, Guillaume Marty

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
// Original location:
// http://svn.apache.org/repos/asf/lucene/dev/trunk/lucene/analysis/kuromoji/src/resources/org/apache/lucene/analysis/ja/stopwords.txt
var words = ['の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
  'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる',
  'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの',
  'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ', 'によって',
  'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる', 'において', 'ば', 'なかっ',
  'なく', 'しかし', 'について', 'せ', 'だっ', 'その後', 'できる', 'それ', 'う', 'ので',
  'なお', 'のみ', 'でき', 'き', 'つ', 'における', 'および', 'いう', 'さらに', 'でも',
  'ら', 'たり', 'その他', 'に関する', 'たち', 'ます', 'ん', 'なら', 'に対して', '特に',
  'せる', '及び', 'これら', 'とき', 'では', 'にて', 'ほか', 'ながら', 'うち', 'そして',
  'とともに', 'ただし', 'かつて', 'それぞれ', 'または', 'お', 'ほど', 'ものの', 'に対する',
  'ほとんど', 'と共に', 'といった', 'です', 'とも', 'ところ', 'ここ'];

// tell the world about the noise words.
module.exports = words;

},{}],116:[function(require,module,exports){
/*
Copyright (c) 2014, Kristoffer Brabrand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    'og','i','jeg','det','at','en','et','den','til','er','som',
    'på','de','med','han','av','ikke','der','så','var','meg',
    'seg','men','ett','har','om','vi','min','mitt','ha','hadde',
    'hun','nå','over','da','ved','fra','du','ut','sin','dem',
    'oss','opp','man','kan','hans','hvor','eller','hva','skal',
    'selv','sjøl','her','alle','vil','bli','ble','blitt','kunne',
    'inn','når','være','kom','noen','noe','ville','dere','som',
    'deres','kun','ja','etter','ned','skulle','denne','for','deg',
    'si','sine','sitt','mot','å','meget','hvorfor','dette','disse',
    'uten','hvordan','ingen','din','ditt','blir','samme','hvilken',
    'hvilke','sånn','inni','mellom','vår','hver','hvem','vors',
    'hvis','både','bare','enn','fordi','før','mange','også','slik',
    'vært','være','begge','siden','henne','hennar','hennes',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];

// tell the world about the noise words.
exports.words = words;
},{}],117:[function(require,module,exports){
/*
Copyright (c) 2013, Paweł Łaskarzewski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
// list based on: http://pl.wikipedia.org/wiki/Wikipedia:Stopwords
var words = [
    'a', 'aby', 'ach', 'acz', 'aczkolwiek', 'aj', 'albo', 'ale', 'ależ', 'ani',
    'aż', 'bardziej', 'bardzo', 'bo', 'bowiem', 'by', 'byli', 'bynajmniej',
    'być', 'był', 'była', 'było', 'były', 'będzie', 'będą', 'cali', 'cała',
    'cały', 'ci', 'cię', 'ciebie', 'co', 'cokolwiek', 'coś', 'czasami',
    'czasem', 'czemu', 'czy', 'czyli', 'daleko', 'dla', 'dlaczego', 'dlatego',
    'do', 'dobrze', 'dokąd', 'dość', 'dużo', 'dwa', 'dwaj', 'dwie', 'dwoje',
    'dziś', 'dzisiaj', 'gdy', 'gdyby', 'gdyż', 'gdzie', 'gdziekolwiek',
    'gdzieś', 'i', 'ich', 'ile', 'im', 'inna', 'inne', 'inny', 'innych', 'iż',
    'ja', 'ją', 'jak', 'jakaś', 'jakby', 'jaki', 'jakichś', 'jakie', 'jakiś',
    'jakiż', 'jakkolwiek', 'jako', 'jakoś', 'je', 'jeden', 'jedna', 'jedno',
    'jednak', 'jednakże', 'jego', 'jej', 'jemu', 'jest', 'jestem', 'jeszcze',
    'jeśli', 'jeżeli', 'już', 'ją', 'każdy', 'kiedy', 'kilka', 'kimś', 'kto',
    'ktokolwiek', 'ktoś', 'która', 'które', 'którego', 'której', 'który',
    'których', 'którym', 'którzy', 'ku', 'lat', 'lecz', 'lub', 'ma', 'mają',
    'mało', 'mam', 'mi', 'mimo', 'między', 'mną', 'mnie', 'mogą', 'moi', 'moim',
    'moja', 'moje', 'może', 'możliwe', 'można', 'mój', 'mu', 'musi', 'my', 'na',
    'nad', 'nam', 'nami', 'nas', 'nasi', 'nasz', 'nasza', 'nasze', 'naszego',
    'naszych', 'natomiast', 'natychmiast', 'nawet', 'nią', 'nic', 'nich', 'nie',
    'niech', 'niego', 'niej', 'niemu', 'nigdy', 'nim', 'nimi', 'niż', 'no', 'o',
    'obok', 'od', 'około', 'on', 'ona', 'one', 'oni', 'ono', 'oraz', 'oto',
    'owszem', 'pan', 'pana', 'pani', 'po', 'pod', 'podczas', 'pomimo', 'ponad',
    'ponieważ', 'powinien', 'powinna', 'powinni', 'powinno', 'poza', 'prawie',
    'przecież', 'przed', 'przede', 'przedtem', 'przez', 'przy', 'roku',
    'również', 'sam', 'sama', 'są', 'się', 'skąd', 'sobie', 'sobą', 'sposób',
    'swoje', 'ta', 'tak', 'taka', 'taki', 'takie', 'także', 'tam', 'te', 'tego',
    'tej', 'temu', 'ten', 'teraz', 'też', 'to', 'tobą', 'tobie', 'toteż',
    'trzeba', 'tu', 'tutaj', 'twoi', 'twoim', 'twoja', 'twoje', 'twym', 'twój',
    'ty', 'tych', 'tylko', 'tym', 'u', 'w', 'wam', 'wami', 'was', 'wasz', 'zaś',
    'wasza', 'wasze', 'we', 'według', 'wiele', 'wielu', 'więc', 'więcej', 'tę',
    'wszyscy', 'wszystkich', 'wszystkie', 'wszystkim', 'wszystko', 'wtedy',
    'wy', 'właśnie', 'z', 'za', 'zapewne', 'zawsze', 'ze', 'zł', 'znowu',
    'znów', 'został', 'żaden', 'żadna', 'żadne', 'żadnych', 'że', 'żeby',
    '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];

// tell the world about the noise words.
exports.words = words;

},{}],118:[function(require,module,exports){
/*
Copyright (c) 2011, Luís Rodrigues

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
  'a',
  'à',
  'ao',
  'aos',
  'aquela',
  'aquelas',
  'aquele',
  'aqueles',
  'aquilo',
  'as',
  'às',
  'até',
  'com',
  'como',
  'da',
  'das',
  'de',
  'dela',
  'delas',
  'dele',
  'deles',
  'depois',
  'do',
  'dos',
  'e',
  'ela',
  'elas',
  'ele',
  'eles',
  'em',
  'entre',
  'essa',
  'essas',
  'esse',
  'esses',
  'esta',
  'estas',
  'este',
  'estes',
  'eu',
  'isso',
  'isto',
  'já',
  'lhe',
  'lhes',
  'mais',
  'mas',
  'me',
  'mesmo',
  'meu',
  'meus',
  'minha',
  'minhas',
  'muito',
  'muitos',
  'na',
  'não',
  'nas',
  'nem',
  'no',
  'nos',
  'nós',
  'nossa',
  'nossas',
  'nosso',
  'nossos',
  'num',
  'nuns',
  'numa',
  'numas',
  'o',
  'os',
  'ou',
  'para',
  'pela',
  'pelas',
  'pelo',
  'pelos',
  'por',
  'quais',
  'qual',
  'quando',
  'que',
  'quem',
  'se',
  'sem',
  'seu',
  'seus',
  'só',
  'sua',
  'suas',
  'também',
  'te',
  'teu',
  'teus',
  'tu',
  'tua',
  'tuas',
  'um',
  'uma',
  'umas',
  'você',
  'vocês',
  'vos',
  'vosso',
  'vossos',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'
];

// tell the world about the noise words.
exports.words = words;

},{}],119:[function(require,module,exports){
/*
Copyright (c) 2011, Polyakov Vladimir, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// a list of commonly used words that have little meaning and can be excluded
// from analysis.
var words = [
    'о', 'после', 'все', 'также', 'и', 'другие', 'все', 'как', 'во', 'быть',
    'потому', 'был', 'до', 'являюсь', 'между', 'все', 'но', 'от', 'иди', 'могу',
    'подойди', 'мог', 'делал', 'делаю', 'каждый', 'для', 'откуда', 'иметь', 'имел',
    'он', 'имеет', 'её', 'здесь', 'его', 'как', 'если', 'в', 'оно', 'за',
    'делать', 'много', 'я', 'может быть', 'более', 'самый', 'должен',
    'мой', 'никогда', 'сейчас', 'из', 'на', 'только', 'или', 'другой', 'другая',
    'другое', 'наше', 'вне', 'конец', 'сказал', 'сказала', 'также', 'видел', 'c',
    'немного', 'все еще', 'так', 'затем', 'тот', 'их', 'там', 'этот', 'они', 'те',
    'через', 'тоже', 'под', 'над', 'очень', 'был', 'путь', 'мы', 'хорошо',
    'что', 'где', 'который', 'пока', 'кто', 'с кем', 'хотел бы', 'ты', 'твои',
    'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н',
    'o', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь',
    'э', 'ю', 'я','$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'];
    
// tell the world about the noise words.    
exports.words = words;

},{}],120:[function(require,module,exports){
/*
 Copyright (c) 2014, Lee Wenzhu

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
'use strict';

/**
 * a topo sort for a digraph
 * @param {Digraph}
 */
var Topological = function(g) {
    this.isDag = true;
    this.sorted = topoSort(uniqueVertexs(g.edges()), g.edges());
};

Topological.prototype.isDAG = function() {
    return this.isDag;
};

/**
 * get ordered vertexs of digraph
 */
Topological.prototype.order = function() {
    return this.sorted.slice();
};

/**
 * @param {Array} all vertex in digraph
 * @param {Object} all edges in the digraph
 */
function topoSort(vertexs, edges) {
    var sorted = [];
    var cursor = vertexs.length,
        visited = {},
        i = cursor;
    while (i--) {
        if (!visited[i]) visit(vertexs[i], i, []);
    }

    return sorted.reverse();

    function visit(vertex, i, predecessors) {
        if(predecessors.indexOf(vertex) >= 0) {
            throw new Error('Cyclic dependency:' + JSON.stringify(vertex));
        }

        if(visited[i]) return;
        visited[i] = true;

        var outgoing = edges.filter(function(edge) {
            return edge.to() === vertex;
        });

        var preds = [];
        if(outgoing.length > 0) {
            preds = predecessors.concat(vertex);
        }
        var from;
        outgoing.forEach(function(edge) {
            from = edge.from();
            visit(from, vertexs.indexOf(from), preds);
        });

        sorted[--cursor] = vertex;
    };
};


function uniqueVertexs(edges) {
    var vertexs = [];
    var from, to;
    edges.forEach(function(edge) {
        from = edge.from();
        to = edge.to();
        if (vertexs.indexOf(from) < 0) vertexs.push(from);
        if (vertexs.indexOf(to) < 0) vertexs.push(to);
    });
    return vertexs;
};

module.exports = Topological;

},{}],121:[function(require,module,exports){
/*
 Copyright (c) 2012, Guillaume Marty

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */


/**
 * Generate a replacing function given a table of patterns. Inspired by:
 * http://code.google.com/p/jslibs/wiki/JavascriptTips#String_converter
 * The order of elements is significant. Longer elements should be listed first.
 * @see Speed test http://jsperf.com/build-a-regexp-table
 *
 * @param {Object.<string, string>} translationTable The translation table of key value.
 * @return {function(string): string} A translating function.
 */
function replacer(translationTable) {
  /**
   * An array of translationTable keys.
   * @type {Array.<string>}
   */
  var pattern = [];

  /**
   * The regular expression doing the replacement job.
   * @type {RegExp}
   */
  var regExp;

  /**
   * Used to iterate over translationTable.
   * @type {string}
   */
  var key;

  for (key in translationTable) {
    // Escaping regexp special chars.
    // @see Speed test for type casting to string http://jsperf.com/string-type-casting/2
    // @see http://closure-library.googlecode.com/svn/docs/closure_goog_string_string.js.source.html#line956
    key = ('' + key).replace(/([-()\[\]{}+?*.$\^|,:#<!\\\/])/g, '\\$1').
      replace(/\x08/g, '\\x08');

    pattern.push(key);
  }

  regExp = new RegExp(pattern.join('|'), 'g');

  /**
   * @param {string} str Input string.
   * @return {string} The string replaced.
   */
  return function(str) {
    return str.replace(regExp, function(str) {
      return translationTable[str];
    });
  };
}


/**
 * Exchanges all keys with their associated values in an object.
 *
 * @param {Object.<string, string>} obj An object of strings.
 * @return {Object.<string, string>} An object of strings.
 */
function flip(obj) {
  var newObj = Object.create(null),
      key;

  for (key in obj) {
    newObj[obj[key]] = key;
  }

  return newObj;
}


/**
 * Merge several objects. Properties from earlier objects are overwritten by
 * laters's in case of conflict.
 *
 * @param {...Object.<string, string>} var_args One or more objects of strings.
 * @return {!Object.<string, string>} An object of strings.
 */
function merge(var_args) {
  var args = [].slice.call(arguments),
      newObj = Object.create(null),
      id = 0, key;

  while (args[id]) {
    for (key in args[id]) {
      newObj[key] = args[id][key];
    }

    id++;
  }

  return newObj;
}

exports.replacer = replacer;
exports.flip = flip;
exports.merge = merge;

},{}],122:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var WordNetFile = require('./wordnet_file'),
  fs = require('fs'),
  util = require('util');

function get(location, callback) {
  var buff = new Buffer(4096);

  this.open(function(err, fd, done) {
    WordNetFile.appendLineChar(fd, location, 0, buff, function(line) {
      done();
      var data = line.split('| ');
      var tokens = data[0].split(/\s+/);
      var ptrs = [];
      var wCnt = parseInt(tokens[3], 16);
      var synonyms = [];

      for(var i = 0; i < wCnt; i++) {
        synonyms.push(tokens[4 + i * 2]);
      }

      var ptrOffset = (wCnt - 1) * 2 + 6;
      for(var i = 0; i < parseInt(tokens[ptrOffset], 10); i++) {
        ptrs.push({
          pointerSymbol: tokens[ptrOffset + 1 + i * 4],
          synsetOffset: parseInt(tokens[ptrOffset + 2 + i * 4], 10),
          pos: tokens[ptrOffset + 3 + i * 4],
          sourceTarget: tokens[ptrOffset + 4 + i * 4]
        });
      }

      // break "gloss" into definition vs. examples
      var glossArray = data[1].split("; ");
      var definition = glossArray[0];
      var examples = glossArray.slice(1);    

      for (var k=0; k < examples.length; k++) {
        examples[k] = examples[k].replace(/\"/g,'').replace(/\s\s+/g,'');
      }
      
      callback({
        synsetOffset: parseInt(tokens[0], 10),
        lexFilenum: parseInt(tokens[1], 10),
        pos: tokens[2],
        wCnt: wCnt,
        lemma: tokens[4],
        synonyms: synonyms,
        lexId: tokens[5],
        ptrs: ptrs,
        gloss: data[1],
        def: definition,
        exp: examples
      });
    });
  });
}

var DataFile = function(dataDir, name) {
  WordNetFile.call(this, dataDir, 'data.' + name);
};

util.inherits(DataFile, WordNetFile);
DataFile.prototype.get = get;

module.exports = DataFile;

}).call(this,require("buffer").Buffer)
},{"./wordnet_file":125,"buffer":10,"fs":9,"util":140}],123:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var WordNetFile = require('./wordnet_file'),
  fs = require('fs'),
  util = require('util');

function getFileSize(path) {
  var stat = fs.statSync(path);
  return stat.size;
}

function findPrevEOL(fd, pos, callback) {
  var buff = new Buffer(1024);
  if(pos == 0)
    callback(0);
  else {
    fs.read(fd, buff, 0, 1, pos, function(err, count) {
      if(buff[0] == 10)
        callback(pos + 1);
      else
        findPrevEOL(fd, pos - 1, callback);
    });
  }
}

function readLine(fd, pos, callback) {
  var buff = new Buffer(1024);
  findPrevEOL(fd, pos, function(pos) {
    WordNetFile.appendLineChar(fd, pos, 0, buff, callback);
  });
}

function miss(callback) {
  callback({status: 'miss'});
}

function findAt(fd, size, pos, lastPos, adjustment, searchKey, callback, lastKey) {
  if (lastPos == pos || pos >= size) {
    miss(callback);
  } else {
    readLine(fd, pos, function(line) {
      var tokens = line.split(/\s+/);
      var key = tokens[0];

    if(key == searchKey) {
        callback({status: 'hit', key: key, 'line': line, tokens: tokens});
      } else if(adjustment == 1 || key == lastKey)  {
        miss(callback);
      } else {
        adjustment = Math.ceil(adjustment * 0.5);

        if (key < searchKey) {
          findAt(fd, size, pos + adjustment, pos, adjustment, searchKey, callback, key);
        } else {
          findAt(fd, size, pos - adjustment, pos, adjustment, searchKey, callback, key);
        }
      }
    });
  }
}

function find(searchKey, callback) {
  var indexFile = this;

  indexFile.open(function(err, fd, done) {
    if(err) {
      console.log(err);
    } else {
      var size = getFileSize(indexFile.filePath) - 1;
      var pos = Math.ceil(size / 2);
      findAt(fd, size, pos, null, pos, searchKey,
        function(result) { callback(result); done(); });
    }
  });
}

function lookupFromFile(word, callback) {
  this.find(word, function(record) {
    var indexRecord = null;

    if(record.status == 'hit') {
      var ptrs = [], offsets = [];

      for(var i = 0; i < parseInt(record.tokens[3]); i++)
        ptrs.push(record.tokens[i]);

      for(var i = 0; i < parseInt(record.tokens[2]); i++)
        offsets.push(parseInt(record.tokens[ptrs.length + 6 + i], 10));

      indexRecord = {
        lemma: record.tokens[0],
        pos: record.tokens[1],
        ptrSymbol: ptrs,
        senseCnt:  parseInt(record.tokens[ptrs.length + 4], 10),
        tagsenseCnt:  parseInt(record.tokens[ptrs.length + 5], 10),
        synsetOffset:  offsets
      };
    }

    callback(indexRecord);
  });
}

function lookup(word, callback) {
  this.lookupFromFile(word, callback);
}

var IndexFile = function(dataDir, name) {
  WordNetFile.call(this, dataDir, 'index.' + name);
};

util.inherits(IndexFile, WordNetFile);

IndexFile.prototype.lookupFromFile = lookupFromFile;
IndexFile.prototype.lookup = lookup;
IndexFile.prototype.find = find;

IndexFile.prototype._findAt = findAt;

module.exports = IndexFile;

}).call(this,require("buffer").Buffer)
},{"./wordnet_file":125,"buffer":10,"fs":9,"util":140}],124:[function(require,module,exports){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var IndexFile = require('./index_file'),
  DataFile = require('./data_file');

function pushResults(data, results, offsets, callback) {
  var wordnet = this;

  if(offsets.length == 0) {
    callback(results);
  } else {
    data.get(offsets.pop(), function(record) {
      results.push(record);
      wordnet.pushResults(data, results, offsets, callback);
    });
  }
}

function lookupFromFiles(files, results, word, callback) {
  var wordnet = this;

  if(files.length == 0)
    callback(results);
  else {
    var file = files.pop();

    file.index.lookup(word, function(record) {
      if(record) {
        wordnet.pushResults(file.data, results, record.synsetOffset, function() {
          wordnet.lookupFromFiles(files, results, word, callback);
        });
      } else {
        wordnet.lookupFromFiles(files, results, word, callback);
      }
    });
  }
}

function lookup(word, callback) {
  word = word.toLowerCase().replace(/\s+/g, '_');

  this.lookupFromFiles([
    {index: this.nounIndex, data: this.nounData},
    {index: this.verbIndex, data: this.verbData},
    {index: this.adjIndex, data: this.adjData},
    {index: this.advIndex, data: this.advData},
  ], [], word, callback);
}

function get(synsetOffset, pos, callback) {
  var dataFile = this.getDataFile(pos);
  var wordnet = this;

  dataFile.get(synsetOffset, function(result) {
    callback(result);
  });
}

function getDataFile(pos) {
    switch(pos) {
      case 'n':
        return this.nounData;
      case 'v':
        return this.verbData;
      case 'a': case 's':
        return this.adjData;
      case 'r':
        return this.advData;
    }
}

function loadSynonyms(synonyms, results, ptrs, callback) {
  var wordnet = this;

  if(ptrs.length > 0) {
    var ptr = ptrs.pop();

    this.get(ptr.synsetOffset, ptr.pos, function(result) {
      synonyms.push(result);
      wordnet.loadSynonyms(synonyms, results, ptrs, callback);
    });
  } else {
    wordnet.loadResultSynonyms(synonyms, results, callback);
  }
}

function loadResultSynonyms(synonyms, results, callback) {
  var wordnet = this;

  if(results.length > 0) {
    var result = results.pop();
    wordnet.loadSynonyms(synonyms, results, result.ptrs, callback);
  } else
    callback(synonyms);
}

function lookupSynonyms(word, callback) {
  var wordnet = this;

  wordnet.lookup(word, function(results) {
    wordnet.loadResultSynonyms([], results, callback);
  });
}

function getSynonyms() {
  var wordnet = this;
  var callback = arguments[2] ? arguments[2] : arguments[1];
  var pos = arguments[0].pos ? arguments[0].pos : arguments[1];
  var synsetOffset = arguments[0].synsetOffset ? arguments[0].synsetOffset : arguments[0];

  this.get(synsetOffset, pos, function(result) {
    wordnet.loadSynonyms([], [], result.ptrs, callback);
  });
}

function WordNet(dataDir) {

  if (!dataDir) {
    try {
      var WNdb = require('wordnet-db');
    } catch(e) {
      console.error("Please 'npm install wordnet-db' before using WordNet module or specify a dict directory.");
      throw e;
    }
    dataDir = WNdb.path;
  }

  this.nounIndex = new IndexFile(dataDir, 'noun');
  this.verbIndex = new IndexFile(dataDir, 'verb');
  this.adjIndex = new IndexFile(dataDir, 'adj');
  this.advIndex = new IndexFile(dataDir, 'adv');

  this.nounData = new DataFile(dataDir, 'noun');
  this.verbData = new DataFile(dataDir, 'verb');
  this.adjData = new DataFile(dataDir, 'adj');
  this.advData = new DataFile(dataDir, 'adv');

  this.get = get;
  this.lookup = lookup;
  this.lookupFromFiles = lookupFromFiles;
  this.pushResults = pushResults;
  this.loadResultSynonyms = loadResultSynonyms;
  this.loadSynonyms = loadSynonyms;
  this.lookupSynonyms = lookupSynonyms;
  this.getSynonyms = getSynonyms;
  this.getDataFile = getDataFile;
}

module.exports = WordNet;

},{"./data_file":122,"./index_file":123,"wordnet-db":141}],125:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var  fs = require('fs'),
  path = require('path'),
  util = require('util');


function appendLineChar(fd, pos, buffPos, buff, callback) {
  if(buffPos >= buff.length) {
    var newBuff = new Buffer(buff.length * 2);
    buff.copy(newBuff, 0, 0, buff.length);
    buff = newBuff;
  }

  fs.read(fd, buff, buffPos, 1, pos, function(err, count) {
    if(err)
      console.log(err);
    else {
      if(buff[buffPos] == 10 || buffPos == buff.length)
        callback(buff.slice(0, buffPos).toString('UTF-8'));
      else {
        appendLineChar(fd, pos + 1, buffPos + 1, buff, callback);
      }
    }
  });
}

function open(callback) {
  var filePath = this.filePath;

  fs.open(filePath, 'r', null, function(err, fd) {
    if (err) {
        console.log('Unable to open %s', filePath);
        return;
    }
    callback(err, fd, function() {fs.close(fd)});
  });
}

var WordNetFile = function(dataDir, fileName) {
  this.dataDir = dataDir;
  this.fileName = fileName;
  this.filePath = require('path').join(this.dataDir, this.fileName);
};

WordNetFile.prototype.open = open;
WordNetFile.appendLineChar = appendLineChar;

module.exports = WordNetFile;

}).call(this,require("buffer").Buffer)
},{"buffer":10,"fs":9,"path":126,"util":140}],126:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":127}],127:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],128:[function(require,module,exports){
(function (Buffer){

/**
 * An interface for modeling and instantiating C-style data structures. This is
 * not a constructor per-say, but a constructor generator. It takes an array of
 * tuples, the left side being the type, and the right side being a field name.
 * The order should be the same order it would appear in the C-style struct
 * definition. It returns a function that can be used to construct an object that
 * reads and writes to the data structure using properties specified by the
 * initial field list.
 *
 * The only verboten field names are "ref", which is used used on struct
 * instances as a function to retrieve the backing Buffer instance of the
 * struct, and "ref.buffer" which contains the backing Buffer instance.
 *
 *
 * Example:
 *
 * ``` javascript
 * var ref = require('ref')
 * var Struct = require('ref-struct')
 *
 * // create the `char *` type
 * var charPtr = ref.refType(ref.types.char)
 * var int = ref.types.int
 *
 * // create the struct "type" / constructor
 * var PasswordEntry = Struct({
 *     'username': 'string'
 *   , 'password': 'string'
 *   , 'salt':     int
 * })
 *
 * // create an instance of the struct, backed a Buffer instance
 * var pwd = new PasswordEntry()
 * pwd.username = 'ricky'
 * pwd.password = 'rbransonlovesnode.js'
 * pwd.salt = (Math.random() * 1000000) | 0
 *
 * pwd.username // → 'ricky'
 * pwd.password // → 'rbransonlovesnode.js'
 * pwd.salt     // → 820088
 * ```
 */

/**
 * Module dependencies.
 */

var ref = require('ref')
var util = require('util')
var assert = require('assert')
var debug = require('debug')('ref:struct')

/**
 * Module exports.
 */

module.exports = Struct

/**
 * The Struct "type" meta-constructor.
 */

function Struct () {
  debug('defining new struct "type"')

  /**
   * This is the "constructor" of the Struct type that gets returned.
   *
   * Invoke it with `new` to create a new Buffer instance backing the struct.
   * Pass it an existing Buffer instance to use that as the backing buffer.
   * Pass in an Object containing the struct fields to auto-populate the
   * struct with the data.
   */

  function StructType (arg, data) {
    if (!(this instanceof StructType)) {
      return new StructType(arg, data)
    }
    debug('creating new struct instance')
    var store
    if (Buffer.isBuffer(arg)) {
      debug('using passed-in Buffer instance to back the struct', arg)
      assert(arg.length >= StructType.size, 'Buffer instance must be at least ' +
          StructType.size + ' bytes to back this struct type')
      store = arg
      arg = data
    } else {
      debug('creating new Buffer instance to back the struct (size: %d)', StructType.size)
      store = new Buffer(StructType.size)
    }

    // set the backing Buffer store
    store.type = StructType
    this['ref.buffer'] = store

    if (arg) {
      for (var key in arg) {
        // hopefully hit the struct setters
        this[key] = arg[key]
      }
    }
    StructType._instanceCreated = true
  }

  // make instances inherit from the `proto`
  StructType.prototype = Object.create(proto, {
    constructor: {
        value: StructType
      , enumerable: false
      , writable: true
      , configurable: true
    }
  })

  StructType.defineProperty = defineProperty
  StructType.toString = toString
  StructType.fields = {}

  var opt = (arguments.length > 0 && arguments[1]) ? arguments[1] : {};
  // Setup the ref "type" interface. The constructor doubles as the "type" object
  StructType.size = 0
  StructType.alignment = 0
  StructType.indirection = 1
  StructType.isPacked = opt.packed ? Boolean(opt.packed) : false
  StructType.get = get
  StructType.set = set

  // Read the fields list and apply all the fields to the struct
  // TODO: Better arg handling... (maybe look at ES6 binary data API?)
  var arg = arguments[0]
  if (Array.isArray(arg)) {
    // legacy API
    arg.forEach(function (a) {
      var type = a[0]
      var name = a[1]
      StructType.defineProperty(name, type)
    })
  } else if (typeof arg === 'object') {
    Object.keys(arg).forEach(function (name) {
      var type = arg[name]
      StructType.defineProperty(name, type)
    })
  }

  return StructType
}

/**
 * The "get" function of the Struct "type" interface
 */

function get (buffer, offset) {
  debug('Struct "type" getter for buffer at offset', buffer, offset)
  if (offset > 0) {
    buffer = buffer.slice(offset)
  }
  return new this(buffer)
}

/**
 * The "set" function of the Struct "type" interface
 */

function set (buffer, offset, value) {
  debug('Struct "type" setter for buffer at offset', buffer, offset, value)
  var isStruct = value instanceof this
  if (isStruct) {
    // optimization: copy the buffer contents directly rather
    // than going through the ref-struct constructor
    value['ref.buffer'].copy(buffer, offset, 0, this.size)
  } else {
    if (offset > 0) {
      buffer = buffer.slice(offset)
    }
    new this(buffer, value)
  }
}

/**
 * Custom `toString()` override for struct type instances.
 */

function toString () {
  return '[StructType]'
}

/**
 * Adds a new field to the struct instance with the given name and type.
 * Note that this function will throw an Error if any instances of the struct
 * type have already been created, therefore this function must be called at the
 * beginning, before any instances are created.
 */

function defineProperty (name, type) {
  debug('defining new struct type field', name)

  // allow string types for convenience
  type = ref.coerceType(type)

  assert(!this._instanceCreated, 'an instance of this Struct type has already ' +
      'been created, cannot add new "fields" anymore')
  assert.equal('string', typeof name, 'expected a "string" field name')
  assert(type && /object|function/i.test(typeof type) && 'size' in type &&
      'indirection' in type
      , 'expected a "type" object describing the field type: "' + type + '"')
  assert(type.indirection > 1 || type.size > 0,
      '"type" object must have a size greater than 0')
  assert(!(name in this.prototype), 'the field "' + name +
      '" already exists in this Struct type')

  var field = {
    type: type
  }
  this.fields[name] = field

  // define the getter/setter property
  var desc = { enumerable: true , configurable: true }
  desc.get = function () {
    debug('getting "%s" struct field (offset: %d)', name, field.offset)
    return ref.get(this['ref.buffer'], field.offset, type)
  }
  desc.set = function (value) {
    debug('setting "%s" struct field (offset: %d)', name, field.offset, value)
    return ref.set(this['ref.buffer'], field.offset, value, type)
  }

  // calculate the new size and field offsets
  recalc(this)

  Object.defineProperty(this.prototype, name, desc)
}

function recalc (struct) {

  // reset size and alignment
  struct.size = 0
  struct.alignment = 0

  var fieldNames = Object.keys(struct.fields)

  // first loop through is to determine the `alignment` of this struct
  fieldNames.forEach(function (name) {
    var field = struct.fields[name]
    var type = field.type
    var alignment = type.alignment || ref.alignof.pointer
    if (type.indirection > 1) {
      alignment = ref.alignof.pointer
    }
    if (struct.isPacked) {
      struct.alignment = Math.min(struct.alignment || alignment, alignment)
    } else {
      struct.alignment = Math.max(struct.alignment, alignment)
    }
  })

  // second loop through sets the `offset` property on each "field"
  // object, and sets the `struct.size` as we go along
  fieldNames.forEach(function (name) {
    var field = struct.fields[name]
    var type = field.type

    if (null != type.fixedLength) {
      // "ref-array" types set the "fixedLength" prop. don't treat arrays like one
      // contiguous entity. instead, treat them like individual elements in the
      // struct. doing this makes the padding end up being calculated correctly.
      field.offset = addType(type.type)
      for (var i = 1; i < type.fixedLength; i++) {
        addType(type.type)
      }
    } else {
      field.offset = addType(type)
    }
  })

  function addType (type) {
    var offset = struct.size
    var align = type.indirection === 1 ? type.alignment : ref.alignof.pointer
    var padding = struct.isPacked ? 0 : (align - (offset % align)) % align
    var size = type.indirection === 1 ? type.size : ref.sizeof.pointer

    offset += padding

    if (!struct.isPacked) {
      assert.equal(offset % align, 0, "offset should align")
    }

    // adjust the "size" of the struct type
    struct.size = offset + size

    // return the calulated offset
    return offset
  }

  // any final padding?
  var left = struct.size % struct.alignment
  if (left > 0) {
    debug('additional padding to the end of struct:', struct.alignment - left)
    struct.size += struct.alignment - left
  }
}

/**
 * this is the custom prototype of Struct type instances.
 */

var proto = {}

/**
 * set a placeholder variable on the prototype so that defineProperty() will
 * throw an error if you try to define a struct field with the name "buffer".
 */

proto['ref.buffer'] = ref.NULL

/**
 * Flattens the Struct instance into a regular JavaScript Object. This function
 * "gets" all the defined properties.
 *
 * @api public
 */

proto.toObject = function toObject () {
  var obj = {}
  Object.keys(this.constructor.fields).forEach(function (k) {
    obj[k] = this[k]
  }, this)
  return obj
}

/**
 * Basic `JSON.stringify(struct)` support.
 */

proto.toJSON = function toJSON () {
  return this.toObject()
}

/**
 * `.inspect()` override. For the REPL.
 *
 * @api public
 */

proto.inspect = function inspect () {
  var obj = this.toObject()
  // add instance's "own properties"
  Object.keys(this).forEach(function (k) {
    obj[k] = this[k]
  }, this)
  return util.inspect(obj)
}

/**
 * returns a Buffer pointing to this struct data structure.
 */

proto.ref = function ref () {
  return this['ref.buffer']
}

}).call(this,require("buffer").Buffer)
},{"assert":6,"buffer":10,"debug":11,"ref":129,"util":140}],129:[function(require,module,exports){
(function (Buffer){

var assert = require('assert')
var debug = require('debug')('ref')

exports = module.exports = require('bindings')('binding')

/**
 * A `Buffer` that references the C NULL pointer. That is, its memory address
 * points to 0. Its `length` is 0 because accessing any data from this buffer
 * would cause a _segmentation fault_.
 *
 * ```
 * console.log(ref.NULL);
 * <SlowBuffer@0x0 >
 * ```
 *
 * @name NULL
 * @type Buffer
 */

/**
 * A string that represents the native endianness of the machine's processor.
 * The possible values are either `"LE"` or `"BE"`.
 *
 * ```
 * console.log(ref.endianness);
 * 'LE'
 * ```
 *
 * @name endianness
 * @type String
 */

/**
 * Accepts a `Buffer` instance and returns the memory address of the buffer
 * instance.
 *
 * ```
 * console.log(ref.address(new Buffer(1)));
 * 4320233616
 *
 * console.log(ref.address(ref.NULL)));
 * 0
 * ```
 *
 * @param {Buffer} buffer The buffer to get the memory address of.
 * @return {Number} The memory address the buffer instance.
 * @name address
 * @type method
 */

/**
 * Accepts a `Buffer` instance and returns _true_ if the buffer represents the
 * NULL pointer, _false_ otherwise.
 *
 * ```
 * console.log(ref.isNull(new Buffer(1)));
 * false
 *
 * console.log(ref.isNull(ref.NULL));
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to check for NULL.
 * @return {Boolean} true or false.
 * @name isNull
 * @type method
 */

/**
 * Reads a JavaScript Object that has previously been written to the given
 * _buffer_ at the given _offset_.
 *
 * ```
 * var obj = { foo: 'bar' };
 * var buf = ref.alloc('Object', obj);
 *
 * var obj2 = ref.readObject(buf, 0);
 * console.log(obj === obj2);
 * true
 * ```
 *
 * @param {Buffer} buffer The buffer to read an Object from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Object} The Object that was read from _buffer_.
 * @name readObject
 * @type method
 */

/**
 * Reads a Buffer instance from the given _buffer_ at the given _offset_.
 * The _size_ parameter specifies the `length` of the returned Buffer instance,
 * which defaults to __0__.
 *
 * ```
 * var buf = new Buffer('hello world');
 * var pointer = ref.alloc('pointer');
 *
 * var buf2 = ref.readPointer(pointer, 0, buf.length);
 * console.log(buf.toString());
 * 'hello world'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @param {Number} length (optional) The length of the returned Buffer. Defaults to 0.
 * @return {Buffer} The Buffer instance that was read from _buffer_.
 * @name readPointer
 * @type method
 */

/**
 * Returns a JavaScript String read from _buffer_ at the given _offset_. The
 * C String is read until the first NULL byte, which indicates the end of the
 * String.
 *
 * This function can read beyond the `length` of a Buffer.
 *
 * ```
 * var buf = new Buffer('hello\0world\0');
 *
 * var str = ref.readCString(buf, 0);
 * console.log(str);
 * 'hello'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {String} The String that was read from _buffer_.
 * @name readCString
 * @type method
 */

/**
 * Returns a big-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64BE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64BE
 * @type method
 */

/**
 * Returns a little-endian signed 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 *
 * var val = ref.readInt64LE(buf, 0)
 * console.log(val)
 * '9223372036854775807'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readInt64LE
 * @type method
 */

/**
 * Returns a big-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64BE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64BE
 * @type method
 */

/**
 * Returns a little-endian unsigned 64-bit int read from _buffer_ at the given
 * _offset_.
 *
 * If the returned value will fit inside a JavaScript Number without losing
 * precision, then a Number is returned, otherwise a String is returned.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 *
 * var val = ref.readUInt64LE(buf, 0)
 * console.log(val)
 * '18446744073709551615'
 * ```
 *
 * @param {Buffer} buffer The buffer to read a Buffer from.
 * @param {Number} offset The offset to begin reading from.
 * @return {Number|String} The Number or String that was read from _buffer_.
 * @name readUInt64LE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a big-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64BE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64BE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a little-endian signed 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('int64');
 * ref.writeInt64LE(buf, 0, '9223372036854775807');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeInt64LE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a big-endian unsigned 64-bit int into
 * _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64BE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64BE
 * @type method
 */

/**
 * Writes the _input_ Number or String as a little-endian unsigned 64-bit int
 * into _buffer_ at the given _offset_.
 *
 * ```
 * var buf = ref.alloc('uint64');
 * ref.writeUInt64LE(buf, 0, '18446744073709551615');
 * ```
 *
 * @param {Buffer} buffer The buffer to write to.
 * @param {Number} offset The offset to begin writing from.
 * @param {Number|String} input This String or Number which gets written.
 * @name writeUInt64LE
 * @type method
 */

/**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level incremented by **1**.
 *
 * Say you wanted to create a type representing a `void *`:
 *
 * ```
 * var voidPtrType = ref.refType(ref.types.void);
 * ```
 *
 * @param {Object|String} type The "type" object to create a reference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` incremented by 1.
 */

exports.refType = function refType (type) {
  var _type = exports.coerceType(type)
  var rtn = Object.create(_type)
  rtn.indirection++
  if (_type.name) {
    Object.defineProperty(rtn, 'name', {
      value: _type.name + '*',
      configurable: true,
      enumerable: true,
      writable: true
    })
  }
  return rtn
}

/**
 * Returns a new clone of the given "type" object, with its
 * `indirection` level decremented by 1.
 *
 * @param {Object|String} type The "type" object to create a dereference type from. Strings get coerced first.
 * @return {Object} The new "type" object with its `indirection` decremented by 1.
 */

exports.derefType = function derefType (type) {
  var _type = exports.coerceType(type)
  if (_type.indirection === 1) {
    throw new Error('Cannot create deref\'d type for type with indirection 1')
  }
  var rtn = Object.getPrototypeOf(_type)
  if (rtn.indirection !== _type.indirection - 1) {
    // slow case
    rtn = Object.create(_type)
    rtn.indirection--
  }
  return rtn
}

/**
 * Coerces a "type" object from a String or an actual "type" object. String values
 * are looked up from the `ref.types` Object. So:
 *
 *   * `"int"` gets coerced into `ref.types.int`.
 *   * `"int *"` gets translated into `ref.refType(ref.types.int)`
 *   * `ref.types.int` gets translated into `ref.types.int` (returns itself)
 *
 * Throws an Error if no valid "type" object could be determined. Most `ref`
 * functions use this function under the hood, so anywhere a "type" object is
 * expected, a String may be passed as well, including simply setting the
 * `buffer.type` property.
 *
 * ```
 * var type = ref.coerceType('int **');
 *
 * console.log(type.indirection);
 * 3
 * ```
 *
 * @param {Object|String} type The "type" Object or String to coerce.
 * @return {Object} A "type" object
 */

exports.coerceType = function coerceType (type) {
  var rtn = type
  if (typeof rtn === 'string') {
    rtn = exports.types[type]
    if (rtn) return rtn

    // strip whitespace
    rtn = type.replace(/\s+/g, '').toLowerCase()
    if (rtn === 'pointer') {
      // legacy "pointer" being used :(
      rtn = exports.refType(exports.types.void) // void *
    } else if (rtn === 'string') {
      rtn = exports.types.CString // special char * type
    } else {
      var refCount = 0
      rtn = rtn.replace(/\*/g, function () {
        refCount++
        return ''
      })
      // allow string names to be passed in
      rtn = exports.types[rtn]
      if (refCount > 0) {
        if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
          throw new TypeError('could not determine a proper "type" from: ' + JSON.stringify(type))
        }
        for (var i = 0; i < refCount; i++) {
          rtn = exports.refType(rtn)
        }
      }
    }
  }
  if (!(rtn && 'size' in rtn && 'indirection' in rtn)) {
    throw new TypeError('could not determine a proper "type" from: ' + JSON.stringify(type))
  }
  return rtn
}

/**
 * Returns the "type" property of the given Buffer.
 * Creates a default type for the buffer when none exists.
 *
 * @param {Buffer} buffer The Buffer instance to get the "type" object from.
 * @return {Object} The "type" object from the given Buffer.
 */

exports.getType = function getType (buffer) {
  if (!buffer.type) {
    debug('WARN: no "type" found on buffer, setting default "type"', buffer)
    buffer.type = {}
    buffer.type.size = buffer.length
    buffer.type.indirection = 1
    buffer.type.get = function get () {
      throw new Error('unknown "type"; cannot get()')
    }
    buffer.type.set = function set () {
      throw new Error('unknown "type"; cannot set()')
    }
  }
  return exports.coerceType(buffer.type)
}

/**
 * Calls the `get()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level and returning a
 * proper "dereferenced" Bufffer instance when necessary.
 *
 * @param {Buffer} buffer The Buffer instance to read from.
 * @param {Number} offset (optional) The offset on the Buffer to start reading from. Defaults to 0.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 * @return {?} Whatever value the "type" used when reading returns.
 */

exports.get = function get (buffer, offset, type) {
  if (!offset) {
    offset = 0
  }
  if (type) {
    type = exports.coerceType(type)
  } else {
    type = exports.getType(buffer)
  }
  debug('get(): (offset: %d)', offset, buffer)
  assert(type.indirection > 0, '"indirection" level must be at least 1')
  if (type.indirection === 1) {
    // need to check "type"
    return type.get(buffer, offset)
  } else {
    // need to create a deref'd Buffer
    var size = type.indirection === 2 ? type.size : exports.sizeof.pointer
    var reference = exports.readPointer(buffer, offset, size)
    reference.type = exports.derefType(type)
    return reference
  }
}

/**
 * Calls the `set()` function of the Buffer's current "type" (or the
 * passed in _type_ if present) at the given _offset_.
 *
 * This function handles checking the "indirection" level writing a pointer rather
 * than calling the `set()` function if the indirection is greater than 1.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset on the Buffer to start writing to.
 * @param {?} value The value to write to the Buffer instance.
 * @param {Object|String} type (optional) The "type" object to use when reading. Defaults to calling `getType()` on the buffer.
 */

exports.set = function set (buffer, offset, value, type) {
  if (!offset) {
    offset = 0
  }
  if (type) {
    type = exports.coerceType(type)
  } else {
    type = exports.getType(buffer)
  }
  debug('set(): (offset: %d)', offset, buffer, value)
  assert(type.indirection >= 1, '"indirection" level must be at least 1')
  if (type.indirection === 1) {
    type.set(buffer, offset, value)
  } else {
    exports.writePointer(buffer, offset, value)
  }
}


/**
 * Returns a new Buffer instance big enough to hold `type`,
 * with the given `value` written to it.
 *
 * ``` js
 * var intBuf = ref.alloc(ref.types.int)
 * var int_with_4 = ref.alloc(ref.types.int, 4)
 * ```
 *
 * @param {Object|String} type The "type" object to allocate. Strings get coerced first.
 * @param {?} value (optional) The initial value set on the returned Buffer, using _type_'s `set()` function.
 * @return {Buffer} A new Buffer instance with it's `type` set to "type", and (optionally) "value" written to it.
 */

exports.alloc = function alloc (_type, value) {
  var type = exports.coerceType(_type)
  debug('allocating Buffer for type with "size"', type.size)
  var size
  if (type.indirection === 1) {
    size = type.size
  } else {
    size = exports.sizeof.pointer
  }
  var buffer = new Buffer(size)
  buffer.type = type
  if (arguments.length >= 2) {
    debug('setting value on allocated buffer', value)
    exports.set(buffer, 0, value, type)
  }
  return buffer
}

/**
 * Returns a new `Buffer` instance with the given String written to it with the
 * given encoding (defaults to __'utf8'__). The buffer is 1 byte longer than the
 * string itself, and is NUL terminated.
 *
 * ```
 * var buf = ref.allocCString('hello world');
 *
 * console.log(buf.toString());
 * 'hello world\u0000'
 * ```
 *
 * @param {String} string The JavaScript string to be converted to a C string.
 * @param {String} encoding (optional) The encoding to use for the C string. Defaults to __'utf8'__.
 * @return {Buffer} The new `Buffer` instance with the specified String wrtten to it, and a trailing NUL byte.
 */

exports.allocCString = function allocCString (string, encoding) {
  if (null == string || (Buffer.isBuffer(string) && exports.isNull(string))) {
    return exports.NULL
  }
  var size = Buffer.byteLength(string, encoding) + 1
  var buffer = new Buffer(size)
  exports.writeCString(buffer, 0, string, encoding)
  buffer.type = charPtrType
  return buffer
}

/**
 * Writes the given string as a C String (NULL terminated) to the given buffer
 * at the given offset. "encoding" is optional and defaults to __'utf8'__.
 *
 * Unlike `readCString()`, this function requires the buffer to actually have the
 * proper length.
 *
 * @param {Buffer} buffer The Buffer instance to write to.
 * @param {Number} offset The offset of the buffer to begin writing at.
 * @param {String} string The JavaScript String to write that will be written to the buffer.
 * @param {String} encoding (optional) The encoding to read the C string as. Defaults to __'utf8'__.
 */

exports.writeCString = function writeCString (buffer, offset, string, encoding) {
  assert(Buffer.isBuffer(buffer), 'expected a Buffer as the first argument')
  assert.equal('string', typeof string, 'expected a "string" as the third argument')
  if (!offset) {
    offset = 0
  }
  if (!encoding) {
    encoding = 'utf8'
  }
  var size = buffer.length - offset
  var len = buffer.write(string, offset, size, encoding)
  buffer.writeUInt8(0, offset + len)  // NUL terminate
}

exports['readInt64' + exports.endianness] = exports.readInt64
exports['readUInt64' + exports.endianness] = exports.readUInt64
exports['writeInt64' + exports.endianness] = exports.writeInt64
exports['writeUInt64' + exports.endianness] = exports.writeUInt64

var opposite = exports.endianness == 'LE' ? 'BE' : 'LE'
var int64temp = new Buffer(exports.sizeof.int64)
var uint64temp = new Buffer(exports.sizeof.uint64)

exports['readInt64' + opposite] = function (buffer, offset) {
  for (var i = 0; i < exports.sizeof.int64; i++) {
    int64temp[i] = buffer[offset + exports.sizeof.int64 - i - 1]
  }
  return exports.readInt64(int64temp, 0)
}
exports['readUInt64' + opposite] = function (buffer, offset) {
  for (var i = 0; i < exports.sizeof.uint64; i++) {
    uint64temp[i] = buffer[offset + exports.sizeof.uint64 - i - 1]
  }
  return exports.readUInt64(uint64temp, 0)
}
exports['writeInt64' + opposite] = function (buffer, offset, value) {
  exports.writeInt64(int64temp, 0, value)
  for (var i = 0; i < exports.sizeof.int64; i++) {
    buffer[offset + i] = int64temp[exports.sizeof.int64 - i - 1]
  }
}
exports['writeUInt64' + opposite] = function (buffer, offset, value) {
  exports.writeUInt64(uint64temp, 0, value)
  for (var i = 0; i < exports.sizeof.uint64; i++) {
    buffer[offset + i] = uint64temp[exports.sizeof.uint64 - i - 1]
  }
}

/**
 * `ref()` accepts a Buffer instance and returns a new Buffer
 * instance that is "pointer" sized and has its data pointing to the given
 * Buffer instance. Essentially the created Buffer is a "reference" to the
 * original pointer, equivalent to the following C code:
 *
 * ``` c
 * char *buf = buffer;
 * char **ref = &buf;
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to create a reference to.
 * @return {Buffer} A new Buffer instance pointing to _buffer_.
 */

exports.ref = function ref (buffer) {
  debug('creating a reference to buffer', buffer)
  var type = exports.refType(exports.getType(buffer))
  return exports.alloc(type, buffer)
}

/**
 * Accepts a Buffer instance and attempts to "dereference" it.
 * That is, first it checks the `indirection` count of _buffer_'s "type", and if
 * it's greater than __1__ then it merely returns another Buffer, but with one
 * level less `indirection`.
 *
 * When _buffer_'s indirection is at __1__, then it checks for `buffer.type`
 * which should be an Object with its own `get()` function.
 *
 * ```
 * var buf = ref.alloc('int', 6);
 *
 * var val = ref.deref(buf);
 * console.log(val);
 * 6
 * ```
 *
 *
 * @param {Buffer} buffer A Buffer instance to dereference.
 * @return {?} The returned value after dereferencing _buffer_.
 */

exports.deref = function deref (buffer) {
  debug('dereferencing buffer', buffer)
  return exports.get(buffer)
}

/**
 * Attaches _object_ to _buffer_ such that it prevents _object_ from being garbage
 * collected until _buffer_ does.
 *
 * @param {Buffer} buffer A Buffer instance to attach _object_ to.
 * @param {Object|Buffer} object An Object or Buffer to prevent from being garbage collected until _buffer_ does.
 * @api private
 */

exports._attach = function _attach (buf, obj) {
  if (!buf._refs) {
    buf._refs = []
  }
  buf._refs.push(obj)
}

/**
 * Same as `ref.writeObject()`, except that this version does not _attach_ the
 * Object to the Buffer, which is potentially unsafe if the garbage collector
 * runs.
 *
 * @param {Buffer} buffer A Buffer instance to write _object_ to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Object} object The Object to be written into _buffer_.
 * @api private
 */

exports._writeObject = exports.writeObject

/**
 * Writes a pointer to _object_ into _buffer_ at the specified _offset.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var buf = ref.alloc('Object');
 * ref.writeObject(buf, 0, { foo: 'bar' });
 *
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _object_ to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Object} object The Object to be written into _buffer_.
 */

exports.writeObject = function writeObject (buf, offset, obj, persistent) {
  debug('writing Object to buffer', buf, offset, obj, persistent)
  exports._writeObject(buf, offset, obj, persistent)
  exports._attach(buf, obj)
}

/**
 * Same as `ref.writePointer()`, except that this version does not attach
 * _pointer_ to _buffer_, which is potentially unsafe if the garbage collector
 * runs.
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 * @api private
 */

exports._writePointer = exports.writePointer

/**
 * Writes the memory address of _pointer_ to _buffer_ at the specified _offset_.
 *
 * This function "attaches" _object_ to _buffer_ to prevent it from being garbage
 * collected.
 *
 * ```
 * var someBuffer = new Buffer('whatever');
 * var buf = ref.alloc('pointer');
 * ref.writePointer(buf, 0, someBuffer);
 * ```
 *
 * @param {Buffer} buffer A Buffer instance to write _pointer to.
 * @param {Number} offset The offset on the Buffer to start writing at.
 * @param {Buffer} pointer The Buffer instance whose memory address will be written to _buffer_.
 */

exports.writePointer = function writePointer (buf, offset, ptr) {
  debug('writing pointer to buffer', buf, offset, ptr)
  exports._writePointer(buf, offset, ptr)
  exports._attach(buf, ptr)
}

/**
 * Same as `ref.reinterpret()`, except that this version does not attach
 * _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 * @api private
 */

exports._reinterpret = exports.reinterpret

/**
 * Returns a new Buffer instance with the specified _size_, with the same memory
 * address as _buffer_.
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The `length` property of the returned Buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and the requested _size_.
 */

exports.reinterpret = function reinterpret (buffer, size, offset) {
  debug('reinterpreting buffer to "%d" bytes', size)
  var rtn = exports._reinterpret(buffer, size, offset || 0)
  exports._attach(rtn, buffer)
  return rtn
}

/**
 * Same as `ref.reinterpretUntilZeros()`, except that this version does not
 * attach _buffer_ to the returned Buffer, which is potentially unsafe if the
 * garbage collector runs.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes that are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 * @api private
 */

exports._reinterpretUntilZeros = exports.reinterpretUntilZeros

/**
 * Accepts a `Buffer` instance and a number of `NULL` bytes to read from the
 * pointer. This function will scan past the boundary of the Buffer's `length`
 * until it finds `size` number of aligned `NULL` bytes.
 *
 * This is useful for finding the end of NUL-termintated array or C string. For
 * example, the `readCString()` function _could_ be implemented like:
 *
 * ```
 * function readCString (buf) {
 *   return ref.reinterpretUntilZeros(buf, 1).toString('utf8')
 * }
 * ```
 *
 * This function "attaches" _buffer_ to the returned Buffer to prevent it from
 * being garbage collected.
 *
 * @param {Buffer} buffer A Buffer instance to base the returned Buffer off of.
 * @param {Number} size The number of sequential, aligned `NULL` bytes are required to terminate the buffer.
 * @param {Number} offset The offset of the Buffer to begin from.
 * @return {Buffer} A new Buffer instance with the same memory address as _buffer_, and a variable `length` that is terminated by _size_ NUL bytes.
 */

exports.reinterpretUntilZeros = function reinterpretUntilZeros (buffer, size, offset) {
  debug('reinterpreting buffer to until "%d" NULL (0) bytes are found', size)
  var rtn = exports._reinterpretUntilZeros(buffer, size, offset || 0)
  exports._attach(rtn, buffer)
  return rtn
}


// the built-in "types"
var types = exports.types = {}

/**
 * The `void` type.
 *
 * @section types
 */

types.void = {
    size: 0
  , indirection: 1
  , get: function get (buf, offset) {
      debug('getting `void` type (returns `null`)')
      return null
    }
  , set: function set (buf, offset, val) {
      debug('setting `void` type (no-op)')
    }
}

/**
 * The `int8` type.
 */

types.int8 = {
    size: exports.sizeof.int8
  , indirection: 1
  , get: function get (buf, offset) {
      return buf.readInt8(offset || 0)
    }
  , set: function set (buf, offset, val) {
      if (typeof val === 'string') {
        val = val.charCodeAt(0)
      }
      return buf.writeInt8(val, offset || 0)
    }
}

/**
 * The `uint8` type.
 */

types.uint8 = {
    size: exports.sizeof.uint8
  , indirection: 1
  , get: function get (buf, offset) {
      return buf.readUInt8(offset || 0)
    }
  , set: function set (buf, offset, val) {
      if (typeof val === 'string') {
        val = val.charCodeAt(0)
      }
      return buf.writeUInt8(val, offset || 0)
    }
}

/**
 * The `int16` type.
 */

types.int16 = {
    size: exports.sizeof.int16
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readInt16' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeInt16' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `uint16` type.
 */

types.uint16 = {
    size: exports.sizeof.uint16
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readUInt16' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeUInt16' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `int32` type.
 */

types.int32 = {
    size: exports.sizeof.int32
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readInt32' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeInt32' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `uint32` type.
 */

types.uint32 = {
    size: exports.sizeof.uint32
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readUInt32' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeUInt32' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `int64` type.
 */

types.int64 = {
    size: exports.sizeof.int64
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readInt64' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeInt64' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `uint64` type.
 */

types.uint64 = {
    size: exports.sizeof.uint64
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readUInt64' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeUInt64' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `float` type.
 */

types.float = {
    size: exports.sizeof.float
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readFloat' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeFloat' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `double` type.
 */

types.double = {
    size: exports.sizeof.double
  , indirection: 1
  , get: function get (buf, offset) {
      return buf['readDouble' + exports.endianness](offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf['writeDouble' + exports.endianness](val, offset || 0)
    }
}

/**
 * The `Object` type. This can be used to read/write regular JS Objects
 * into raw memory.
 */

types.Object = {
    size: exports.sizeof.Object
  , indirection: 1
  , get: function get (buf, offset) {
      return buf.readObject(offset || 0)
    }
  , set: function set (buf, offset, val) {
      return buf.writeObject(val, offset || 0)
    }
}

/**
 * The `CString` (a.k.a `"string"`) type.
 *
 * CStrings are a kind of weird thing. We say it's `sizeof(char *)`, and
 * `indirection` level of 1, which means that we have to return a Buffer that
 * is pointer sized, and points to a some utf8 string data, so we have to create
 * a 2nd "in-between" buffer.
 */

types.CString = {
    size: exports.sizeof.pointer
  , alignment: exports.alignof.pointer
  , indirection: 1
  , get: function get (buf, offset) {
      var _buf = exports.readPointer(buf, offset)
      if (exports.isNull(_buf)) {
        return null
      }
      return exports.readCString(_buf, 0)
    }
  , set: function set (buf, offset, val) {
      var _buf
      if (Buffer.isBuffer(val)) {
        _buf = val
      } else {
        // assume string
        _buf = exports.allocCString(val)
      }
      return exports.writePointer(buf, offset, _buf)
    }
}

// alias Utf8String
var utfstringwarned = false
Object.defineProperty(types, 'Utf8String', {
    enumerable: false
  , configurable: true
  , get: function () {
      if (!utfstringwarned) {
        utfstringwarned = true
        console.error('"Utf8String" type is deprecated, use "CString" instead')
      }
      return types.CString
    }
})

/**
 * The `bool` type.
 *
 * Wrapper type around `types.uint8` that accepts/returns `true` or
 * `false` Boolean JavaScript values.
 *
 * @name bool
 *
 */

/**
 * The `byte` type.
 *
 * @name byte
 */

/**
 * The `char` type.
 *
 * @name char
 */

/**
 * The `uchar` type.
 *
 * @name uchar
 */

/**
 * The `short` type.
 *
 * @name short
 */

/**
 * The `ushort` type.
 *
 * @name ushort
 */

/**
 * The `int` type.
 *
 * @name int
 */

/**
 * The `uint` type.
 *
 * @name uint
 */

/**
 * The `long` type.
 *
 * @name long
 */

/**
 * The `ulong` type.
 *
 * @name ulong
 */

/**
 * The `longlong` type.
 *
 * @name longlong
 */

/**
 * The `ulonglong` type.
 *
 * @name ulonglong
 */

/**
 * The `size_t` type.
 *
 * @name size_t
 */

// "typedef"s for the variable-sized types
;[ 'bool', 'byte', 'char', 'uchar', 'short', 'ushort', 'int', 'uint', 'long'
, 'ulong', 'longlong', 'ulonglong', 'size_t' ].forEach(function (name) {
  var unsigned = name === 'bool'
              || name === 'byte'
              || name === 'size_t'
              || name[0] === 'u'
  var size = exports.sizeof[name]
  assert(size >= 1 && size <= 8)
  var typeName = 'int' + (size * 8)
  if (unsigned) {
    typeName = 'u' + typeName
  }
  var type = exports.types[typeName]
  assert(type)
  exports.types[name] = Object.create(type)
})

// set the "alignment" property on the built-in types
Object.keys(exports.alignof).forEach(function (name) {
  if (name === 'pointer') return
  exports.types[name].alignment = exports.alignof[name]
  assert(exports.types[name].alignment > 0)
})

// make the `bool` type work with JS true/false values
exports.types.bool.get = (function (_get) {
  return function get (buf, offset) {
    return _get(buf, offset) ? true : false
  }
})(exports.types.bool.get)
exports.types.bool.set = (function (_set) {
  return function set (buf, offset, val) {
    if (typeof val !== 'number') {
      val = val ? 1 : 0
    }
    return _set(buf, offset, val)
  }
})(exports.types.bool.set)

/*!
 * Set the `name` property of the types. Used for debugging...
 */

Object.keys(exports.types).forEach(function (name) {
  exports.types[name].name = name
})

/*!
 * This `char *` type is used by "allocCString()" above.
 */

var charPtrType = exports.refType(exports.types.char)

/*!
 * Set the `type` property of the `NULL` pointer Buffer object.
 */

exports.NULL.type = exports.types.void

/**
 * `NULL_POINTER` is a pointer-sized `Buffer` instance pointing to `NULL`.
 * Conceptually, it's equivalent to the following C code:
 *
 * ``` c
 * char *null_pointer;
 * null_pointer = NULL;
 * ```
 *
 * @type Buffer
 */

exports.NULL_POINTER = exports.ref(exports.NULL)

/**
 * All these '...' comment blocks below are for the documentation generator.
 *
 * @section buffer
 */

Buffer.prototype.address = function address () {
  return exports.address(this, 0)
}

/**
 * ...
 */

Buffer.prototype.hexAddress = function hexAddress () {
  return exports.hexAddress(this, 0)
}

/**
 * ...
 */

Buffer.prototype.isNull = function isNull () {
  return exports.isNull(this, 0)
}

/**
 * ...
 */

Buffer.prototype.ref = function ref () {
  return exports.ref(this)
}

/**
 * ...
 */

Buffer.prototype.deref = function deref () {
  return exports.deref(this)
}

/**
 * ...
 */

Buffer.prototype.readObject = function readObject (offset) {
  return exports.readObject(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeObject = function writeObject (obj, offset) {
  return exports.writeObject(this, offset, obj)
}

/**
 * ...
 */

Buffer.prototype.readPointer = function readPointer (offset, size) {
  return exports.readPointer(this, offset, size)
}

/**
 * ...
 */

Buffer.prototype.writePointer = function writePointer (ptr, offset) {
  return exports.writePointer(this, offset, ptr)
}

/**
 * ...
 */

Buffer.prototype.readCString = function readCString (offset) {
  return exports.readCString(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeCString = function writeCString (string, offset, encoding) {
  return exports.writeCString(this, offset, string, encoding)
}

/**
 * ...
 */

Buffer.prototype.readInt64BE = function readInt64BE (offset) {
  return exports.readInt64BE(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeInt64BE = function writeInt64BE (val, offset) {
  return exports.writeInt64BE(this, offset, val)
}

/**
 * ...
 */

Buffer.prototype.readUInt64BE = function readUInt64BE (offset) {
  return exports.readUInt64BE(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeUInt64BE = function writeUInt64BE (val, offset) {
  return exports.writeUInt64BE(this, offset, val)
}

/**
 * ...
 */

Buffer.prototype.readInt64LE = function readInt64LE (offset) {
  return exports.readInt64LE(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeInt64LE = function writeInt64LE (val, offset) {
  return exports.writeInt64LE(this, offset, val)
}

/**
 * ...
 */

Buffer.prototype.readUInt64LE = function readUInt64LE (offset) {
  return exports.readUInt64LE(this, offset)
}

/**
 * ...
 */

Buffer.prototype.writeUInt64LE = function writeUInt64LE (val, offset) {
  return exports.writeUInt64LE(this, offset, val)
}

/**
 * ...
 */

Buffer.prototype.reinterpret = function reinterpret (size, offset) {
  return exports.reinterpret(this, size, offset)
}

/**
 * ...
 */

Buffer.prototype.reinterpretUntilZeros = function reinterpretUntilZeros (size, offset) {
  return exports.reinterpretUntilZeros(this, size, offset)
}

/**
 * `ref` overwrites the default `Buffer#inspect()` function to include the
 * hex-encoded memory address of the Buffer instance when invoked.
 *
 * This is simply a nice-to-have.
 *
 * **Before**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer 72 65 66>
 * ```
 *
 * **After**:
 *
 * ``` js
 * console.log(new Buffer('ref'));
 * <Buffer@0x103015490 72 65 66>
 * ```
 */

Buffer.prototype.inspect = overwriteInspect(Buffer.prototype.inspect)

// does SlowBuffer inherit from Buffer? (node >= v0.7.9)
if (!(exports.NULL instanceof Buffer)) {
  debug('extending SlowBuffer\'s prototype since it doesn\'t inherit from Buffer.prototype')

  /*!
   * SlowBuffer convenience methods.
   */

  var SlowBuffer = require('buffer').SlowBuffer

  SlowBuffer.prototype.address = Buffer.prototype.address
  SlowBuffer.prototype.hexAddress = Buffer.prototype.hexAddress
  SlowBuffer.prototype.isNull = Buffer.prototype.isNull
  SlowBuffer.prototype.ref = Buffer.prototype.ref
  SlowBuffer.prototype.deref = Buffer.prototype.deref
  SlowBuffer.prototype.readObject = Buffer.prototype.readObject
  SlowBuffer.prototype.writeObject = Buffer.prototype.writeObject
  SlowBuffer.prototype.readPointer = Buffer.prototype.readPointer
  SlowBuffer.prototype.writePointer = Buffer.prototype.writePointer
  SlowBuffer.prototype.readCString = Buffer.prototype.readCString
  SlowBuffer.prototype.writeCString = Buffer.prototype.writeCString
  SlowBuffer.prototype.reinterpret = Buffer.prototype.reinterpret
  SlowBuffer.prototype.reinterpretUntilZeros = Buffer.prototype.reinterpretUntilZeros
  SlowBuffer.prototype.readInt64BE = Buffer.prototype.readInt64BE
  SlowBuffer.prototype.writeInt64BE = Buffer.prototype.writeInt64BE
  SlowBuffer.prototype.readUInt64BE = Buffer.prototype.readUInt64BE
  SlowBuffer.prototype.writeUInt64BE = Buffer.prototype.writeUInt64BE
  SlowBuffer.prototype.readInt64LE = Buffer.prototype.readInt64LE
  SlowBuffer.prototype.writeInt64LE = Buffer.prototype.writeInt64LE
  SlowBuffer.prototype.readUInt64LE = Buffer.prototype.readUInt64LE
  SlowBuffer.prototype.writeUInt64LE = Buffer.prototype.writeUInt64LE
  SlowBuffer.prototype.inspect = overwriteInspect(SlowBuffer.prototype.inspect)
}

function overwriteInspect (inspect) {
  if (inspect.name === 'refinspect') {
    return inspect
  } else {
    return function refinspect () {
      var v = inspect.apply(this, arguments)
      return v.replace('Buffer', 'Buffer@0x' + this.hexAddress())
    }
  }
}

}).call(this,require("buffer").Buffer)
},{"assert":6,"bindings":8,"buffer":10,"debug":11}],130:[function(require,module,exports){
(function (global){
// Copyright (c) 2011, Chris Umbel

exports.Vector = require('./vector');
global.$V = exports.Vector.create;
exports.Matrix = require('./matrix');
global.$M = exports.Matrix.create;
exports.Line = require('./line');
global.$L = exports.Line.create;
exports.Plane = require('./plane');
global.$P = exports.Plane.create;
exports.Line.Segment = require('./line.segment');
exports.Sylvester = require('./sylvester');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./line":131,"./line.segment":132,"./matrix":133,"./plane":134,"./sylvester":135,"./vector":136}],131:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
var Vector = require('./vector');
var Matrix = require('./matrix');
var Plane = require('./plane');
var Sylvester = require('./sylvester');

// Line class - depends on Vector, and some methods require Matrix and Plane.

function Line() {}
Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function() {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. A line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  // Returns true iff the argument is a point on the line, or if the argument
  // is a line segment lying within the receiver
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var dist = this.distanceFrom(obj);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns the distance from the anchor of the given point. Negative values are
  // returned for points that are in the opposite direction to the line's direction from
  // the line's anchor point.
  positionOf: function(point) {
    if (!this.contains(point)) { return null; }
    var P = point.elements || point;
    var A = this.anchor.elements, D = this.direction.elements;
    return (P[0] - A[0]) * D[0] + (P[1] - A[1]) * D[1] + ((P[2] || 0) - A[2]) * D[2];
  },

  // Returns true iff the line lies in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function(obj) {
    if (obj.normal || (obj.start && obj.end)) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  // Returns the point on the line that is closest to the given point or line/line segment
  pointClosestTo: function(obj) {
    if (obj.start && obj.end) {
      // obj is a line segment
      var P = obj.pointClosestTo(this);
      return (P === null) ? null : this.pointClosestTo(P);
    } else if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = [x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1];
      var P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  // Returns a copy of the line with its direction vector reversed.
  // Useful when using lines for rotations.
  reverse: function() {
    return Line.create(this.anchor, this.direction.x(-1));
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  // Set the line's anchor point and direction.
  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(anchor);
    direction = Vector.create(direction);
    if (anchor.elements.length == 2) {anchor.elements.push(0); }
    if (direction.elements.length == 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

// Constructor function
Line.create = function(anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);

module.exports = Line;

},{"./matrix":133,"./plane":134,"./sylvester":135,"./vector":136}],132:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
// Line.Segment class - depends on Line and its dependencies.

var Line = require('./line');
var Vector = require('./vector');

Line.Segment = function() {};
Line.Segment.prototype = {

  // Returns true iff the line segment is equal to the argument
  eql: function(segment) {
    return (this.start.eql(segment.start) && this.end.eql(segment.end)) ||
        (this.start.eql(segment.end) && this.end.eql(segment.start));
  },

  // Returns a copy of the line segment
  dup: function() {
    return Line.Segment.create(this.start, this.end);
  },

  // Returns the length of the line segment
  length: function() {
    var A = this.start.elements, B = this.end.elements;
    var C1 = B[0] - A[0], C2 = B[1] - A[1], C3 = B[2] - A[2];
    return Math.sqrt(C1*C1 + C2*C2 + C3*C3);
  },

  // Returns the line segment as a vector equal to its
  // end point relative to its endpoint
  toVector: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
  },

  // Returns the segment's midpoint as a vector
  midpoint: function() {
    var A = this.start.elements, B = this.end.elements;
    return Vector.create([(B[0] + A[0])/2, (B[1] + A[1])/2, (B[2] + A[2])/2]);
  },

  // Returns the plane that bisects the segment
  bisectingPlane: function() {
    return Plane.create(this.midpoint(), this.toVector());
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    var S = this.start.elements, E = this.end.elements;
    return Line.Segment.create(
      [S[0] + V[0], S[1] + V[1], S[2] + (V[2] || 0)],
      [E[0] + V[0], E[1] + V[1], E[2] + (V[2] || 0)]
    );
  },

  // Returns true iff the line segment is parallel to the argument. It simply forwards
  // the method call onto its line property.
  isParallelTo: function(obj) {
    return this.line.isParallelTo(obj);
  },

  // Returns the distance between the argument and the line segment's closest point to the argument
  distanceFrom: function(obj) {
    var P = this.pointClosestTo(obj);
    return (P === null) ? null : P.distanceFrom(obj);
  },

  // Returns true iff the given point lies on the segment
  contains: function(obj) {
    if (obj.start && obj.end) { return this.contains(obj.start) && this.contains(obj.end); }
    var P = (obj.elements || obj).slice();
    if (P.length == 2) { P.push(0); }
    if (this.start.eql(P)) { return true; }
    var S = this.start.elements;
    var V = Vector.create([S[0] - P[0], S[1] - P[1], S[2] - (P[2] || 0)]);
    var vect = this.toVector();
    return V.isAntiparallelTo(vect) && V.modulus() <= vect.modulus();
  },

  // Returns true iff the line segment intersects the argument
  intersects: function(obj) {
    return (this.intersectionWith(obj) !== null);
  },

  // Returns the unique point of intersection with the argument
  intersectionWith: function(obj) {
    if (!this.line.intersects(obj)) { return null; }
    var P = this.line.intersectionWith(obj);
    return (this.contains(P) ? P : null);
  },

  // Returns the point on the line segment closest to the given object
  pointClosestTo: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var V = this.line.intersectionWith(obj);
      if (V === null) { return null; }
      return this.pointClosestTo(V);
    } else {
      // obj is a line (segment) or point
      var P = this.line.pointClosestTo(obj);
      if (P === null) { return null; }
      if (this.contains(P)) { return P; }
      return (this.line.positionOf(P) < 0 ? this.start : this.end).dup();
    }
  },

  // Set the start and end-points of the segment
  setPoints: function(startPoint, endPoint) {
    startPoint = Vector.create(startPoint).to3D();
    endPoint = Vector.create(endPoint).to3D();
    if (startPoint === null || endPoint === null) { return null; }
    this.line = Line.create(startPoint, endPoint.subtract(startPoint));
    this.start = startPoint;
    this.end = endPoint;
    return this;
  }
};

// Constructor function
Line.Segment.create = function(v1, v2) {
  var S = new Line.Segment();
  return S.setPoints(v1, v2);
};

module.exports = Line.Segment;

},{"./line":131,"./vector":136}],133:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
// Matrix class - depends on Vector.

var fs = require('fs');
var Sylvester = require('./sylvester');
var Vector = require('./vector');

// augment a matrix M with identity rows/cols
function identSize(M, m, n, k) {
    var e = M.elements;
    var i = k - 1;

    while(i--) {
	var row = [];
	
	for(var j = 0; j < n; j++)
	    row.push(j == i ? 1 : 0);
	
        e.unshift(row);
    }
    
    for(var i = k - 1; i < m; i++) {
        while(e[i].length < n)
            e[i].unshift(0);
    }

    return $M(e);
}

function pca(X) {
    var Sigma = X.transpose().x(X).x(1 / X.rows());
    var svd = Sigma.svd();
    return {U: svd.U, S: svd.S};
}

// singular value decomposition in pure javascript
function svdJs() {
    var A = this;
    var V = Matrix.I(A.rows());
    var S = A.transpose();
    var U = Matrix.I(A.cols());
    var err = Number.MAX_VALUE;
    var i = 0;
    var maxLoop = 100;

    while(err > 2.2737e-13 && i < maxLoop) {
        var qr = S.transpose().qrJs();
        S = qr.R;
        V = V.x(qr.Q);
        qr = S.transpose().qrJs();
        U = U.x(qr.Q);
        S = qr.R;

        var e = S.triu(1).unroll().norm();
        var f = S.diagonal().norm();

        if(f == 0)
            f = 1;

        err = e / f;

        i++;
    }

    var ss = S.diagonal();
    var s = [];

    for(var i = 1; i <= ss.cols(); i++) {
        var ssn = ss.e(i);
        s.push(Math.abs(ssn));

        if(ssn < 0) {
            for(var j = 0; j < U.rows(); j++) {
                V.elements[j][i - 1] = -(V.elements[j][i - 1]);
            }
        }
    }

    return {U: U, S: $V(s).toDiagonalMatrix(), V: V};
}

// singular value decomposition using LAPACK
function svdPack() {
    var result = lapack.sgesvd('A', 'A', this.elements);

    return {
        U: $M(result.U),
        S: $M(result.S).column(1).toDiagonalMatrix(),
	V: $M(result.VT).transpose()
    };
}

// QR decomposition in pure javascript
function qrJs() {
    var m = this.rows();
    var n = this.cols();
    var Q = Matrix.I(m);
    var A = this;
    
    for(var k = 1; k < Math.min(m, n); k++) {
	var ak = A.slice(k, 0, k, k).col(1);
	var oneZero = [1];
	
	while(oneZero.length <=  m - k)
	    oneZero.push(0);
	
	oneZero = $V(oneZero);
	var vk = ak.add(oneZero.x(ak.norm() * Math.sign(ak.e(1))));
	var Vk = $M(vk);
	var Hk = Matrix.I(m - k + 1).subtract(Vk.x(2).x(Vk.transpose()).div(Vk.transpose().x(Vk).e(1, 1)));
	var Qk = identSize(Hk, m, n, k);
	A = Qk.x(A);
	// slow way to compute Q
	Q = Q.x(Qk);
    }
    
    return {Q: Q, R: A};
}

// QR decomposition using LAPACK
function qrPack() {
    var qr = lapack.qr(this.elements);

    return {
	Q: $M(qr.Q),
	R: $M(qr.R)
    };
}

function Matrix() {}
Matrix.prototype = {
    // solve a system of linear equations (work in progress)
    solve: function(b) {
	var lu = this.lu();
	b = lu.P.x(b);
	var y = lu.L.forwardSubstitute(b);
	var x = lu.U.backSubstitute(y);
	return lu.P.x(x);
	//return this.inv().x(b);
    },

    // project a matrix onto a lower dim
    pcaProject: function(k, U) {
	var U = U || pca(this).U;
	var Ureduce= U.slice(1, U.rows(), 1, k);
	return {Z: this.x(Ureduce), U: U};
    },

    // recover a matrix to a higher dimension
    pcaRecover: function(U) {
	var k = this.cols();
	var Ureduce = U.slice(1, U.rows(), 1, k);
	return this.x(Ureduce.transpose());
    },    

    // grab the upper triangular part of the matrix
    triu: function(k) {
	if(!k)
	    k = 0;
	
	return this.map(function(x, i, j) {
	    return j - i >= k ? x : 0;
	});
    },

    // unroll a matrix into a vector
    unroll: function() {
	var v = [];
	
	for(var i = 1; i <= this.cols(); i++) {
	    for(var j = 1; j <= this.rows(); j++) {
		v.push(this.e(j, i));
	    }
	}

	return $V(v);
    },

    // return a sub-block of the matrix
    slice: function(startRow, endRow, startCol, endCol) {
	var x = [];
	
	if(endRow == 0)
	    endRow = this.rows();
	
	if(endCol == 0)
	    endCol = this.cols();

	for(i = startRow; i <= endRow; i++) {
	    var row = [];

	    for(j = startCol; j <= endCol; j++) {
		row.push(this.e(i, j));
	    }

	    x.push(row);
	}

	return $M(x);
    },

    // Returns element (i,j) of the matrix
    e: function(i,j) {
	if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
	return this.elements[i - 1][j - 1];
    },

    // Returns row k of the matrix as a vector
    row: function(i) {
	if (i > this.elements.length) { return null; }
	return $V(this.elements[i - 1]);
    },

    // Returns column k of the matrix as a vector
    col: function(j) {
	if (j > this.elements[0].length) { return null; }
	var col = [], n = this.elements.length;
	for (var i = 0; i < n; i++) { col.push(this.elements[i][j - 1]); }
	return $V(col);
    },

    // Returns the number of rows/columns the matrix has
    dimensions: function() {
	return {rows: this.elements.length, cols: this.elements[0].length};
    },

    // Returns the number of rows in the matrix
    rows: function() {
	return this.elements.length;
    },

    // Returns the number of columns in the matrix
    cols: function() {
	return this.elements[0].length;
    },

    approxEql: function(matrix) {
	return this.eql(matrix, Sylvester.approxPrecision);
    },

    // Returns true iff the matrix is equal to the argument. You can supply
    // a vector as the argument, in which case the receiver must be a
    // one-column matrix equal to the vector.
    eql: function(matrix, precision) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	if (this.elements.length != M.length ||
            this.elements[0].length != M[0].length) { return false; }
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      while (j--) {
			  if (Math.abs(this.elements[i][j] - M[i][j]) > (precision || Sylvester.precision)) { return false; }
		      }
		    }
	return true;
    },

    // Returns a copy of the matrix
    dup: function() {
	return Matrix.create(this.elements);
    },

    // Maps the matrix to another matrix (of the same dimensions) according to the given function
    map: function(fn) {
    var els = [], i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) { j = nj;
		      els[i] = [];
		      while (j--) {
			  els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
		      }
		    }
	return Matrix.create(els);
    },

    // Returns true iff the argument has the same dimensions as the matrix
    isSameSizeAs: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	return (this.elements.length == M.length &&
		this.elements[0].length == M[0].length);
    },

    // Returns the result of adding the argument to the matrix
    add: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x + matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x + M[i - 1][j - 1]; });
	}
    },

    // Returns the result of subtracting the argument from the matrix
    subtract: function(matrix) {
	if(typeof(matrix) == 'number') {
	    return this.map(function(x, i, j) { return x - matrix});
	} else {
	    var M = matrix.elements || matrix;
	    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	    if (!this.isSameSizeAs(M)) { return null; }
	    return this.map(function(x, i, j) { return x - M[i - 1][j - 1]; });
	}
    },

    // Returns true iff the matrix can multiply the argument from the left
    canMultiplyFromLeft: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	// this.columns should equal matrix.rows
	return (this.elements[0].length == M.length);
    },

    // Returns the result of a multiplication-style operation the matrix from the right by the argument.
    // If the argument is a scalar then just operate on all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    mulOp: function(matrix, op) {
	if (!matrix.elements) {
	    return this.map(function(x) { return op(x, matrix); });
	}

	var returnVector = matrix.modulus ? true : false;
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') 
	    M = Matrix.create(M).elements;
	if (!this.canMultiplyFromLeft(M)) 
	    return null; 
	var e = this.elements, rowThis, rowElem, elements = [],
        sum, m = e.length, n = M[0].length, o = e[0].length, i = m, j, k;

	while (i--) {
            rowElem = [];
            rowThis = e[i];
            j = n;

            while (j--) {
		sum = 0;
		k = o;

		while (k--) {
                    sum += op(rowThis[k], M[k][j]);
		}

		rowElem[j] = sum;
            }

            elements[i] = rowElem;
	}

	var M = Matrix.create(elements);
	return returnVector ? M.col(1) : M;
    },

    // Returns the result of dividing the matrix from the right by the argument.
    // If the argument is a scalar then just divide all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    div: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x / y});
    },

    // Returns the result of multiplying the matrix from the right by the argument.
    // If the argument is a scalar then just multiply all the elements. If the argument is
    // a vector, a vector is returned, which saves you having to remember calling
    // col(1) on the result.
    multiply: function(matrix) {
	return this.mulOp(matrix, function(x, y) { return x * y});
    },

    x: function(matrix) { return this.multiply(matrix); },

    elementMultiply: function(v) {
        return this.map(function(k, i, j) {
            return v.e(i, j) * k;
        });
    },

    // sum all elements in the matrix
    sum: function() {
        var sum = 0;

        this.map(function(x) { sum += x;});

        return sum;
    },

    // Returns a Vector of each colum averaged.
    mean: function() {
      var dim = this.dimensions();
      var r = [];
      for (var i = 1; i <= dim.cols; i++) {
        r.push(this.col(i).sum() / dim.rows);
      }
      return $V(r);
    },

    column: function(n) {
	return this.col(n);
    },

    // element-wise log
    log: function() {
	return this.map(function(x) { return Math.log(x); });
    },

    // Returns a submatrix taken from the matrix
    // Argument order is: start row, start col, nrows, ncols
    // Element selection wraps if the required index is outside the matrix's bounds, so you could
    // use this to perform row/column cycling or copy-augmenting.
    minor: function(a, b, c, d) {
	var elements = [], ni = c, i, nj, j;
	var rows = this.elements.length, cols = this.elements[0].length;
	while (ni--) {
	    i = c - ni - 1;
	    elements[i] = [];
	    nj = d;
	    while (nj--) {
		j = d - nj - 1;
		elements[i][j] = this.elements[(a + i - 1) % rows][(b + j - 1) % cols];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns the transpose of the matrix
    transpose: function() {
    var rows = this.elements.length, i, cols = this.elements[0].length, j;
	var elements = [], i = cols;
	while (i--) {
	    j = rows;
	    elements[i] = [];
	    while (j--) {
		elements[i][j] = this.elements[j][i];
	    }
	}
	return Matrix.create(elements);
    },

    // Returns true iff the matrix is square
    isSquare: function() {
	return (this.elements.length == this.elements[0].length);
    },

    // Returns the (absolute) largest element of the matrix
    max: function() {
	var m = 0, i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
	    }
	}
	return m;
    },

    // Returns the indeces of the first match found by reading row-by-row from left to right
    indexOf: function(x) {
	var index = null, ni = this.elements.length, i, nj = this.elements[0].length, j;
	for (i = 0; i < ni; i++) {
	    for (j = 0; j < nj; j++) {
		if (this.elements[i][j] == x) { return {i: i + 1, j: j + 1}; }
	    }
	}
	return null;
    },

    // If the matrix is square, returns the diagonal elements as a vector.
    // Otherwise, returns null.
    diagonal: function() {
	if (!this.isSquare) { return null; }
	var els = [], n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    els.push(this.elements[i][i]);
	}
	return $V(els);
    },

    // Make the matrix upper (right) triangular by Gaussian elimination.
    // This method only adds multiples of rows to other rows. No rows are
    // scaled up or switched, and the determinant is preserved.
    toRightTriangular: function() {
	var M = this.dup(), els;
	var n = this.elements.length, i, j, np = this.elements[0].length, p;
	for (i = 0; i < n; i++) {
	    if (M.elements[i][i] == 0) {
		for (j = i + 1; j < n; j++) {
		    if (M.elements[j][i] != 0) {
			els = [];
			for (p = 0; p < np; p++) { els.push(M.elements[i][p] + M.elements[j][p]); }
			M.elements[i] = els;
			break;
		    }
		}
	    }
	    if (M.elements[i][i] != 0) {
		for (j = i + 1; j < n; j++) {
		    var multiplier = M.elements[j][i] / M.elements[i][i];
		    els = [];
		    for (p = 0; p < np; p++) {
			// Elements with column numbers up to an including the number
			// of the row that we're subtracting can safely be set straight to
			// zero, since that's the point of this routine and it avoids having
			// to loop over and correct rounding errors later
			els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
		    }
		    M.elements[j] = els;
		}
	    }
	}
	return M;
    },

    toUpperTriangular: function() { return this.toRightTriangular(); },

    // Returns the determinant for square matrices
    determinant: function() {
	if (!this.isSquare()) { return null; }
	if (this.cols == 1 && this.rows == 1) { return this.row(1); }
	if (this.cols == 0 && this.rows == 0) { return 1; }
	var M = this.toRightTriangular();
	var det = M.elements[0][0], n = M.elements.length;
	for (var i = 1; i < n; i++) {
	    det = det * M.elements[i][i];
	}
	return det;
    },
    det: function() { return this.determinant(); },

    // Returns true iff the matrix is singular
    isSingular: function() {
	return (this.isSquare() && this.determinant() === 0);
    },

    // Returns the trace for square matrices
    trace: function() {
	if (!this.isSquare()) { return null; }
	var tr = this.elements[0][0], n = this.elements.length;
	for (var i = 1; i < n; i++) {
	    tr += this.elements[i][i];
	}
	return tr;
    },

    tr: function() { return this.trace(); },

    // Returns the rank of the matrix
    rank: function() {
	var M = this.toRightTriangular(), rank = 0;
	var i = this.elements.length, nj = this.elements[0].length, j;
	while (i--) {
	    j = nj;
	    while (j--) {
		if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
	    }
	}
	return rank;
    },

    rk: function() { return this.rank(); },

    // Returns the result of attaching the given argument to the right-hand side of the matrix
    augment: function(matrix) {
	var M = matrix.elements || matrix;
	if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
	var T = this.dup(), cols = T.elements[0].length;
	var i = T.elements.length, nj = M[0].length, j;
	if (i != M.length) { return null; }
	while (i--) {
	    j = nj;
	    while (j--) {
		T.elements[i][cols + j] = M[i][j];
	    }
	}
	return T;
    },

    // Returns the inverse (if one exists) using Gauss-Jordan
    inverse: function() {
	if (!this.isSquare() || this.isSingular()) { return null; }
	var n = this.elements.length, i = n, j;
	var M = this.augment(Matrix.I(n)).toRightTriangular();
	var np = M.elements[0].length, p, els, divisor;
	var inverse_elements = [], new_element;
	// Matrix is non-singular so there will be no zeros on the diagonal
	// Cycle through rows from last to first
	while (i--) {
	    // First, normalise diagonal elements to 1
	    els = [];
	    inverse_elements[i] = [];
	    divisor = M.elements[i][i];
	    for (p = 0; p < np; p++) {
        new_element = M.elements[i][p] / divisor;
		els.push(new_element);
		// Shuffle off the current row of the right hand side into the results
		// array as it will not be modified by later runs through this loop
		if (p >= n) { inverse_elements[i].push(new_element); }
	    }
	    M.elements[i] = els;
	    // Then, subtract this row from those above it to
	    // give the identity matrix on the left hand side
	    j = i;
	    while (j--) {
		els = [];
		for (p = 0; p < np; p++) {
		    els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
		}
		M.elements[j] = els;
	    }
	}
	return Matrix.create(inverse_elements);
    },

    inv: function() { return this.inverse(); },

    // Returns the result of rounding all the elements
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Returns a copy of the matrix with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(p) {
	    return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
	});
    },

    // Returns a string representation of the matrix
    inspect: function() {
	var matrix_rows = [];
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    matrix_rows.push($V(this.elements[i]).inspect());
	}
	return matrix_rows.join('\n');
    },

    // Returns a array representation of the matrix
    toArray: function() {
    	var matrix_rows = [];
    	var n = this.elements.length;
    	for (var i = 0; i < n; i++) {
        matrix_rows.push(this.elements[i]);
    	}
      return matrix_rows;
    },


    // Set the matrix's elements from an array. If the argument passed
    // is a vector, the resulting matrix will be a single column.
    setElements: function(els) {
	var i, j, elements = els.elements || els;
	if (typeof(elements[0][0]) != 'undefined') {
	    i = elements.length;
	    this.elements = [];
	    while (i--) {
		j = elements[i].length;
		this.elements[i] = [];
		while (j--) {
		    this.elements[i][j] = elements[i][j];
		}
	    }
	    return this;
	}
	var n = elements.length;
	this.elements = [];
	for (i = 0; i < n; i++) {
	    this.elements.push([elements[i]]);
	}
	return this;
    },

    // return the indexes of the columns with the largest value
    // for each row
    maxColumnIndexes: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;
	    var maxIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		    maxIndex = j;
		}
	    }

	    maxes.push(maxIndex);
	}

	return $V(maxes);
    },

    // return the largest values in each row
    maxColumns: function() {
	var maxes = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var max = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(max === null || this.e(i, j) > max) {
		    max = this.e(i, j);
		}
	    }

	    maxes.push(max);
	}

	return $V(maxes);
    },

    // return the indexes of the columns with the smallest values
    // for each row
    minColumnIndexes: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;
	    var minIndex = -1;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		    minIndex = j;
		}
	    }

	    mins.push(minIndex);
	}

	return $V(mins);
    },

    // return the smallest values in each row
    minColumns: function() {
	var mins = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var min = null;

	    for(var j = 1; j <= this.cols(); j++) {
		if(min === null || this.e(i, j) < min) {
		    min = this.e(i, j);
		}
	    }

	    mins.push(min);
	}

	return $V(mins);
    },
    
    // perorm a partial pivot on the matrix. essentially move the largest
    // row below-or-including the pivot and replace the pivot's row with it.
    // a pivot matrix is returned so multiplication can perform the transform.
    partialPivot: function(k, j, P, A, L) {
	var maxIndex = 0;
	var maxValue = 0;

	for(var i = k; i <= A.rows(); i++) {
	    if(Math.abs(A.e(i, j)) > maxValue) {
		maxValue = Math.abs(A.e(k, j));
		maxIndex = i;
	    }
	}

	if(maxIndex != k) {
	    var tmp = A.elements[k - 1];
	    A.elements[k - 1] = A.elements[maxIndex - 1];
	    A.elements[maxIndex - 1] = tmp;
	    
	    P.elements[k - 1][k - 1] = 0;
	    P.elements[k - 1][maxIndex - 1] = 1;
	    P.elements[maxIndex - 1][maxIndex - 1] = 0;
	    P.elements[maxIndex - 1][k - 1] = 1;
	}
	
	return P;
    },

    // solve lower-triangular matrix * x = b via forward substitution
    forwardSubstitute: function(b) {
	var xa = [];

	for(var i = 1; i <= this.rows(); i++) {
	    var w = 0;

	    for(var j = 1; j < i; j++) {
		w += this.e(i, j) * xa[j - 1];
	    }

	    xa.push((b.e(i) - w) / this.e(i, i));
	}

	return $V(xa);
    },

    // solve an upper-triangular matrix * x = b via back substitution
    backSubstitute: function(b) {
	var xa = [];

	for(var i = this.rows(); i > 0; i--) {
	    var w = 0;

	    for(var j = this.cols(); j > i; j--) {
		w += this.e(i, j) * xa[this.rows() - j];
	    }

	    xa.push((b.e(i) - w) / this.e(i, i));
	}

	return $V(xa.reverse());
    },
    
    luPack: luPack,
    luJs: luJs,
    svdJs: svdJs,
    svdPack: svdPack,
    qrJs: qrJs,
    qrPack: qrPack
};

// LU factorization from LAPACK
function luPack() {
    var lu = lapack.lu(this.elements);
    return {
	L: $M(lu.L),
	U: $M(lu.U),
	P: $M(lu.P)
	// don't pass back IPIV
    };
}

var tolerance =  1.4901e-08;

// pure Javascript LU factorization
function luJs() {
    var A = this.dup();
    var L = Matrix.I(A.rows());
    var P = Matrix.I(A.rows());
    var U = Matrix.Zeros(A.rows(), A.cols());
    var p = 1;

    for(var k = 1; k <= Math.min(A.cols(), A.rows()); k++) {
	P = A.partialPivot(k, p, P, A, L);
	
	for(var i = k + 1; i <= A.rows(); i++) {
	    var l = A.e(i, p) / A.e(k, p);
	    L.elements[i - 1][k - 1] = l;
	    
	    for(var j = k + 1 ; j <= A.cols(); j++) {
		A.elements[i - 1][j - 1] -= A.e(k, j) * l;
	    }
	}
	
	for(var j = k; j <= A.cols(); j++) {
	    U.elements[k - 1][j - 1] = A.e(k, j);
	}

	if(p < A.cols())
	    p++;
    }    
    
    return {L: L, U: U, P: P};
}

function getLapack() {
    try {
	return require('lapack');
    } catch(e) {}
}

var lapack;

// if node-lapack is installed use the fast, native fortran routines
if(lapack = getLapack()) {
    Matrix.prototype.svd = svdPack;
    Matrix.prototype.qr = qrPack;
    Matrix.prototype.lu = luPack;
} else {
    // otherwise use the slower pure Javascript versions
    Matrix.prototype.svd = svdJs;
    Matrix.prototype.qr = qrJs;
    Matrix.prototype.lu = luJs;
}

// Constructor function
Matrix.create = function(aElements, ignoreLapack) {
    var M = new Matrix().setElements(aElements);
    return M;
};

// Identity matrix of size n
Matrix.I = function(n) {
    var els = [], i = n, j;
    while (i--) {
	j = n;
	els[i] = [];
	while (j--) {
	    els[i][j] = (i == j) ? 1 : 0;
	}
    }
    return Matrix.create(els);
};

Matrix.loadFile = function(file) {
    var contents = fs.readFileSync(file, 'utf-8');
    var matrix = [];

    var rowArray = contents.split('\n');
    for (var i = 0; i < rowArray.length; i++) {
	var d = rowArray[i].split(',');
	if (d.length > 1) {
	    matrix.push(d);
	}
    }

    var M = new Matrix();
    return M.setElements(matrix);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.Diagonal = function(elements) {
    var i = elements.length;
    var M = Matrix.I(i);
    while (i--) {
	M.elements[i][i] = elements[i];
    }
    return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.Rotation = function(theta, a) {
    if (!a) {
	return Matrix.create([
	    [Math.cos(theta), -Math.sin(theta)],
	    [Math.sin(theta), Math.cos(theta)]
	]);
    }
    var axis = a.dup();
    if (axis.elements.length != 3) { return null; }
    var mod = axis.modulus();
    var x = axis.elements[0] / mod, y = axis.elements[1] / mod, z = axis.elements[2] / mod;
    var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
    // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
    // That proof rotates the co-ordinate system so theta
    // becomes -theta and sin becomes -sin here.
    return Matrix.create([
	[t * x * x + c, t * x * y - s * z, t * x * z + s * y],
	[t * x * y + s * z, t * y * y + c, t * y * z - s * x],
	[t * x * z - s * y, t * y * z + s * x, t * z * z + c]
    ]);
};

// Special case rotations
Matrix.RotationX = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[1, 0, 0],
	[0, c, -s],
	[0, s, c]
    ]);
};

Matrix.RotationY = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, 0, s],
	[0, 1, 0],
	[-s, 0, c]
    ]);
};

Matrix.RotationZ = function(t) {
    var c = Math.cos(t), s = Math.sin(t);
    return Matrix.create([
	[c, -s, 0],
	[s, c, 0],
	[0, 0, 1]
    ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function(n, m) {
    if (arguments.length === 1) m = n;
    return Matrix.Zero(n, m).map(
	function() { return Math.random(); }
  );
};

Matrix.Fill = function(n, m, v) {
    if (arguments.length === 2) {
	v = m;
	m = n;
    }

    var els = [], i = n, j;

    while (i--) {
	j = m;
	els[i] = [];

	while (j--) {
	    els[i][j] = v;
	}
    }

    return Matrix.create(els);
};

// Matrix filled with zeros
Matrix.Zero = function(n, m) {
    return Matrix.Fill(n, m, 0);
};

// Matrix filled with zeros
Matrix.Zeros = function(n, m) {
    return Matrix.Zero(n, m);
};

// Matrix filled with ones
Matrix.One = function(n, m) {
    return Matrix.Fill(n, m, 1);
};

// Matrix filled with ones
Matrix.Ones = function(n, m) {
    return Matrix.One(n, m);
};

module.exports = Matrix;

},{"./sylvester":135,"./vector":136,"fs":9,"lapack":30}],134:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
// Plane class - depends on Vector. Some methods require Matrix and Line.
var Vector = require('./vector');
var Matrix = require('./matrix');
var Line = require('./line');

var Sylvester = require('./sylvester');

function Plane() {}
Plane.prototype = {

  // Returns true iff the plane occupies the same space as the argument
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function() {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function(vector) {
    var V = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },

  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  // Returns true iff the plane contains the given point or line
  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Line.create(anchor, direction);
    }
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function(t, line) {
    var R = t.determinant ? t.elements : Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function(anchor, v1, v2) {
    anchor = Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) == 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function(anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

// Returns the plane containing the given points (can be arrays as
// well as vectors). If the points are not coplanar, returns null.
Plane.fromPoints = function(points) {
  var np = points.length, list = [], i, P, n, N, A, B, C, D, theta, prevN, totalN = Vector.Zero(3);
  for (i = 0; i < np; i++) {
    P = Vector.create(points[i]).to3D();
    if (P === null) { return null; }
    list.push(P);
    n = list.length;
    if (n > 2) {
      // Compute plane normal for the latest three points
      A = list[n-1].elements; B = list[n-2].elements; C = list[n-3].elements;
      N = Vector.create([
        (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
        (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
        (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
      ]).toUnitVector();
      if (n > 3) {
        // If the latest normal is not (anti)parallel to the previous one, we've strayed off the plane.
        // This might be a slightly long-winded way of doing things, but we need the sum of all the normals
        // to find which way the plane normal should point so that the points form an anticlockwise list.
        theta = N.angleFrom(prevN);
        if (theta !== null) {
          if (!(Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision)) { return null; }
        }
      }
      totalN = totalN.add(N);
      prevN = N;
    }
  }
  // We need to add in the normals at the start and end points, which the above misses out
  A = list[1].elements; B = list[0].elements; C = list[n-1].elements; D = list[n-2].elements;
  totalN = totalN.add(Vector.create([
    (A[1] - B[1]) * (C[2] - B[2]) - (A[2] - B[2]) * (C[1] - B[1]),
    (A[2] - B[2]) * (C[0] - B[0]) - (A[0] - B[0]) * (C[2] - B[2]),
    (A[0] - B[0]) * (C[1] - B[1]) - (A[1] - B[1]) * (C[0] - B[0])
  ]).toUnitVector()).add(Vector.create([
    (B[1] - C[1]) * (D[2] - C[2]) - (B[2] - C[2]) * (D[1] - C[1]),
    (B[2] - C[2]) * (D[0] - C[0]) - (B[0] - C[0]) * (D[2] - C[2]),
    (B[0] - C[0]) * (D[1] - C[1]) - (B[1] - C[1]) * (D[0] - C[0])
  ]).toUnitVector());
  return Plane.create(list[0], totalN);
};

module.exports = Plane;

},{"./line":131,"./matrix":133,"./sylvester":135,"./vector":136}],135:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.           

Math.sign = function(x) {
    return x < 0 ? -1: 1;
}
                                              
var Sylvester = {
    precision: 1e-6,
    approxPrecision: 1e-5
};

module.exports = Sylvester;

},{}],136:[function(require,module,exports){
// Copyright (c) 2011, Chris Umbel, James Coglan
// This file is required in order for any other classes to work. Some Vector methods work with the
// other Sylvester classes and are useless unless they are included. Other classes such as Line and
// Plane will not function at all without Vector being loaded first.

var Sylvester = require('./sylvester'),
Matrix = require('./matrix');

function Vector() {}
Vector.prototype = {

    norm: function() {
	var n = this.elements.length;
	var sum = 0;

	while (n--) {
	    sum += Math.pow(this.elements[n], 2);
	}

	return Math.sqrt(sum);
    },

    // Returns element i of the vector
    e: function(i) {
      return (i < 1 || i > this.elements.length) ? null : this.elements[i - 1];
    },

    // Returns the number of rows/columns the vector has
    dimensions: function() {
      return {rows: 1, cols: this.elements.length};
    },

    // Returns the number of rows in the vector
    rows: function() {
      return 1;
    },

    // Returns the number of columns in the vector
    cols: function() {
      return this.elements.length;
    },

    // Returns the modulus ('length') of the vector
    modulus: function() {
      return Math.sqrt(this.dot(this));
    },

    // Returns true iff the vector is equal to the argument
    eql: function(vector) {
    	var n = this.elements.length;
    	var V = vector.elements || vector;
    	if (n != V.length) { return false; }
    	while (n--) {
    	    if (Math.abs(this.elements[n] - V[n]) > Sylvester.precision) { return false; }
    	}
    	return true;
    },

    // Returns a copy of the vector
    dup: function() {
	    return Vector.create(this.elements);
    },

    // Maps the vector to another vector according to the given function
    map: function(fn) {
	var elements = [];
	this.each(function(x, i) {
	    elements.push(fn(x, i));
	});
	return Vector.create(elements);
    },

    // Calls the iterator for each element of the vector in turn
    each: function(fn) {
	var n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    fn(this.elements[i], i + 1);
	}
    },

    // Returns a new vector created by normalizing the receiver
    toUnitVector: function() {
	var r = this.modulus();
	if (r === 0) { return this.dup(); }
	return this.map(function(x) { return x / r; });
    },

    // Returns the angle between the vector and the argument (also a vector)
    angleFrom: function(vector) {
	var V = vector.elements || vector;
	var n = this.elements.length, k = n, i;
	if (n != V.length) { return null; }
	var dot = 0, mod1 = 0, mod2 = 0;
	// Work things out in parallel to save time
	this.each(function(x, i) {
	    dot += x * V[i - 1];
	    mod1 += x * x;
	    mod2 += V[i - 1] * V[i - 1];
	});
	mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
	if (mod1 * mod2 === 0) { return null; }
	var theta = dot / (mod1 * mod2);
	if (theta < -1) { theta = -1; }
	if (theta > 1) { theta = 1; }
	return Math.acos(theta);
    },

    // Returns true iff the vector is parallel to the argument
    isParallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (angle <= Sylvester.precision);
    },

    // Returns true iff the vector is antiparallel to the argument
    isAntiparallelTo: function(vector) {
	var angle = this.angleFrom(vector);
	return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
    },

    // Returns true iff the vector is perpendicular to the argument
    isPerpendicularTo: function(vector) {
	var dot = this.dot(vector);
	return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
    },

    // Returns the result of adding the argument to the vector
    add: function(value) {
	var V = value.elements || value;

	if (this.elements.length != V.length) 
	    return this.map(function(v) { return v + value });
	else
	    return this.map(function(x, i) { return x + V[i - 1]; });
    },

    // Returns the result of subtracting the argument from the vector
    subtract: function(v) {
	if (typeof(v) == 'number')
	    return this.map(function(k) { return k - v; });

	var V = v.elements || v;
	if (this.elements.length != V.length) { return null; }
	return this.map(function(x, i) { return x - V[i - 1]; });
    },

    // Returns the result of multiplying the elements of the vector by the argument
    multiply: function(k) {
	return this.map(function(x) { return x * k; });
    },

    elementMultiply: function(v) {
	return this.map(function(k, i) {
	    return v.e(i) * k;
	});
    },

    sum: function() {
	var sum = 0;
	this.map(function(x) { sum += x;});
	return sum;
    },

    chomp: function(n) {
	var elements = [];

	for (var i = n; i < this.elements.length; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    top: function(n) {
	var elements = [];

	for (var i = 0; i < n; i++) {
	    elements.push(this.elements[i]);
	}

	return Vector.create(elements);
    },

    augment: function(elements) {
	var newElements = this.elements;

	for (var i = 0; i < elements.length; i++) {
	    newElements.push(elements[i]);
	}

	return Vector.create(newElements);
    },

    x: function(k) { return this.multiply(k); },

    log: function() {
	return Vector.log(this);
    },

    elementDivide: function(vector) {
	return this.map(function(v, i) {
	    return v / vector.e(i);
	});
    },

    product: function() {
	var p = 1;

	this.map(function(v) {
	    p *= v;
	});

	return p;
    },

    // Returns the scalar product of the vector with the argument
    // Both vectors must have equal dimensionality
    dot: function(vector) {
	var V = vector.elements || vector;
	var i, product = 0, n = this.elements.length;	
	if (n != V.length) { return null; }
	while (n--) { product += this.elements[n] * V[n]; }
	return product;
    },

    // Returns the vector product of the vector with the argument
    // Both vectors must have dimensionality 3
    cross: function(vector) {
	var B = vector.elements || vector;
	if (this.elements.length != 3 || B.length != 3) { return null; }
	var A = this.elements;
	return Vector.create([
	    (A[1] * B[2]) - (A[2] * B[1]),
	    (A[2] * B[0]) - (A[0] * B[2]),
	    (A[0] * B[1]) - (A[1] * B[0])
	]);
    },

    // Returns the (absolute) largest element of the vector
    max: function() {
	var m = 0, i = this.elements.length;
	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
	}
	return m;
    },


    maxIndex: function() {
	var m = 0, i = this.elements.length;
	var maxIndex = -1;

	while (i--) {
	    if (Math.abs(this.elements[i]) > Math.abs(m)) { 
		m = this.elements[i]; 
		maxIndex = i + 1;
	    }
	}

	return maxIndex;
    },


    // Returns the index of the first match found
    indexOf: function(x) {
	var index = null, n = this.elements.length;
	for (var i = 0; i < n; i++) {
	    if (index === null && this.elements[i] == x) {
		index = i + 1;
	    }
	}
	return index;
    },

    // Returns a diagonal matrix with the vector's elements as its diagonal elements
    toDiagonalMatrix: function() {
	return Matrix.Diagonal(this.elements);
    },

    // Returns the result of rounding the elements of the vector
    round: function() {
	return this.map(function(x) { return Math.round(x); });
    },

    // Transpose a Vector, return a 1xn Matrix
    transpose: function() {
	var rows = this.elements.length;
	var elements = [];

	for (var i = 0; i < rows; i++) {
	    elements.push([this.elements[i]]);
	}
	return Matrix.create(elements);
    },

    // Returns a copy of the vector with elements set to the given value if they
    // differ from it by less than Sylvester.precision
    snapTo: function(x) {
	return this.map(function(y) {
	    return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
	});
    },

    // Returns the vector's distance from the argument, when considered as a point in space
    distanceFrom: function(obj) {
	if (obj.anchor || (obj.start && obj.end)) { return obj.distanceFrom(this); }
	var V = obj.elements || obj;
	if (V.length != this.elements.length) { return null; }
	var sum = 0, part;
	this.each(function(x, i) {
	    part = x - V[i - 1];
	    sum += part * part;
	});
	return Math.sqrt(sum);
    },

    // Returns true if the vector is point on the given line
    liesOn: function(line) {
	return line.contains(this);
    },

    // Return true iff the vector is a point in the given plane
    liesIn: function(plane) {
	return plane.contains(this);
    },

    // Rotates the vector about the given object. The object should be a
    // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
    rotate: function(t, obj) {
	var V, R = null, x, y, z;
	if (t.determinant) { R = t.elements; }
	switch (this.elements.length) {
	case 2:
            V = obj.elements || obj;
            if (V.length != 2) { return null; }
            if (!R) { R = Matrix.Rotation(t).elements; }
            x = this.elements[0] - V[0];
            y = this.elements[1] - V[1];
            return Vector.create([
		V[0] + R[0][0] * x + R[0][1] * y,
		V[1] + R[1][0] * x + R[1][1] * y
            ]);
            break;
	case 3:
            if (!obj.direction) { return null; }
            var C = obj.pointClosestTo(this).elements;
            if (!R) { R = Matrix.Rotation(t, obj.direction).elements; }
            x = this.elements[0] - C[0];
            y = this.elements[1] - C[1];
            z = this.elements[2] - C[2];
            return Vector.create([
		C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
		C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
		C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
            ]);
            break;
	default:
            return null;
	}
    },

    // Returns the result of reflecting the point in the given point, line or plane
    reflectionIn: function(obj) {
	if (obj.anchor) {
	    // obj is a plane or line
	    var P = this.elements.slice();
	    var C = obj.pointClosestTo(P).elements;
	    return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
	} else {
	    // obj is a point
	    var Q = obj.elements || obj;
	    if (this.elements.length != Q.length) { return null; }
	    return this.map(function(x, i) { return Q[i - 1] + (Q[i - 1] - x); });
	}
    },

    // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
    to3D: function() {
	var V = this.dup();
	switch (V.elements.length) {
	case 3: break;
	case 2: V.elements.push(0); break;
	default: return null;
	}
	return V;
    },

    // Returns a string representation of the vector
    inspect: function() {
	return '[' + this.elements.join(', ') + ']';
    },

    // Set vector's elements from an array
    setElements: function(els) {
	this.elements = (els.elements || els).slice();
	return this;
    }
};

// Constructor function
Vector.create = function(elements) {
    var V = new Vector();
    return V.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1, 0, 0]);
Vector.j = Vector.create([0, 1, 0]);
Vector.k = Vector.create([0, 0, 1]);

// Random vector of size n
Vector.Random = function(n) {
    var elements = [];
    while (n--) { elements.push(Math.random()); }
    return Vector.create(elements);
};

Vector.Fill = function(n, v) {
    var elements = [];
    while (n--) { elements.push(v); }
    return Vector.create(elements);
};

// Vector filled with zeros
Vector.Zero = function(n) {
    return Vector.Fill(n, 0);
};

Vector.One = function(n) {
    return Vector.Fill(n, 1);
};

Vector.log = function(v) {
    return v.map(function(x) {
	return Math.log(x);
    });
};

module.exports = Vector;

},{"./matrix":133,"./sylvester":135}],137:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],138:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],139:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],140:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":139,"_process":127,"inherits":138}],141:[function(require,module,exports){
(function (__dirname){

exports.version = "3.1";	// this is the WordNet DB version
exports.path = require('path').join(__dirname, "dict");
exports.files = require('fs').readdirSync(exports.path);

}).call(this,"/node_modules/wordnet-db")
},{"fs":9,"path":126}],142:[function(require,module,exports){
var natural = require('natural'),
    tokenizer = new natural.WordTokenizer();
var stemmer = natural.PorterStemmer;

function tokenizeAndStem(command) {
  natural.PorterStemmer.attach();
  return command.tokenizeAndStem();
}

var coreActionMap = {
  'open-documentation': API.Core.openDocumentation,
  'close-documentation': API.Core.closeDocumentation,
  'focus': API.Core.focus,
  'sleep': API.Core.goToSleep,
  'continuous-analysis': API.Core.toggleContinuousAnalysis,
  'stop-speaking': API.Core.stopSpeaking
};

var coreActionCommands = {
  'open-documentation': ['open', 'start', 'menu', 'docs', 'documentation', 'help'],
  'close-documentation': ['close', 'exit', 'menu', 'docs', 'documentation', 'help'],
  'focus': ['wake', 'up', 'hello', TRIGGER_NAME],
  'sleep': ['exit', 'die', 'sleep', TRIGGER_NAME],
  'continuous-analysis': ['analyse', 'analyze', 'continuous'],
  'stop-speaking': ['stop', 'speak', 'shut', 'up', 'quiet', 'halt', 'hold']
};

var searchActionMap = {
  'request-search': API.Search.requestSearch,
  'youtube-search': API.Search.youtubeSearch,
  'google-search': API.Search.googleSearch
};

var searchActionCommands = {
  //search
  'request-search': ['search', 'look up', 'find', 'identify'],
  // google search
  'google': ['google', 'online'],
  //youtube search
  'youtube-search': ['play', 'video']
  //answerQuestion
};

var interactActionMap = {
  'scroll-up': API.Interact.Scroll.medUp,
  'scorll-down': API.Interact.Scroll.medDown,
  'scroll-up-a-little': API.Interact.Scroll.littleUp,
  'scroll-down-a-little': API.Interact.Scroll.littleDown,
  'scroll-up-a-lot': API.Interact.Scroll.bigUp,
  'scroll-down-a-lot': API.Interact.Scroll.bigDown,
  'click-link': API.Interact.Click.handleLink,
  'type': API.Interact.Type.handleTextbox
};

var interactActionCommands = {
  'scroll-up': ['scroll', 'move', 'up', 'above', 'higher'],
  'scroll-down':['scroll', 'move', 'down', 'below', 'lower'],
  'scroll-up-a-little': ['scroll', 'move', 'up', 'above', 'higher', 'little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-down-a-little':['scroll', 'move', 'down', 'below', 'lower','little', 'bit', 'tiny', 'tad', 'slightly'],
  'scroll-up-a-lot': ['scroll', 'move', 'up', 'above', 'higher','a lot', 'ton', 'way'],
  'scroll-down-a-lot':['scroll', 'move', 'down', 'below', 'lower','a lot', 'ton', 'way'],
  'click-link': ['click', 'link'],
  'type': ['type', 'box', 'input']
};

var browserActionMap = {
  'go-back': API.Browser.Window.back,
  'go-forward': API.Browser.Window.forward,
  'refresh-page': API.Browser.Window.refresh,
  'refresh-yourself': API.Browser.Window.refreshApp
};

var browserActionCommands = {
  'go-back': ['go', 'back', 'previous', 'past'],
  'go-forward': ['go', 'forward'],
  'refresh-page': ['refresh', 'reload', 'reset', 'page'],
  'refresh-yourself': ['refresh', 'reload', 'reset', 'you', 'yourself']
};

var tabActionMap ={
  'open-empty-tab': API.Tabs.openEmptyTab,
  'reopen-tabs': API.Tabs.reopenTabs,
  'open-specific-tab': API.Tabs.openSpecificTab,
  'go-to-website': API.Tabs.goToWebsite,
  'discard-non-active': API.Tabs.discardNonActiveAudibleTabs,
  'close-current-tab': API.Tabs.closeCUrrentTab,
  'close-last-tab': API.Tabs.closeLastTab,
  'close-first-tab': API.Tabs.closeFirstTab,
  'close-past-tabs': API.Tabs.closePastTabs,
  'close-recent-tabs': API.Tabs.closeRecentTabs,
  'close-previous-tab': API.Tabs.closePreviousTab,
  'close-previous-tabs': API.Tabs.closePreviousTabs,
  'close-next-tab': API.Tabs.closeNextTab,
  'close-next-tabs': API.Tabs.closeNextTabs,
  'close-specific-tab': API.Tabs.closeSpecificTab,
  'close-specific-tabs': API.Tabs.closeSpecificTabs,
  'memory-save': API.Tabs.discardNonActiveTabs
};

var tabActionCommands = {
  'open-empty-tab': ['open', 'new', 'tab', 'empty', 'another', 'other'],
  'reopen-tabs': ['reopen', 'last', 're-open', 'open', 'previous', 'tabs'],
  'open-specific-tab': ['go to', 'open', 'go to the', 'tab'],
  'go-to-website': ['go to', 'open', 'Google', 'Facebook', 'Youtube'],
  'discard-non-active-audible-tabs': ['discard', 'close', 'non', 'no', 'active', 'audible', 'tabs'],
  'close-current-tab': ['close', 'current', 'tab', 'this'],
  'close-last-tab': ['close', 'last', 'tab', 'previous'],
  'close-first-tab': ['close', 'first', 'tab'],
  'close-past-tabs': ['close', 'past', 'tab'],
  'close-recent-tabs': ['close', 'recent', 'tab'],
  'close-previous-tab': ['close', 'previous', 'tab'],
  'close-previous-tabs': ['close', 'previous', 'tabs'],
  'close-next-tab': ['close', 'next', 'tab'],
  'close-next-tabs': ['close', 'next', 'tabs'],
  'close-specific-tab': ['close', 'specific', 'tab'],
  'close-specific-tabs': ['close', 'discard', 'tabs'],
  'memory-save': ['memory', 'save', 'reduce']
};

var functionMap = Object.assign({}, coreActionMap, interactActionMap, browserActionMap);
var commandMap = Object.assign({}, coreActionCommands, interactActionCommands, browserActionCommands);

function trainNaiveBayes(commands) {
  var classifier = new natural.BayesClassifier();
    for (var key in commands) {
      //makes sure that the key you get is an actual property of an object, and doesn't come from the prototype
      if (commands.hasOwnProperty(key)) {
        classifier.addDocument(commands[key], key);
    }
  }
  classifier.train();
  return classifier;
}

var searchClassifier = trainNaiveBayes(searchActionCommands);
var tabClassifier = trainNaiveBayes(tabActionCommands);
var otherClassifier = trainNaiveBayes(commandMap);

console.log(tabClassifier.classify(['new', 'tab']));

module.exports = {
  searchClassifier, tabClassifier, otherClassifier, tokenizeAndStem, tabActionMap, searchActionMap, functionMap
};
},{"natural":46}]},{},[142])(142)
});