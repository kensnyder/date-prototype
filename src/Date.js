/**
 * Date instance methods
 *
 * @author Ken Snyder (kendsnyder at gmail dot com)
 * @date July 2011
 * @version 3.2 (http://sandbox.kendsnyder.com/date)
 * @license Creative Commons Attribution License 3.0 (http://creativecommons.org/licenses/by/3.0)
 */
(function(global) {
	//
	// pre-calculate the number of milliseconds in a day
	//
	var day = 24 * 60 * 60 * 1000;
	/**
	 * Add leading zeros
	 */
	function zeroPad(number, digits) {
		number = number+'';
		var cnt = digits - number.length;
		if (cnt <= 0) {
			return number;
		}
		return Array(cnt + 1).join('0') + number;
	}
	/**
	 * Extend an object with the properties of another
	 */
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
			add: function(d, number) {
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
			diff: function(d1, d2) {
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
			add: function(d, number) {
				d.setYear(d.getFullYear() + Math[number > 0 ? 'floor' : 'ceil'](number));
			},
			// get the number of years between two Date objects (decimal to the nearest day)
			diff: function(d1, d2) {
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
		/**
		 * Return a date one day ahead (or any other unit)
		 *
		 * @param {String} [unit="day"]  The unit name (e.g. years, seconds)
		 * @return {Date}  A new Date object
		 */
		succ: function(unit) {
			return this.clone().add(1, unit);
		},
		/**
		 * Add an arbitrary time frame
		 *
		 * @param {Number} number  The amount to add
		 * @param {String} unit  The unit name (e.g. years, seconds)
		 * @return {this}
		 */
		add: function(number, unit) {
			var factor = multipliers[unit] || multipliers.day;
			if (typeof factor == 'number') {
				this.setTime(this.getTime() + (factor * number));
			} else {
				factor.add(this, number);
			}
			return this;
		},
		/**
		 * Find the difference between this date and another date. Positive means more recent
		 *
		 * @param {String|Date|Number} dateObj
		 * @param {String} unit  The unit name (e.g. years, seconds)
		 * @param {Boolean} [allowDecimal=false]  If true, return a decimal, otherwise round toward zero
		 * @return {Number|NaN}  If the other date is not recognized, return NaN
		 */
		diff: function(dateObj, unit, allowDecimal) {
			var unitDiff;
			// ensure we have a Date object
			dateObj = Date.create(dateObj);
			if (dateObj === null) {
				return NaN;
			}
			// get the multiplying factor integer or factor function
			var factor = multipliers[unit] || multipliers.day;
			if (typeof factor == 'number') {
				// multiply
				unitDiff = (this.getTime() - dateObj.getTime()) / factor;
			} else {
				// run function
				unitDiff = factor.diff(this, dateObj);
			}
			// if decimals are not allowed, round toward zero
			return (allowDecimal ? unitDiff : Math[unitDiff > 0 ? 'floor' : 'ceil'](unitDiff));
		},
		/**
		 * Our gsub function that applies the format string using the given formatting scheme
		 * 
		 * @param {String} formatStr  The format string such as "%Y-%m-%d"
		 * @param {Object} formatting  The formatting scheme set in Date.addFormat()
		 * @return {String}  Return the string representation of the date\
		 */
		_applyFormat: function(formatStr, formatting) {
			// default the format string to year-month-day
			var source = formatStr || formatting.defaultFormat, result = '', match;
			// replace each format code
			while (source.length > 0) {
				if ((match = source.match(formatting.matcher))) {
					result += source.slice(0, match.index);
					result += (match[1] || '') + this._applyFormatChar(match[2], formatting);
					source = source.slice(match.index + match[0].length);
				} else {
					result += source, source = '';
				}
			}
			return result;
		},
		/**
		 * Apply the format of a single character code using the given formatting scheme
		 * 
		 * @param {String} code  The code such as "Y"
		 * @param {Object} formatting  The formatting scheme set in Date.addFormat()
		 * @return {String}  Return the string representation of the date or the code literal if not recognized
		 */
		_applyFormatChar: function(code, formatting) {
			if (formatting.shortcuts && formatting.shortcuts[code]) {
				// process any shortcuts recursively
				return this._applyFormat(formatting.shortcuts[code], formatting);
			}
			else if(formatting.codes && formatting.codes[code]) {
				// get the format code function and toPaddedString() argument
				var getter = formatting.codes[code].split('.');
				var nbr = this['get' + getter[0]] ? this['get' + getter[0]]() : '';
				// zeroPad if specified
				if (getter[1]) {
					nbr = zeroPad(nbr, getter[1]);
				}
				// prepend the leading character
				return nbr;
			}
			return code;
		},
		/**
		 * Format the string using strftime or formatPhp depending on if % is present
		 * 
		 * @param {String} [formatStr]  The format. defaults to Date.formatting.strftime.defaultFormat
		 * @return {String}
		 */
		format: function(formatStr) {
			formatStr = formatStr || Date.formatting.strftime.defaultFormat;
			if (formatStr.indexOf('%') > -1) {
				return this.strftime(formatStr);
			}
			return this.formatPhp(formatStr);
		},
		/**
		 * Return a two-digit year
		 *
		 * @return {Number}
		 */
		getShortYear: function() {
			return this.getYear() % 100;
		},
		/**
		 * Get the number of the month, 1-12
		 *
		 * @return {Number}
		 */
		getMonthNumber: function() {
			return this.getMonth() + 1;
		},
		/**
		 * Get the name of the month
		 *
		 * @return {String}
		 */
		getMonthName: function() {
			return Date.MONTHNAMES[this.getMonth()];
		},
		/**
		 * Get the abbreviated name of the month
		 *
		 * @return {String}
		 */
		getAbbrMonthName: function() {
			return Date.ABBR_MONTHNAMES[this.getMonth()];
		},
		/**
		 * Get the name of the week day (Sunday through Saturday)
		 *
		 * @return {String}
		 */
		getDayName: function() {
			return Date.DAYNAMES[this.getDay()];
		},
		/**
		 * Get the abbreviated name of the week day (Sunday through Saturday)
		 *
		 * @return {String}
		 */
		getAbbrDayName: function() {
			return Date.ABBR_DAYNAMES[this.getDay()];
		},
		/**
		 * Get the ordinal string associated with the day of the month (i.e. st, nd, rd, th)
		 *
		 * @return {String}
		 */
		getDayOrdinal: function() {
			return Date.ORDINALNAMES[this.getDate() % 10];
		},
		/**
		 * Get the hour on a 12-hour scheme
		 *
		 * @return {Number}
		 */
		getHours12: function() {
			var hours = this.getHours();
			return hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours);
		},
		/**
		 * Get the am or pm (uppercase)
		 *
		 * @return {String}
		 */
		getAmPm: function() {
			return this.getHours() >= 12 ? 'PM' : 'AM';
		},
		/**
		 * Get the am or pm (lowercase)
		 *
		 * @return {String}
		 */
		getAmPmLower: function() {
			return this.getHours() >= 12 ? 'pm' : 'am';
		},
		/**
		 * Get the date as a Unix timestamp
		 *
		 * @return {Number}
		 */
		getUnix: function() {
			return Math.round(this.getTime() / 1000, 0);
		},
		/**
		 * Get the GMT offset in hours and minutes (e.g. +06:30)
		 *
		 * @return {String}
		 */
		getUTCOffset: function() {
			// divide the minutes offset by 60
			var hours = this.getTimezoneOffset() / 60;
			// decide if we are ahead of or behind GMT
			var prefix = hours < 0 ? '+' : '-';
			// remove the negative sign if any
			hours = Math.abs(hours);
			// add the +/- to the padded number of hours to : to the padded minutes
			return prefix + zeroPad(Math.floor(hours), 2) + ':' + zeroPad((hours % 1) * 60, 2);
		},
		/**
		 * Set the offset in minutes by converting date to UTC then adding or subtracting given number of seconds
		 * 
		 * @param {Number} seconds  The number of seconds before or past UTC time
		 * @return {Date}
		 */
		setUTCOffset: function(seconds) {
			var curr = this.getTimezoneOffset();
			var utcNow = this.getTime() + (curr * 60000);
			this.setTime(utcNow - (seconds * 60000));
			return this;
		},
		/**
		 * Get the GMT offset in hours and minutes without the colon (e.g. +0630)
		 *
		 * @return {String}
		 */
		getUTCOffsetNumber: function() {
			return this.getUTCOffset().replace(':','');
		},
		/**
		 * Get the browser-reported name for the timezone (e.g. MDT, Mountain Daylight Time)
		 * Varies across browsers and languages
		 *
		 * @return {String}
		 */
		getTimezoneName: function() {
			var match = /(?:\((.+)\)$| ([A-Z]{3}) )/.exec(this.toString());
			return match[1] || match[2] || 'GMT' + this.getUTCOffset();
		},
		/**
		 * Convert this date to an 8-digit integer (%Y%m%d)
		 * Good for quickly comparing dates
		 *
		 * @return {Number}
		 */
		toYmdInt: function() {
			return (this.getFullYear() * 10000) + (this.getMonthNumber() * 100) + this.getDate();
		},
		/**
		 * Create a copy of this date object
		 *
		 * @return {Date}
		 */
		clone: function() {
			return new Date(this.getTime());
		},
		/**
		 * Get a textual representation of the difference between this date and now (or the given date)
		 * e.g. "3 minutes ago"
		 * 
		 * @param {String|Date|Number} compare  A string date, object or ms past epoch to compare to. Defaults to current date
		 * @return {String}
		 */
		diffText: function(compare) {
			var seconds = this.diff(compare || Date.current(), 'seconds');
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
			return (seconds > 0 ? 'in ' + rawText : rawText + ' ago');
		},
		/**
		 * Get the number of days in the month
		 * 
		 * @return {Number}
		 */
		daysInMonth: function() {
			return Date.daysInMonth(this.getFullYear(), this.getMonth()+1);
		},
		/**
		 * Return true if the year is a leap year
		 * 
		 * @return {Boolean}
		 */
		isLeapYear: function() {
			return Date.daysInMonth(this.getFullYear(), 1) == 29 ? 1 : 0;
		}
	};
	extend(Date.prototype, instanceMethods);
	/**
	 * ES5 Shim for converting to full ISO String
	 * 
	 * @return {String}
	 */
	if (!Date.prototype.toISOString) {
		Date.prototype.toISOString = function() {
			return this.setUTCOffset(0).strftime(Date.ISO);
		};
	}
	//
	// Add static methods to Date
	//
	var staticMethods = {
		/**
		 * The heart of the date functionality: returns a date object if given a convertable value, returns NaN if not convertable
		 * A robust and configurable version of Date.parse with the abilities of the Date constructor as well
		 *
		 * @param {String|Date|Number} [date]
		 * If date is not passed or is undefined, return the current date
		 * If date is an instance of Date, return it
		 * With one Number argument, interpret as milliseconds past epoch
		 * With one String argument, look through Date.create.patterns to try to convert it to a date
		 * Interpret 2 arguments as Year, Month (January = 0) at 1st day of month
		 * Interpret 3 arguments as Year, Month, Day
		 * Interpret 4 arguments as Year, Month, Day, Hour
		 * Interpret 5 arguments as Year, Month, Day, Hour, Minutes
		 * Interpret 6 arguments as Year, Month, Day, Hour, Minutes, Seconds
		 * Interpret 7 or more arguments as Year, Month, Day, Hour, Minutes, Seconds, Milliseconds
		 * @return {Date|NaN}  If the date is not recognized, return NaN
		 */
		create: function(date) {
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
					// trim the date before starting
					date = String(date).replace(/^\s*(.*)\s*$/, '$1');
					if (date === '') {
						return Date.current();
					}
					var i = 0, pattern, ms, obj, match, regex, fn;
					// try each of our patterns
					while ((pattern = Date.create.patterns[i++])) {
						if (typeof pattern[0] == 'string') {
							// pattern[0] is the name of the pattern
							regex = pattern[1];
							fn = pattern[2];
						}
						else {
							// backwards compatibility with version 3.1
							regex = pattern[0];
							fn = pattern[1];
						}
						if (!(match = date.match(regex))) {
							continue;
						}
						if (typeof fn == 'function') {
							obj = fn(match, date);
							if (obj instanceof Date) {
								return obj;
							}
						} else {
							// fn is not a function but a string replace command
							ms = Date.parse(date.replace(regex, fn));
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
		// constants representing month names, day names, and ordinal names to allow i18n
		// (same names as Ruby Date constants)
		//
		/**
		 * @var {Array}  Names for the months of the year
		 */			
		MONTHNAMES      : 'January February March April May June July August September October November December'.split(' '),
		/**
		 * @var {Array}  Abbreviated names for the months of the year
		 */	
		ABBR_MONTHNAMES : 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		/**
		 * @var {Array}  Names for the days of the week from Sunday to Saturday
		 */			
		DAYNAMES        : 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
		/**
		 * @var {Array}  Abbreviated names for the days of the week from Sunday to Saturday
		 */		
		ABBR_DAYNAMES   : 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
		/**
		 * @var {Array}  The ordinal text (e.g. st, nd, rd, th) for digits 1 to 9
		 */
		ORDINALNAMES    : 'th st nd rd th th th th th th'.split(' '),
		/**
		 * @var {String}  Pattern for full ISO-8601 date conversion
		 */
		ISO: '%Y-%m-%dT%H:%M:%S.%N%G',
		/**
		 * @var {String}  Pattern for SQL-type formatting
		 */
		SQL: '%Y-%m-%d %H:%M:%S',
		/**
		 * @var {Date}  The date of the script load
		 */
		SCRIPT_LOAD: new Date,
		/**
		 * Return the number of days in the given year and month. January = 1
		 *
		 * @param {Number} year
		 * @param {Number} month
		 */
		daysInMonth: function(year, month) {
			if (month == 2) {
				return new Date(year, 1, 29).getDate() == 29 ? 29 : 28;
			}
			return [undefined,31,undefined,31,30,31,30,31,31,30,31,30,31][month];
		},
		/**
		 * Set a form input to be automatically formatted to the given format. If not recognized, leave value alone
		 * 
		 * @param {HTMLElement|String} input  An HTML element or ID to which to attach the onblur event
		 * @param {String} [formatStr="Y-%m-%d %H:%M:%s"]  The pattern with which to format the date
		 * @return {HTMLElement}
		 */
		autoFormat: function(input, formatStr) {
			input = (typeof input == 'string' ? document.getElementById(input) : input);
			function correct() {
				var date = Date.create(input.value);
				if (date) {
					input.value = date.format(formatStr);
				}
			}
			if (typeof input.attachEvent == 'function') {
				input.attachEvent('onblur', correct);
			}
			else if (typeof input.addEventListener == 'function') {
				input.addEventListener('blur', correct, false);
			}
			else {
				input.onblur = correct;
			}
			return input;
		},
		/**
		 * Add a new set of format rules
		 * 
		 * @param {String} name  The name of the method
		 * @param {Object} rules  A definition with keys matcher, defaultFormat, codes and shortcuts. See source code for examples.
		 * @return {this}
		 */
		addFormat: function(name, rules) {
			Date.prototype[name] = function(formatStr) {
				return this._applyFormat(formatStr, rules);
			};
			return this;
		},
		/**
		 * Add a new pattern for recognizing dates
		 * Examples:
		 * Date.addPattern(['month-year', /^(\d{1,2})-(\d{4})$/, '$1/01/$2']);
		 * Date.addPattern(['hoy', /^hoy$/i, function(match) { return new Date(); }], 'iso_8601');
		 * 
		 * @param {Array} spec  An array containing 3 items: [name, regex, function or replace pattern]
		 * @param {String} [afterName]  The named pattern after which to add this pattern. When not given, place pattern at beginning
		 * @return {Object} 
		 */
		addPattern: function(spec, afterName) {
			if (afterName) {
				var i = 0, pattern;
				while ((pattern = Date.create.patterns[i++])) {
					if (pattern[0] == afterName || pattern[1] == afterName) {
						Date.create.patterns.splice(i, 0, spec);
						return this;
					}
				}
			}
			// afterName not given or not found
			Date.create.patterns.unshift(spec);
			return this;
		},
		/**
		 * Remove a pattern by name
		 * Examples:
		 * Date.removePattern('us'); // us-style m/d/Y dates no longer recognized
		 * var us = Date.removePattern('us'); Date.addPattern(us, 'world'); // prefer world-style d/m/Y dates over us-style dates
		 * 
		 * @param {String} name  The name of the pattern to remove
		 * @return {Array|Boolean}  Returns the removed pattern or false if pattern not found
		 */
		removePattern: function(name) {
			var i = 0, pattern;
			while ((pattern = Date.create.patterns[i++])) {
				if (pattern[0] == name || pattern[1] == name) {
					// return 
					return Date.create.patterns.splice(i-1, 1)[0];
				}
			}
			return false;
		},
		/**
		 * Instantiate current date (allows unit testing and mocks)
		 * 
		 * @return {Date}
		 */
		current: function() {
			return new Date;
		}
	};
	extend(Date, staticMethods);
	// ES5 Shim
	if (!('now' in Date)) {
		/**
		 * Return the current date in milliseconds past epoch
		 * 
		 * @return {Date}
		 */
		Date.now = function() {
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

	/**
	 * A list of conversion patterns (array arguments sent directly to our gsub function)
	 * Use Date.addFormat() or Date.removeFormat() to customize date parsing ability
	 *
	 * formats that all browsers seem to safely handle:
	 *   Mar 15, 2010
	 *   March 15, 2010
	 *   3/15/2010
	 *   03/15/2010
	 *
	 *   pattern for year 1000 through 9999: ([1-9]\d{3})
	 *   pattern for month number: (1[0-2]|0?[1-9])
	 *   pattern for month name: (?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)
	 *   pattern for day of month: (3[01]|[12]\d|0?[1-9])
	 */
	Date.create.patterns = [
		// 2010-03-15
		['iso_8601', /^([1-9]\d{3})\s*-\s*(1[0-2]|0?[1-9])\s*-\s*(3[01]|[12]\d|0?[1-9])$/, '$2/$3/$1'],

		// 3-15-2010
		['us', /^(1[0-2]|0?[1-9])\s*[\/-]\s*(3[01]|[12]\d|0?[1-9])\s*[\/-]\s*([1-9]\d{3})$/, '$1/$2/$3'],

		// 15.03.2010
		['world', /^(3[01]|[12]\d|0?[1-9])\s*([\.\/])s*(1[0-2]|0?[1-9])\s*\2\s*([1-9]\d{3})$/, '$3/$1/$4'],

		// 15-Mar-2010
		['chicago', /^(3[01]|[0-2]\d|\d)\s*([ -])\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s*\2\s*([1-9]\d{3})$/i, '$3 $1, $4'],

		// March 15, 2010
		['conversational', /^(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\s+(3[01]|[0-2]\d|\d),?\s*([1-9]\d{3})$/i, '$1 $2, $3'],

		['unix',
		/^@(-?\d+)$/,
		function(match) {
			return Date.create(match[1] * 1000);
		}],
		// 24-hour time
		['24_hour',
		/^(?:(.+)\s+)?([01]\d|2[0-3])(?:\s*\:\s*([0-5]\d))(?:\s*\:\s*([0-5]\d))?\s*(?:\.(\d+))?$/i,
		// ^opt. date  ^hour          ^minute              ^optional second         ^optional fraction
		function(match) {
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
			if (match[5]) {
				d.setMilliseconds(match[5]);
			}
			return d;
		}],

		// 12-hour time
		['12_hour',
		/^(?:(.+)\s+)?(0?[1-9]|1[012])(?:\s*\:\s*(\d\d))?(?:\s*\:\s*(\d\d))?\s*(am|pm)\s*$/i,
		// ^opt. date  ^hour           ^optional minute   ^optional second      ^am or pm
		function(match) {
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
		['weeks_months_before_after',
		/^(\d+)\s+(year|month|week|day|hour|minute|second)s?\s+(before|from|after)\s+(.+)$/i,
		function(match) {
			var fromDate = Date.create(match[4]);
			if (fromDate instanceof Date) {
				return fromDate.add((match[3].toLowerCase() == 'before' ? -1 : 1) * match[1], match[2]);
			}
			return false;
		}],

		// 5 months ago
		['time_ago',
		/^(\d+)\s+(year|month|week|day|hour|minute|second)s?\s+ago$/i,
		function(match) {
			return Date.current().add(-1 * match[1], match[2]);
		}],

		// in 2 hours/weeks/etc.
		['in_time',
		/^in\s+(\d+)\s+(year|month|week|day|hour|minute|second)s?$/i,
		function(match) {
			return Date.current().add(match[1], match[2]);
		}],

		// today, tomorrow, yesterday
		['today_tomorrow',
		/^(tod|now|tom|yes)/i,
		function(match) {
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
		['this_next_last',
		/^(this|next|last)\s+(?:(year|month|week|day|hour|minute|second)|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(sun|mon|tue|wed|thu|fri|sat))/i,
		function(match) {
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
			return false;
		}],

		// January 4th, July the 4th
		['conversational_sans_year',
		/^(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)(?:the\s+)?(\d+)(?:st|nd|rd|th)?$/i,
		function(match) {
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

	// add $D shortcut to global if not exists
	global.$D = global.$D || Date.create;

})(this);