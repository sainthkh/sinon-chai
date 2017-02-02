(function (sinonChai) {
    "use strict";

    // Module systems magic dance.

    /* istanbul ignore else */
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // NodeJS
        module.exports = sinonChai;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function () {
            return sinonChai;
        });
    } else {
        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use(sinonChai);
    }
}(function sinonChai(chai, utils) {
    "use strict";

    var slice = Array.prototype.slice;

    function isSpy(putativeSpy) {
        return typeof putativeSpy === "function" &&
               typeof putativeSpy.getCall === "function" &&
               typeof putativeSpy.calledWithExactly === "function";
    }

    function timesInWords(count) {
        return count === 1 ? "once" :
               count === 2 ? "twice" :
               count === 3 ? "thrice" :
               (count || 0) + " times";
    }

    function isCall(putativeCall) {
        return putativeCall && isSpy(putativeCall.proxy);
    }

    function assertCanWorkWith(assertion) {
        if (!isSpy(assertion._obj) && !isCall(assertion._obj)) {
            throw new TypeError(utils.inspect(assertion._obj) + " is not a spy or a call to a spy!");
        }
    }

    function getMessages(passed, spy, action, passedSuffix, failedSuffix, always, args) {
        var verbPhrase = always ? "always have " : "have ";
        passedSuffix = passedSuffix || "";
        failedSuffix = failedSuffix  || "";
        if (isSpy(spy.proxy)) {
            spy = spy.proxy;
        }

        function printfArray(array) {
            return spy.printf.apply(spy, array);
        }

        return {
            affirmative: function () {
                var message = "expected %n to " + verbPhrase + action + (passed ? passedSuffix : failedSuffix);
                return printfArray([message].concat(args));
            },
            negative: function () {
                return printfArray(["expected %n to not " + verbPhrase + action].concat(args));
            }
        };
    }

    function sinonProperty(name, action, passedSuffix, failedSuffix) {
        utils.addProperty(chai.Assertion.prototype, name, function () {
            assertCanWorkWith(this);

            var expression = this._obj[name]
            var passed = utils.test(this, [expression])
            var messages = getMessages(passed, this._obj, action, passedSuffix, failedSuffix, false);
            this.assert(expression, messages.affirmative, messages.negative);
        });
    }

    function sinonPropertyAsBooleanMethod(name, action, passedSuffix, failedSuffix) {
        utils.addMethod(chai.Assertion.prototype, name, function (arg) {
            assertCanWorkWith(this);

            var expression = this._obj[name] === arg
            var passed = utils.test(this, [expression])
            var messages = getMessages(passed, this._obj, action, passedSuffix, failedSuffix, false, [timesInWords(arg)]);
            this.assert(expression, messages.affirmative, messages.negative);
        });
    }

    function createSinonMethodHandler(sinonName, action, passedSuffix, failedSuffix) {
        return function () {
            assertCanWorkWith(this);

            var alwaysSinonMethod = "always" + sinonName[0].toUpperCase() + sinonName.substring(1);
            var shouldBeAlways = utils.flag(this, "always") && typeof this._obj[alwaysSinonMethod] === "function";
            var sinonMethod = shouldBeAlways ? alwaysSinonMethod : sinonName;

            var expression = this._obj[sinonMethod].apply(this._obj, arguments)
            var passed = utils.test(this, [expression])
            var messages = getMessages(passed, this._obj, action, passedSuffix, failedSuffix, shouldBeAlways, slice.call(arguments));
            this.assert(expression, messages.affirmative, messages.negative);
        };
    }

    function sinonMethodAsProperty(name, action, passedSuffix, failedSuffix) {
        var handler = createSinonMethodHandler(name, action, passedSuffix, failedSuffix);
        utils.addProperty(chai.Assertion.prototype, name, handler);
    }

    function exceptionalSinonMethod(chaiName, sinonName, action, passedSuffix, failedSuffix) {
        var handler = createSinonMethodHandler(sinonName, action, passedSuffix, failedSuffix);
        utils.addMethod(chai.Assertion.prototype, chaiName, handler);
    }

    function sinonMethod(name, action, passedSuffix, failedSuffix) {
        exceptionalSinonMethod(name, name, action, passedSuffix, failedSuffix);
    }

    utils.addProperty(chai.Assertion.prototype, "always", function () {
        utils.flag(this, "always", true);
    });

    var calls = "\n\n    The following calls were made:\n%C";

    sinonProperty("called", "been called", " at least once", " at least once, but it was never called");
    sinonPropertyAsBooleanMethod("callCount", "been called exactly %1", "", ", but it was called %c" + calls);
    sinonProperty("calledOnce", "been called exactly once", "", ", but it was called %c" + calls);
    sinonProperty("calledTwice", "been called exactly twice", "", ", but it was called %c" + calls);
    sinonProperty("calledThrice", "been called exactly thrice", "", ", but it was called %c" + calls);
    sinonMethodAsProperty("calledWithNew", "been called with new");
    sinonMethod("calledBefore", "been called before %1");
    sinonMethod("calledAfter", "been called after %1");
    sinonMethod("calledOn", "been called with %1 as this", "", ", but it was called with %t instead");
    sinonMethod("calledWith", "been called with arguments %*", "", calls);
    sinonMethod("calledWithExactly", "been called with exact arguments %*", "", calls);
    sinonMethod("calledWithMatch", "been called with arguments matching %*", "", calls);
    sinonMethod("returned", "returned %1");
    exceptionalSinonMethod("thrown", "threw", "thrown %1");
}));
