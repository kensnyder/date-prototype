/**
 * Date instance methods
 *
 * @author Ken Snyder (ken d snyder at gmail dot com)
 * @date October 2010
 * @version 3.0 (http://kendsnyder.com/sandbox/date/)
 * @license Creative Commons Attribution License 3.0 (http://creativecommons.org/licenses/by/3.0/)
 */
// begin by creating a scope for utility variables
(function (global) {
	//
	// pre-calculate the number of milliseconds in a day
	//
	var day = 24 * 60 * 60 * 1000;
	//
	// function to add leading zeros
	//
	function zeroPad(number, digits) {
		number = number+'';
		var cnt = digits - number.length;
		if (cnt <= 0) {
			return number;
		}
		return Array(cnt + 1).join('0') + number;
	}
	function extend(d, s) {
		for (var p in s) {
			if (Object.prototype.hasOwnProperty.call(s, p)) {
				d[p] = s[p];
			}
		}
	}
	//
	// set up integers and functions for adding to a date or subtracting two dates
	//
	var multipliers = {
		millisecond: 1,
		second: 1000,
		minute: 60 * 1000,
		hour: 60 * 60 * 1000,
		day: day,
		week: 7 * day,
		month: {
			// add a number of months
			add: function addMonth(d, number) {
				var prevDay = d.getDate();
				// add any years needed (increments of 12)
				multipliers.year.add(d, Math[number > 0 ? 'floor' : 'ceil'](number / 12));
				// ensure that we properly wrap betwen December and January
				var prevMonth = d.getMonth() + (number % 12);
				if (prevMonth == 12) {
					prevMonth = 0;
					d.setYear(d.getFullYear() + 1);
				} else if (prevMonth == -1) {
					prevMonth = 11;
					d.setYear(d.getFullYear() - 1);
				}
				d.setMonth(prevMonth);
				if (d.getDate() != prevDay) {
					// new month has fewer days in the month than previous/next month
					// so JavaScript will wrap over to next month
					d.add(-1, 'month');
					d.setDate(d.daysInMonth());
				}
			},
			// get the number of months between two Date objects (decimal to the nearest day)
			diff: function diffMonth(d1, d2) {
				// get the number of years
				var diffYears = d1.getFullYear() - d2.getFullYear();
				// get the number of remaining months
				var diffMonths = d1.getMonth() - d2.getMonth() + (diffYears * 12);
				// get the number of remaining days
				var diffDays = d1.getDate() - d2.getDate();
				// return the month difference with the days difference as a decimal
				return diffMonths + (diffDays / 30);
			}
		},
		year: {
			// add a number of years
			add: function addYear(d, number) {
				d.setYear(d.getFullYear() + Math[number > 0 ? 'floor' : 'ceil'](number));
			},
			// get the number of years between two Date objects (decimal to the nearest day)
			diff: function diffYear(d1, d2) {
				return multipliers.month.diff(d1, d2) / 12;
			}
		}
	};
	//
	// alias each multiplier with an 's' to allow 'year' and 'years' for example
	//
	var m = multipliers;
	m.milliseconds = m.millisecond;
	m.seconds = m.second;
	m.minutes = m.minute;
	m.hours = m.hour;
	m.weeks = m.week;
	m.days = m.day;
	m.months = m.month;
	m.years = m.year;
	//
	// Add methods to Date instances
	//
	var instanceMethods = {
		//
		// Return a date one day ahead (or any other unit)
		//
		// @param string unit
		// units: year | month | day | week | hour | minute | second | millisecond
		// @return object Date
		//
		succ: function succ(unit) {
			return this.clone().add(1, unit);
		},
		//
		// Add an arbitrary amount to the currently stored date
		//
		// @param integer/float number
		// @param string unit
		// @return object Date (chainable)
		//
		add: function add(number, unit) {
			var factor = multipliers[unit] || multipliers.day;
			if (typeof factor == 'number') {
				this.setTime(this.getTime() + (factor * number));
			} else {
				factor.add(this, number);
			}
			return this;
		},
		//
		// Find the difference between the current and another date
		//
		// @param string/object dateObj
		// @param string unit
		// @param boolean allowDecimal
		// @return integer/float
		//
		diff: function diff(dateObj, unit, allowDecimal) {
			// ensure we have a Date object
			dateObj = Date.create(dateObj);
			if (dateObj === null) return null;
			// get the multiplying factor integer or factor function
			var factor = multipliers[unit] || multipliers.day;
			if (typeof factor == 'number') {
				// multiply
				var unitDiff = (this.getTime() - dateObj.getTime()) / factor;
			} else {
				// run function
				var unitDiff = factor.diff(this, dateObj);
			}
			// if decimals are not allowed, round toward zero
			return (allowDecimal ? unitDiff : Math[unitDiff > 0 ? 'floor' : 'ceil'](unitDiff));
		},

		_applyFormat: function _applyFormat(formatStr, formatting) {
			// default the format string to year-month-day
			var source = formatStr || formatting.defaultFormat, result = '', match;
			// replace each format code
			while (source.length > 0) {
				if (match = source.match(formatting.matcher)) {
					result += source.slice(0, match.index);
					result += (match[1] || '') + this._applyFormatChar(match[2], formatting);
					source = source.slice(match.index + match[0].length);
				} else {
					result += source, source = '';
				}
			}
			return result;
		},
		//
		// take a date instance and a format code and return the formatted value
		//
		_applyFormatChar: function _applyFormatChar(code, formatting) {
			if (formatting.shortcuts[code]) {
				// process any shortcuts recursively
				return this._applyFormat(formatting.shortcuts[code], formatting);
			}
			else {
				// get the format code function and toPaddedString() argument
				var getter = (formatting.codes[code] || '').split('.');
				var nbr = this['get' + getter[0]] ? this['get' + getter[0]]() : '';
				// zeroPad if specified
				if (getter[1]) {
					nbr = zeroPad(nbr, getter[1]);
				}
				// prepend the leading character
				return nbr;
			}
		},
		format: function format(formatStr) {
			formatStr = formatStr || Date.formatting.strftime.defaultFormat;
			if (formatStr.indexOf('%') > -1) {
				return this.strftime(formatStr);
			}
			return this.formatPhp(formatStr);
		},
		//
		// Return a proper two-digit year integer
		//
		// @return integer
		//
		getShortYear: function getShortYear() {
			return this.getYear() % 100;
		},
		//
		// Get the number of the current month, 1-12
		//
		// @return integer
		//
		getMonthNumber: function getMonthNumber() {
			return this.getMonth() + 1;
		},
		//
		// Get the name of the current month
		//
		// @return string
		//
		getMonthName: function getMonthName() {
			return Date.MONTHNAMES[this.getMonth()];
		},
		//
		// Get the abbreviated name of the current month
		//
		// @return string
		//
		getAbbrMonthName: function getAbbrMonthName() {
			return Date.ABBR_MONTHNAMES[this.getMonth()];
		},
		//
		// Get the name of the current week day
		//
		// @return string
		//
		getDayName: function getDayName() {
			return Date.DAYNAMES[this.getDay()];
		},
		//
		// Get the abbreviated name of the current week day
		//
		// @return string
		//
		getAbbrDayName: function getAbbrDayName() {
			return Date.ABBR_DAYNAMES[this.getDay()];
		},
		//
		// Get the ordinal string associated with the day of the month (i.e. st, nd, rd, th)
		//
		// @return string
		//
		getDayOrdinal: function getDayOrdinal() {
			return Date.ORDINALNAMES[this.getDate() % 10];
		},
		//
		// Get the current hour on a 12-hour scheme
		//
		// @return integer
		//
		getHours12: function getHours12() {
			var hours = this.getHours();
			return hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours);
		},
		//
		// Get the AM or PM for the current time
		//
		// @return string
		//
		getAmPm: function getAmPm() {
			return this.getHours() >= 12 ? 'PM' : 'AM';
		},
		//
		// Get the AM or PM for the current time (lowercase)
		//
		// @return string
		//
		getAmPmLower: function getAmPmLower() {
			return this.getHours() >= 12 ? 'pm' : 'am';
		},
		//
		// Get the current date as a Unix timestamp
		//
		// @return integer
		//
		getUnix: function getUnix() {
			return Math.round(this.getTime() / 1000, 0);
		},
		//
		// Get the GMT offset in hours and minutes (e.g. +06:30)
		//
		// @return string
		//
		getUTCOffset: function getUTCOffset() {
			// divide the minutes offset by 60
			var hours = this.getTimezoneOffset() / 60;
			// decide if we are ahead of or behind GMT
			var prefix = hours < 0 ? '+' : '-';
			// remove the negative sign if any
			hours = Math.abs(hours);
			// add the +/- to the padded number of hours to : to the padded minutes
			return prefix + zeroPad(Math.floor(hours), 2) + ':' + zeroPad((hours % 1) * 60, 2);
		},
		setUTCOffset: function setUTCOffset(seconds) {
			var curr = this.getTimezoneOffset();
			var utcNow = this.getTime() + (curr * 60000);
			this.setTime(utcNow - (seconds * 60000));
			return this;
		},
		//
		// Get the GMT offset in hours and minutes - digits only (e.g. +0630)
		//
		// @return string
		//
		getUTCOffsetNumber: function getUTCOffsetNumber() {
			return this.getUTCOffset().replace(':','');
		},
		//
		// Get the browser-reported name for the current timezone (e.g. MDT, Mountain Daylight Time)
		//
		// @return string
		//
		getTimezoneName: function getTimezoneName() {
			var match = /(?:\((.+)\)$| ([A-Z]{3}) )/.exec(this.toString());
			return match[1] || match[2] || 'GMT' + this.getUTCOffset();
		},
		//
		// Convert the current date to an 8-digit integer (%Y%m%d)
		//
		// @return int
		//
		toYmdInt: function toYmdInt() {
			return (this.getFullYear() * 10000) + (this.getMonthNumber() * 100) + this.getDate();
		},
		//
		// Create a copy of a date object
		//
		// @return object
		//
		clone: function clone() {
			return new Date(this.getTime());
		},
		diffText: function diffText() {
			var seconds = this.diff(Date.current(), 'seconds');
			var diff = Math.abs(seconds);
			var rawText;
			if (diff < 120) {
				// less than two minutes ago
				return seconds >= 0 ? 'in a moment' : 'moments ago';

			} else if (diff < 3600) {
				// 2 to 59 minutes ago
				rawText = floor(diff / 60) + " minutes";

			} else if (diff < 86400) {
				// less than 24 hours ago
				var hours = floor(diff / 3600);
				var s = hour == 1 ? '' : 's';
				rawText = hours + " hour" + s + " ago";

			} else if (diff < 172800) {
				// yesterday
				return seconds > 0 ? 'tomorrow' : 'yesterday';

			} else if (diff < 604800) {
				// 2 to 6 days ago
				rawText = floor(diff / 86400) + " days";

			} else if (diff < 1209600) {
				// within 14 days
				return seconds > 0 ? 'next week' : 'last week';

			} else if (diff < 2419200) {
				// within 28 days
				rawText = floor(diff / 604800) + " weeks";

			} else if (diff < 5184000) {
				// within 60 days
				return seconds > 0 ? 'next month' : 'last month';

			}	else if (diff < 31536000) {
				// within 365 days
				rawText = floor(diff / 2592000) + " months";

			} else if (diff < 63072000) {
				// within 730 days
				return seconds > 0 ? 'next year' : 'last year';

			} else {
				// years ago
				rawText = floor(diff / 31536000) + " years";

			}
			return seconds > 0 ? 'in ' + rawText : rawText + ' ago';
		},
		daysInMonth: function daysInMonth() {
			return Date.daysInMonth(this.getFullYear(), this.getMonth()+1);
		},
		isLeapYear: function isLeapYear() {
			return Date.daysInMonth(this.getFullYear(), 1) == 29 ? 1 : 0;
		}
	};
	extend(Date.prototype, instanceMethods);
	// ES5 Shim
	if (!Date.prototype.toISOString) {
		Date.prototype.toISOString = function toISOString() {
			return this.setUTCOffset(0).strftime(Date.ISO);
		};
	}
	//
	// Add static methods to the date object
	//
	var staticMethods = {
		//
		// The heart of the date functionality: returns a date object if given a convertable value
		//
		// @param string/object/integer date
		// @return object Date
		//
		create: function create(date) {
			// 0 arguments or date is undefined
			if (typeof date == 'undefined') {
				return Date.current();
			}
			// If the passed value is already a date object, return it
			if (date instanceof Date) {
				return date;
			}
			var a = arguments;
			switch (a.length) {
				case 1:
					// If the passed value is an integer, interpret it as ms past epoch
					if (Object.prototype.toString.call(date) == '[object Number]') {
						return new Date(date);
					}

					var date = String(date).replace(/^\s*(.*)\s*$/, '$1');
					if (date === '') {
						return Date.current();
					}
					var i = 0, pattern, ms, obj, match;
					while ((pattern = Date.create.patterns[i++])) {
						if (!(match = date.match(pattern[0]))) {
							continue;
						}
						if (typeof pattern[1] == 'function') {
							obj = pattern[1](match, date);
							if (obj instanceof Date) {
								return obj;
							}
						} else {
							ms = Date.parse(date.replace(pattern[0], pattern[1]));
							if (!isNaN(ms)) {
								return new Date(ms);
							}
						}
					}
					return NaN;
				case 2: return new Date(a[0], a[1], 1);
				case 3: return new Date(a[0], a[1], a[2]);
				case 4: return new Date(a[0], a[1], a[2], a[3]);
				case 5: return new Date(a[0], a[1], a[2], a[3], a[4]);
				case 6: return new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
				default:return new Date(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
			}
		},
		//
		// constants representing month names, day names, and ordinal names
		// (same names as Ruby Date constants)
		//
		MONTHNAMES      : 'January February March April May June July August September October November December'.split(' '),
		ABBR_MONTHNAMES : 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		DAYNAMES        : 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
		ABBR_DAYNAMES   : 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
		ORDINALNAMES    : 'th st nd rd th th th th th th'.split(' '),
		//
		// Shortcut for full ISO-8601 date conversion
		//
		ISO: '%Y-%m-%dT%H:%M:%S.%N%G',
		//
		// Shortcut for SQL-type formatting
		//
		SQL: '%Y-%m-%d %H:%M:%S',
		SCRIPT_LOAD: new Date,
		//
		// Setter method for month, day, and ordinal names for i18n
		//
		// @param object newNames
		//
		daysInMonth: function daysInMonthGeneric(year, month) {
			if (month == 2) {
				return new Date(year, 1, 29).getDate() == 29 ? 29 : 28;
			}
			return [undefined,31,undefined,31,30,31,30,31,31,30,31,30,31][month];
		},
		autoFormat: function autoFormat(input, formatStr) {
			input = typeof input == 'string' ? document.getElementById(input) : input;
			function correct() {
				input.value = Date.create(input.value).format(formatStr);
			}
			if (input.attachEvent) {
				input.attachEvent('onblur', correct);
			}
			else if (input.addEventListener) {
				input.addEventListener('blur', correct, false);
			}
			else {
				input.onblur = correct;
			}
			return input;
		},
		addFormat: function addFormat(name, rules) {
			Date.prototype[name] = function(formatStr) {
				return this._applyFormat(formatStr, rules);
			};
			return Date;
		},
		current: function current() {
			// instantiate a date (allows unit testing and mocks)
			return new Date;
		}
	};
	extend(Date, staticMethods);
	// ES5 Shim
	if (!('now' in Date)) {
		Date.now = function now() {
			return Date.current().setUTCOffset(0).getTime();
		};
	}

	//
	// format codes for strftime
	//
	// each code must be an array where the first member is the name of a Date.prototype function
	// and optionally a second member indicating the number to pass to Number#toPaddedString()
	//
	Date.addFormat('strftime', {
		//
		// 2-part regex matcher for format codes
		//
		// first match must be the character before the code (to account for escaping)
		// second match must be the format code character(s)
		//
		matcher: /()%(#?(%|[a-z]))/i,
		defaultFormat: '%Y-%m-%d %H:%M:%s',
		codes: {
			// year
			Y: 'FullYear',
			y: 'ShortYear.2',
			// month
			m: 'MonthNumber.2',
		'#m': 'MonthNumber',
			B: 'MonthName',
			b: 'AbbrMonthName',
			// day
			d: 'Date.2',
		'#d': 'Date',
			e: 'Date',
			A: 'DayName',
			a: 'AbbrDayName',
			w: 'Day',
			o: 'DayOrdinal',
			// hours
			H: 'Hours.2',
		'#H': 'Hours',
			I: 'Hours12.2',
		'#I': 'Hours12',
			P: 'AmPmLower',
			p: 'AmPm',
			// minutes
			M: 'Minutes.2',
		'#M': 'Minutes',
			// seconds
			S: 'Seconds.2',
		'#S': 'Seconds',
			s: 'Unix',
			// milliseconds
			N: 'Milliseconds.3',
		'#N': 'Milliseconds',
			// timezone
			O: 'TimezoneOffset',
			Z: 'TimezoneName',
			G: 'UTCOffset'
		},
		//
		// shortcuts that will be translated into their longer version
		//
		// be sure that format shortcuts do not refer to themselves: this will cause an infinite loop
		//
		shortcuts: {
			// date
			F: '%Y-%m-%d',
			// time
			T: '%H:%M:%S',
			X: '%H:%M:%S',
			// local format date
			x: '%m/%d/%y',
			D: '%m/%d/%y',
			// local format extended
		'#c': '%a %b %e %H:%M:%S %Y',
			// local format short
			v: '%e-%b-%Y',
			R: '%H:%M',
			r: '%I:%M:%S %p',
			// tab and newline
			t: '\t',
			n: '\n',
		'%': '%'
		}
	});
	Date.addFormat('formatPhp', {
		//
		// 2-part regex matcher for format codes
		//
		// first match must be the character before the code (to account for escaping)
		// second match must be the format code character(s)
		//
		matcher: /(\\)?([a-z])/i,
		defaultFormat: 'Y-m-d H:i:s',
		codes: {
			// year
			Y: 'FullYear',
			y: 'ShortYear.2',
			L: 'isLeapYear',
			// month
			m: 'MonthNumber.2',
			n: 'MonthNumber',
			F: 'MonthName',
			M: 'AbbrMonthName',
			t: 'daysInMonth',
			// day
			d: 'Date.2',
			j: 'Date',
			l: 'DayName',
			D: 'AbbrDayName',
			w: 'Day',
			S: 'DayOrdinal',
			// hours
			H: 'Hours.2',
			G: 'Hours',
			h: 'Hours12.2',
			g: 'Hours12',
			a: 'AmPmLower',
			A: 'AmPm',
			// minutes
			i: 'Minutes.2',
			// seconds
			s: 'Seconds.2',
			U: 'Unix',
			// timezone
			Z: 'TimezoneOffset',
			e: 'TimezoneName',
			P: 'UTCOffset',
			O: 'UTCOffsetNumber'
		},
		//
		// shortcuts that will be translated into their longer version
		//
		// be sure that format shortcuts do not refer to themselves: this will cause an infinite loop
		//
		shortcuts: {
			// iso
			c: 'Y-m-d\\TH:i:sP',
			// rfc 2822
			r: 'D, j M Y H:i:s O'
		}
	});
	var formatSql = {
		//
		// 2-part regex matcher for format codes
		//
		// first match must be the character before the code (to account for escaping)
		// second match must be the format code character(s)
		//
		matcher: /()(mi|am|pm|ss|yyyy|yy|m{1,4}|d{1,4}|w|hh?24|hh?12)/i,
		defaultFormat: 'yyyy-mm-dd hh24:mi:ss',
		codes: {
			// year
			yyyy: 'FullYear',
			yy: 'ShortYear.2',
			// month
			mm: 'MonthNumber.2',
			m: 'MonthNumber',
			mmm: 'AbbrMonthName',
			mmmm: 'MonthName',
			// day
			dd: 'Date.2',
			d: 'Date',
			ddd: 'AbbrDayName',
			dddd: 'DayName',
			w: 'Day',
			// hours
			hh24: 'Hours.2',
			h24: 'Hours',
			hh: 'Hours12.2',
			hh12: 'Hours12.2',
			h12: 'Hours12',
			am: 'AmPm',
			pm: 'AmPm',
			// minutes
			mi: 'Minutes.2',
			// seconds
			ss: 'Seconds.2'
		},
		//
		// shortcuts that will be translated into their longer version
		//
		// be sure that format shortcuts do not refer to themselves: this will cause an infinite loop
		//
		shortcuts: {}
	};

	// add uppercase versions of each code
	var keys = 'yyyy yy mm m mmm mmmm dd d ddd dddd w hh24 h24 hh12 h12 am pm mi ss'.split(' '), i = 0, key;
	while ((key = keys[i++])) {
		formatSql.codes[key.toUpperCase()] = formatSql.codes[key];
	}
	Date.addFormat('formatSql', formatSql);

	//
	// A list of conversion patterns (array arguments sent directly to gsub)
	// Add, remove or splice a patterns to customize date parsing ability
	//
	// formats that all browsers seem to safely handle:
	//   Mar 15, 2010
	//   March 15, 2010
	//   3/15/2010
	//   03/15/2010
	//
	//   pattern for year 1000 through 9999: ([1-9]\d{3})
	//   pattern for month number: (1[0-2]|0\d|\d)
	//   pattern for month name: (?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)
	//   pattern for day of month: (3[01]|[0-2]\d|\d)
	Date.create.patterns = [
		// 24-hour time
		[/^(?:(.+)\s+)?([01]\d|2[0-3])(?:\s*\:\s*([0-5]\d))(?:\s*\:\s*([0-5]\d))?\s*$/i,
		//                         ^opt. date  ^hour          ^minute              ^opt. second
		function pattern24Hour(match) {
			var d;
			if (match[1]) {
				d = Date.create(match[1]);
				if (isNaN(d)) {
					return false;
				}
			} else {
				d = Date.current();
				d.setMilliseconds(0);
			}
			d.setHours(parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4] || 0));
			return d;
		}],

		// 12-hour time
		[/^(?:(.+)\s+)?([1-9]|1[012])(?:\s*\:\s*(\d\d))?(?:\s*\:\s*(\d\d))?\s*(am|pm)\s*$/i,
		//                         ^opt. date  ^hour         ^opt. minute       ^opt. second          ^am or pm
		function pattern12Hour(match) {
			var d;
			if (match[1]) {
				d = Date.create(match[1]);
				if (isNaN(d)) {
					return false;
				}
			} else {
				d = Date.current();
				d.setMilliseconds(0);
			}
			var hour = parseFloat(match[2]);
			hour = match[5].toLowerCase() == 'am' ? (hour == 12 ? 0 : hour) : (hour == 12 ? 12 : hour + 12);
			d.setHours(hour, parseFloat(match[3] || 0), parseFloat(match[4] || 0));
			return d;
		}],

		// 2 weeks after today, 3 months after 3-5-2008
		[/(\d+)\s+(year|month|week|day|hour|minute|second)s?\s+(before|from|after)\s+(.+)/i,
		function patternAfter(match) {
			var fromDate = Date.create(match[4]);
			if (fromDate instanceof Date) {
				return fromDate.add((match[3].toLowerCase() == 'before' ? -1 : 1) * match[1], match[2]);
			}
			return false;
		}],

		// 2010-03-15
		[/([1-9]\d{3})\s*-\s*(1[0-2]|0\d|\d)\s*-\s*(3[01]|[0-2]\d|\d)/, '$2/$3/$1'],

		// 3-15-2010
		[/(1[0-2]|0\d|\d)\s*[\/-]\s*(3[01]|[0-2]\d|\d)\s*[\/-]\s*([1-9]\d{3})/, '$1/$2/$3'],

		// 15-Mar-2010
		[/(3[01]|[0-2]\d|\d)\s*[ -]\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s*[ -]\s*([1-9]\d{3})/i, '$2 $1, $3'],

		// March 15, 2010
		[/(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s+(3[01]|[0-2]\d|\d),?\s*([1-9]\d{3})/i, '$2 $1, $3'],

		// 15.03.2010
		[/(3[01]|[0-2]\d|\d)\s*\.\s*(1[0-2]|0\d|\d)\s*\.\s*([1-9]\d{3})/, '$2/$1/$3'],

		// 5 months ago
		[/(\d+)\s+(year|month|week|day|hour|minute|second)s?\s+ago/i,
		function patternAgo(match) {
			return Date.current().add(-1 * match[1], match[2]);
		}],

		// in 2 hours/weeks/etc.
		[/in\s+(\d+)\s+(year|month|week|day|hour|minute|second)s?/i,
		function patternAfter(match) {
			return Date.current().add(match[1], match[2]);
		}],

		// today, tomorrow, yesterday
		[/^(tod|now|tom|yes)/i,
		function patternToday(match) {
			var now = Date.current();
			switch (match[1].toLowerCase()) {
				case 'tod':
				case 'now':
					return now;
				case 'tom':
					return now.add(1, 'day');
				case 'yes':
					return now.add(-1, 'day');
			}
		}],

		// this/next/last january, next thurs
		// this/next/last january, next thurs
		[/(this|next|last)\s+(?:(year|month|week|day|hour|minute|second)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(sun|mon|tue|wed|thu|fri|sat))/i,
		function patternNext(match) {
			// $1 = this/next/last
			var multiplier = match[1].toLowerCase() == 'last' ? -1 : 1;
			var now = Date.current();
			var months = Date.ABBR_MONTHNAMES;
			var i;
			// $2 = interval name
			if (match[2]) {
				return now.add(multiplier, match[2]);
			}
			// $3 = month name
			else if (match[3]) {
				var month = match[3].toLowerCase(), diff;
				for (i = 0; i < months.length; i++) {
					if (month == months[i].toLowerCase()) {
						diff = 12 - (now.getMonth() - i);
						diff = diff > 12 ? diff - 12 : diff;
						return now.add(multiplier * diff, 'month');
					}
				}
			}
			// $4 = weekday name
			else if (match[4]) {
				var weekday = match[4].toLowerCase();
				var days = Date.ABBR_DAYNAMES;
				for (i = 0; i < days.length; i++) {
					if (weekday == days[i].toLowerCase()) {
						diff = now.getDay() - i + 7;
						return now.add(multiplier * (diff == 0 ? 7 : diff), 'day');
					}
				}
			}
		}],

		// January 4th, July the 4th
		[/^(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)(?:the\s+)?(\d+)(?:st|nd|rd|th)?$/i,
		function patternNth(match) {
			var d = Date.current();
			if (match[1]) {
				var i = Date.ABBR_MONTHNAMES.length;
				while (i--) {
					if (Date.ABBR_MONTHNAMES[i].toLowerCase() == match[1].toLowerCase()) {
						d.setMonth(i);
						break;
					}
				}
			}
			d.setDate(match[2]);
			return d;
		}]
	];

	// add to global if not exists
	global.$D = global.$D || Date.create;

	// IE Named-Function-Expression Bug
	var addMonth = null,
		diffmonth = null,
		addYear = null,
		diffYear = null,
		add = null,
		diff = null,
		_applyFormat = null,
		_applyFormatChar = null,
		format = null,
		getShortYear = null,
		getMonthName = null,
		getMonthNumber = null,
		getAbbrMonthName = null,
		getDayOrdinal = null,
		getHours12 = null,
		getAmPm = null,
		getAmPmLower = null,
		getUnix = null,
		getUTCOffset = null,
		setUTCOffset = null,
		getUTCOffsetNumber = null,
		getTimezoneName = null,
		toYmdInt = null,
		clone = null,
		diffText = null,
		isLeapYear = null,
		toISOString = null,
		create = null,
		daysInMonth = null,
		daysInMonthGeneric = null,
		autoFormat = null,
		addFormat = null,
		current = null,
		now = null,
		pattern24Hour = null,
		pattern12Hour = null,
		patternAgo = null,
		patternAfter = null,
		patternToday = null,
		patternNext = null,
		patternNth = null;

})(this);