/* eslint-disable no-invalid-this, no-shadow, max-len */
"use strict";

var sinon = require("sinon");
var chai = require("chai");
var expect = require("chai").expect;
var swallow = require("./common").swallow;

describe("Messages", function () {
    describe("about call count", function () {
        it("should be correct for the base cases", function () {
            var spy = sinon.spy();

            expect(function () {
                spy.should.have.been.called;
            }).to.throw("expected spy to have been called at least once, but it was never called");
            expect(function () {
                spy.should.have.been.calledOnce;
            }).to.throw("expected spy to have been called exactly once, but it was never called");
            expect(function () {
                spy.should.have.been.calledTwice;
            }).to.throw("expected spy to have been called exactly twice, but it was never called");
            expect(function () {
                spy.should.have.been.calledThrice;
            }).to.throw("expected spy to have been called exactly thrice, but it was never called");

            expect(function () {
                spy.should.have.callCount(1);
            }).to.throw("expected spy to have been called exactly once, but it was never called");
            expect(function () {
                spy.should.have.callCount(4);
            }).to.throw("expected spy to have been called exactly 4 times, but it was never called");
        });

        it("should be correct for the negated cases", function () {
            var calledOnce = sinon.spy();
            var calledTwice = sinon.spy();
            var calledThrice = sinon.spy();
            var calledFourTimes = sinon.spy();

            calledOnce();
            calledTwice();
            calledTwice();
            calledThrice();
            calledThrice();
            calledThrice();
            calledFourTimes();
            calledFourTimes();
            calledFourTimes();
            calledFourTimes();

            expect(function () {
                calledOnce.should.not.have.been.called;
            }).to.throw("expected spy to not have been called");

            expect(function () {
                calledOnce.should.not.have.been.calledOnce;
            }).to.throw("expected spy to not have been called exactly once");

            expect(function () {
                calledTwice.should.not.have.been.calledTwice;
            }).to.throw("expected spy to not have been called exactly twice");

            expect(function () {
                calledThrice.should.not.have.been.calledThrice;
            }).to.throw("expected spy to not have been called exactly thrice");

            expect(function () {
                calledOnce.should.not.have.callCount(1);
            }).to.throw("expected spy to not have been called exactly once");

            expect(function () {
                calledFourTimes.should.not.have.callCount(4);
            }).to.throw("expected spy to not have been called exactly 4 times");
        });

        describe("passing cases", function () {
            beforeEach(function () {
                this.messages = [];
                chai.use(function (chai, utils) {
                    var originalAssert = chai.Assertion.prototype.assert;
                    var _this = this;
                    chai.Assertion.prototype.assert = function () {
                        var args = [].slice.call(arguments);
                        _this.messages.push(utils.getMessage(this, args));
                        originalAssert.apply(this, args);
                    };
                }.bind(this));
            });

            it("handles at least once", function () {
                var spy = sinon.spy();
                spy();
                spy.should.have.been.called;
                expect(this.messages[0]).to.equal("expected spy to have been called at least once");
            });

            it("handles once", function () {
                var spy = sinon.spy();
                spy();
                spy.should.have.been.calledOnce;
                expect(this.messages[0]).to.equal("expected spy to have been called exactly once");
                spy.should.have.callCount(1);
                expect(this.messages[1]).to.equal("expected spy to have been called exactly once");
            });

            it("handles twice", function () {
                var spy = sinon.spy();
                spy();
                spy();
                spy.should.have.been.calledTwice;
                expect(this.messages[0]).to.equal("expected spy to have been called exactly twice");
            });

            it("handles thrice", function () {
                var spy = sinon.spy();
                spy();
                spy();
                spy();
                spy.should.have.been.calledThrice;
                expect(this.messages[0]).to.equal("expected spy to have been called exactly thrice");
            });

            it("handles arbitrary call count", function () {
                var spy = sinon.spy();
                spy();
                spy();
                spy();
                spy();
                spy.should.have.callCount(4);
                expect(this.messages[0]).to.equal("expected spy to have been called exactly 4 times");
            });
        });
    });

    describe("about call order", function () {
        it("should be correct for the base cases", function () {
            var spyA = sinon.spy();
            var spyB = sinon.spy();

            spyA.displayName = "spyA";
            spyB.displayName = "spyB";

            expect(function () {
                spyA.should.have.been.calledBefore(spyB);
            }).to.throw("expected spyA to have been called before function spyB() {}");

            if (spyA.calledImmediatelyBefore) {
                expect(function () {
                    spyA.should.have.been.calledImmediatelyBefore(spyB);
                }).to.throw("expected spyA to have been called immediately before function spyB() {}");
            }

            expect(function () {
                spyB.should.have.been.calledAfter(spyA);
            }).to.throw("expected spyB to have been called after function spyA() {}");

            if (spyB.calledImmediatelyAfter) {
                expect(function () {
                    spyB.should.have.been.calledImmediatelyAfter(spyA);
                }).to.throw("expected spyB to have been called immediately after function spyA() {}");
            }
        });

        it("should be correct for the negated cases", function () {
            var spyA = sinon.spy();
            var spyB = sinon.spy();

            spyA.displayName = "spyA";
            spyB.displayName = "spyB";

            spyA();
            spyB();

            expect(function () {
                spyA.should.not.have.been.calledBefore(spyB);
            }).to.throw("expected spyA to not have been called before function spyB() {}");

            if (spyA.calledImmediatelyBefore) {
                expect(function () {
                    spyA.should.not.have.been.calledImmediatelyBefore(spyB);
                }).to.throw("expected spyA to not have been called immediately before function spyB() {}");
            }

            expect(function () {
                spyB.should.not.have.been.calledAfter(spyA);
            }).to.throw("expected spyB to not have been called after function spyA() {}");

            if (spyB.calledImmediatelyAfter) {
                expect(function () {
                    spyB.should.not.have.been.calledImmediatelyAfter(spyA);
                }).to.throw("expected spyB to not have been called immediately after function spyA() {}");
            }
        });
    });

    describe("about call context", function () {
        it("should be correct for the basic case", function () {
            var spy = sinon.spy();
            var spyNotCalled = sinon.spy();
            var context = {};
            var badContext = { x: "y" };

            spy.call(badContext);

            var expected = "expected spy to have been called with {  } as this, but it was called with " +
                           spy.printf("%t") + " instead";
            expect(function () {
                spy.should.have.been.calledOn(context);
            }).to.throw(expected);
            expect(function () {
                spy.getCall(0).should.have.been.calledOn(context);
            }).to.throw(expected);

            expect(function () {
                spyNotCalled.should.have.been.calledOn(context);
            }).to.throw("expected spy to have been called with {  } as this, but it was never called");
        });

        it("should be correct for the negated case", function () {
            var spy = sinon.spy();
            var context = {};

            spy.call(context);

            var expected = "expected spy to not have been called with {  } as this";
            expect(function () {
                spy.should.not.have.been.calledOn(context);
            }).to.throw(expected);
            expect(function () {
                spy.getCall(0).should.not.have.been.calledOn(context);
            }).to.throw(expected);
        });

        it("should be correct for the always case", function () {
            var spy = sinon.spy();
            var context = {};
            var badContext = { x: "y" };

            spy.call(badContext);

            var expected = "expected spy to always have been called with {  } as this, but it was called with " +
                           spy.printf("%t") + " instead";
            expect(function () {
                spy.should.always.have.been.calledOn(context);
            }).to.throw(expected);
        });
    });

    describe("about calling with new", function () {
        /* eslint-disable new-cap, no-new */
        it("should be correct for the basic case", function () {
            var spy = sinon.spy();

            spy();

            var expected = "expected spy to have been called with new";
            expect(function () {
                spy.should.have.been.calledWithNew;
            }).to.throw(expected);
            expect(function () {
                spy.getCall(0).should.have.been.calledWithNew;
            }).to.throw(expected);
        });

        it("should be correct for the negated case", function () {
            var spy = sinon.spy();

            new spy();

            var expected = "expected spy to not have been called with new";
            expect(function () {
                spy.should.not.have.been.calledWithNew;
            }).to.throw(expected);
            expect(function () {
                spy.getCall(0).should.not.have.been.calledWithNew;
            }).to.throw(expected);
        });

        it("should be correct for the always case", function () {
            var spy = sinon.spy();

            new spy();
            spy();

            var expected = "expected spy to always have been called with new";
            expect(function () {
                spy.should.always.have.been.calledWithNew;
            }).to.throw(expected);
        });
        /* eslint-enable new-cap, no-new */
    });

    describe("about call arguments", function () {
        it("should be correct for the basic cases", function () {
            var spy = sinon.spy();
            var spyNotCalled = sinon.spy();

            spy(1, 2, 3);

            expect(function () {
                spy.should.have.been.calledWith("a", "b", "c");
            }).to.throw("xpected spy to have been called with arguments a, b, c\n\n    The following calls were made:\n\n    spy(1, 2, 3)");
            expect(function () {
                spy.should.have.been.calledWithExactly("a", "b", "c");
            }).to.throw("expected spy to have been called with exact arguments a, b, c\n\n    The following calls were made:\n\n    spy(1, 2, 3)");
            expect(function () {
                spy.should.have.been.calledWithMatch(sinon.match("foo"));
            }).to.throw("expected spy to have been called with arguments matching match(\"foo\")\n\n    The following calls were made:\n\n    spy(1, 2, 3)");

            expect(function () {
                spy.getCall(0).should.have.been.calledWith("a", "b", "c");
            }).to.throw("expected spy to have been called with arguments a, b, c\n\n    The following calls were made:\n\n    spy(1, 2, 3)");
            expect(function () {
                spy.getCall(0).should.have.been.calledWithExactly("a", "b", "c");
            }).to.throw("expected spy to have been called with exact arguments a, b, c\n\n    The following calls were made:\n\n    spy(1, 2, 3)");
            expect(function () {
                spy.getCall(0).should.have.been.calledWithMatch(sinon.match("foo"));
            }).to.throw("expected spy to have been called with arguments matching match(\"foo\")\n\n    The following calls were made:\n\n    spy(1, 2, 3)");

            expect(function () {
                spyNotCalled.should.have.been.calledWith("a", "b", "c");
            }).to.throw("expected spy to have been called with arguments a, b, c, but it was never called");
            expect(function () {
                spyNotCalled.should.have.been.calledWith("a", "b", "c");
            }).not.to.throw("The following calls");
            expect(function () {
                spyNotCalled.should.have.been.calledWithExactly("a", "b", "c");
            }).to.throw("expected spy to have been called with exact arguments a, b, c, but it was never called");
            expect(function () {
                spyNotCalled.should.have.been.calledWithExactly("a", "b", "c");
            }).not.to.throw("The following calls");
            expect(function () {
                spyNotCalled.should.have.been.calledWithMatch(sinon.match("foo"));
            }).to.throw("expected spy to have been called with arguments matching match(\"foo\"), but it was never called");
            expect(function () {
                spyNotCalled.should.have.been.calledWithMatch(sinon.match("foo"));
            }).not.to.throw("The following calls");
        });

        it("should be correct for the negated cases", function () {
            var spy = sinon.spy();

            spy(1, 2, 3);

            expect(function () {
                spy.should.not.have.been.calledWith(1, 2, 3);
            }).to.throw("expected spy to not have been called with arguments 1, 2, 3");
            expect(function () {
                spy.should.not.have.been.calledWithExactly(1, 2, 3);
            }).to.throw("expected spy to not have been called with exact arguments 1, 2, 3");
            expect(function () {
                spy.should.not.have.been.calledWithMatch(sinon.match(1));
            }).to.throw("expected spy to not have been called with arguments matching match(1)");

            expect(function () {
                spy.getCall(0).should.not.have.been.calledWith(1, 2, 3);
            }).to.throw("expected spy to not have been called with arguments 1, 2, 3");
            expect(function () {
                spy.getCall(0).should.not.have.been.calledWithExactly(1, 2, 3);
            }).to.throw("expected spy to not have been called with exact arguments 1, 2, 3");
            expect(function () {
                spy.getCall(0).should.not.have.been.calledWithMatch(sinon.match(1));
            }).to.throw("expected spy to not have been called with arguments matching match(1)");
        });

        it("should be correct for the always cases", function () {
            var spy = sinon.spy();

            spy(1, 2, 3);
            spy("a", "b", "c");

            var expected = /expected spy to always have been called with arguments 1, 2, 3/;
            expect(function () {
                spy.should.always.have.been.calledWith(1, 2, 3);
            }).to.throw(expected);

            var expectedExactly = /expected spy to always have been called with exact arguments 1, 2, 3/;
            expect(function () {
                spy.should.always.have.been.calledWithExactly(1, 2, 3);
            }).to.throw(expectedExactly);

            var expectedMatch = /expected spy to always have been called with arguments matching match\(1\)/;
            expect(function () {
                spy.should.always.have.been.calledWithMatch(sinon.match(1));
            }).to.throw(expectedMatch);
        });
    });

    describe("about returning", function () {
        it("should be correct for the basic case", function () {
            var spy = sinon.spy.create(function () {
                return 1;
            });
            var spyNotCalled = sinon.spy.create(function () {
                return 1;
            });

            spy();

            expect(function () {
                spy.should.have.returned(2);
            }).to.throw("expected spy to have returned 2");
            expect(function () {
                spy.getCall(0).should.have.returned(2);
            }).to.throw("expected spy to have returned 2");
            expect(function () {
                spyNotCalled.should.have.returned(2);
            }).to.throw("expected spy to have returned 2, but it was never called");
        });

        it("should be correct for the negated case", function () {
            var spy = sinon.spy.create(function () {
                return 1;
            });

            spy();

            expect(function () {
                spy.should.not.have.returned(1);
            }).to.throw("expected spy to not have returned 1");
            expect(function () {
                spy.getCall(0).should.not.have.returned(1);
            }).to.throw("expected spy to not have returned 1");
        });

        it("should be correct for the always case", function () {
            var spy = sinon.spy.create(function () {
                return 1;
            });

            spy();

            expect(function () {
                spy.should.always.have.returned(2);
            }).to.throw("expected spy to always have returned 2");
        });
    });

    describe("about throwing", function () {
        it("should be correct for the basic cases", function () {
            var spy = sinon.spy();
            var throwingSpy = sinon.spy.create(function () {
                throw new Error();
            });

            spy();
            swallow(throwingSpy);

            expect(function () {
                spy.should.have.thrown();
            }).to.throw("expected spy to have thrown");
            expect(function () {
                spy.getCall(0).should.have.thrown();
            }).to.throw("expected spy to have thrown");

            expect(function () {
                throwingSpy.should.have.thrown("TypeError");
            }).to.throw("expected spy to have thrown TypeError");
            expect(function () {
                throwingSpy.getCall(0).should.have.thrown("TypeError");
            }).to.throw("expected spy to have thrown TypeError");

            expect(function () {
                throwingSpy.should.have.thrown({ message: "x" });
            }).to.throw('expected spy to have thrown { message: "x" }');
            expect(function () {
                throwingSpy.getCall(0).should.have.thrown({ message: "x" });
            }).to.throw('expected spy to have thrown { message: "x" }');
        });

        it("should be correct for the negated cases", function () {
            var error = new Error("boo!");
            var spy = sinon.spy.create(function () {
                throw error;
            });

            swallow(spy);

            expect(function () {
                spy.should.not.have.thrown();
            }).to.throw("expected spy to not have thrown");
            expect(function () {
                spy.getCall(0).should.not.have.thrown();
            }).to.throw("expected spy to not have thrown");

            expect(function () {
                spy.should.not.have.thrown("Error");
            }).to.throw("expected spy to not have thrown Error");
            expect(function () {
                spy.getCall(0).should.not.have.thrown("Error");
            }).to.throw("expected spy to not have thrown Error");

            expect(function () {
                spy.should.not.have.thrown(error);
            }).to.throw("expected spy to not have thrown Error: boo!");
            expect(function () {
                spy.getCall(0).should.not.have.thrown(error);
            }).to.throw("expected spy to not have thrown Error: boo!");
        });

        it("should be correct for the always cases", function () {
            var spy = sinon.spy();
            var throwingSpy = sinon.spy.create(function () {
                throw new Error();
            });

            spy();
            swallow(throwingSpy);

            expect(function () {
                spy.should.have.always.thrown();
            }).to.throw("expected spy to always have thrown");

            expect(function () {
                throwingSpy.should.have.always.thrown("TypeError");
            }).to.throw("expected spy to always have thrown TypeError");

            expect(function () {
                throwingSpy.should.have.always.thrown({ message: "x" });
            }).to.throw('expected spy to always have thrown { message: "x" }');
        });
    });

    describe("diff support", function () {
        it("should add actual/expected and set enableDiff to true", function () {
            var spy = sinon.spy();
            spy("foo1");

            var err;

            try {
                expect(spy).to.have.been.calledWith("bar");
            } catch (e) {
                err = e;
            }
            expect(err).ok;
            expect(err).to.ownProperty("showDiff", true);
            expect(err).to.ownProperty("actual").deep.eq(["foo1"]);
            expect(err).to.ownProperty("expected").deep.eq(["bar"]);
        });

        it("should use lastCall args if exists", function () {
            var spy = sinon.spy();
            spy("foo1");
            spy("foo2");

            var err;

            try {
                expect(spy).to.have.been.calledWith("bar");
            } catch (e) {
                err = e;
            }
            expect(err).ok;
            expect(err).to.ownProperty("showDiff", true);
            expect(err).to.ownProperty("actual").deep.eq(["foo2"]);
            expect(err).to.ownProperty("expected").deep.eq(["bar"]);
        });

        it("should use args if no lastCall", function () {
            var spy = sinon.spy();
            spy("foo1");
            spy("foo2");

            var err;

            try {
                expect(spy.firstCall).to.have.been.calledWith("bar");
            } catch (e) {
                err = e;
            }
            expect(err).ok;
            expect(err).to.ownProperty("showDiff", true);
            expect(err).to.ownProperty("actual").deep.eq(["foo1"]);
            expect(err).to.ownProperty("expected").deep.eq(["bar"]);
        });

        it("should use undefined if no call", function () {
            var spy = sinon.spy();

            var err;

            try {
                expect(spy).to.have.been.calledWith("bar");
            } catch (e) {
                err = e;
            }
            expect(err).ok;
            expect(err).to.ownProperty("showDiff", true);
            expect(err).to.ownProperty("actual").deep.eq(undefined);
            expect(err).to.ownProperty("expected").deep.eq(["bar"]);
        });

        it("should not add actual/expected and set enableDiff to true if passes", function () {
            var spy = sinon.spy();
            spy("foo", "bar", "baz");

            var err;

            try {
                spy.should.calledWithExactly("foo", "bar", "baz");
            } catch (e) {
                err = e;
            }
            expect(err).to.be.undefined;
        });

        it("should not add actual/expected and set enableDiff if not 'calledWith' matcher", function () {
            var spy = sinon.spy();
            spy("foo", "bar", "baz");

            var err;

            try {
                expect(spy).to.have.been.calledTwice();
            } catch (e) {
                err = e;
            }
            expect(err).ownProperty("showDiff").eq(false);
        });
    });

    describe("when used on a non-spy/non-call", function () {
        function notSpy() {
            // Contents don't matter
        }

        it("should be informative for properties", function () {
            expect(function () {
                notSpy.should.have.been.called;
            }).to.throw(TypeError, /not a spy/);
        });

        it("should be informative for methods", function () {
            expect(function () {
                notSpy.should.have.been.calledWith("foo");
            }).to.throw(TypeError, /not a spy/);
        });
    });

    it("should not trigger getters for passing assertions", function () {
        var obj = {};
        var getterCalled = false;
        Object.defineProperty(obj, "getter", {
            get: function () {
                getterCalled = true;
            },
            enumerable: true
        });

        var spy = sinon.spy();

        spy(obj);

        spy.should.have.been.calledWith(obj);

        expect(getterCalled).to.be.false;
    });
});