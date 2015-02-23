Date.prototype
===
v3.5.0 Jun 2012

Date.prototype provides JavaScript Date instance methods for parsing, formatting, and calculating dates. It uses a concise and configurable algorithm for interpreting format codes.

Features include:

 * Parses almost any format with ability to register custom format parsing.
 * Supports formatting codes for sprintf, php, and SQL with the ability to register custom formating.
 * Adds and subtracts years, months, days, hours, minutes or seconds.
 * Calculates differences between dates in a given unit.
 * Methods are available on all Date Objects.

Examples:

```javascript
$D('2006-09-20').strftime('%m/%d/%Y'); // "09/20/2006"
$D('Sep 20 2006').add(3).strftime('%Y-%m-%d'); // "2006-09-23"
$D('09/20/2006').add(4, 'years').strftime('%Y-%m-%d'); // "2010-09-20"
$D('09/20/2006 20:15:00').add(4, 'hours').format('%Y-%m-%d %H:%M:%S'); // "2006-09-21 00:15:00"
$D('2006-09-20').format('m/d/Y'); // "09/20/2006"
$D('2006.09.28').diff('20 Sep, 2006', 'days'); // 8
```

See [reference.html](http://sandbox.kendsnyder.com/reference.html) for demo and complete guide
[Unit Tests](http://sandbox.kendsnyder.com/unit-tests.html) for demo and complete guide

ChangeLog
===

v3.5 Jun 2012

* Add Date#equals, Date#isBefore, Date#isAfter
* Add Date#schedule, Date#unschedule, Date#getSchedule
* Add Date.Timer class
* Centralize Date parse patterns

v3.4 Apr 2012

* Fix UTC Offset handling
* Recognize Chicago dates that are missing a comma
* Recognize Conversational dates that have leading weekday name
* Recognize 24-hour time that contains "GMT" and/or timezone name (e.g. native JS toString() format)
* Recognize date expressions with millisecond units (e.g. "in 250 milliseconds", "250 milliseconds ago")
* Recognize + and - date expressions (e.g. "+2 hours", "-3 years")
* Recognize ASP JSON format (e.g. "/Date(1296824894700)/", "/Date(1296824894700-0700)/") 
* Use strict mode

v3.3 Dec 2011

* Fixed documentation of Date#setUTCOffsetString
* Ability to parse ISO-8601 dates containing timezone
* Ability to parse RFC 2822 dates

v3.2 Jul 2011

* Add ability to easily add and remove parse patterns
* Update inline documentation to work with JSDoc
* Update 12-hour regex to allow leading 0s

v3.1 Feb 2011

* Update month addition/subtraction behavior: When new month has fewer days than original, go to last day of month instead of wrapping to next month.
* Remove use of named function expressions

v3.0 Oct 2010

* Initial push to Github
* Unit tests using QUnit
* Add support for PHP format codes L, t and e

v2.0 Sep 2008

* Initial public release
* Add unit tests
* Create reference.html

v1.0 Dec 2005

* Initial private release


[Full Github History](https://github.com/kensnyder/date-prototype/commits/master/)
