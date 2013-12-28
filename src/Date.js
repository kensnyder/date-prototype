(function() { "use strict";
	
	/*
	 * Add leading zeros
	 */
	function zeroPad(number, digits) {
		switch (digits - String(number).length) {
			case 2: return '00' + number;
			case 1: return '0' + number;
		}
		return number;
	}
	/*
	 * Extend an object with the properties of another
	 */
	function extend(d, s) {
		for (var p in s) {
			if (s.hasOwnProperty(p)) {
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
		day: 24 * 60 * 60 * 1000,
		week: 7 * 24 * 60 * 60 * 1000,
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
	extend(Date.prototype, {
		/**
		 * Return a date one day ahead (or any other unit)
		 * @method succ
		 * @param {String} [unit=day]  The unit name (e.g. years, seconds)
		 * @return {Date}  A new Date object
		 */
		succ: function(unit) {
			return this.clone().add(1, unit || 'day');
		},
		/**
		 * Add an arbitrary time frame
		 * @method add
		 * @param {Number} number  The amount to add
		 * @param {String} [unit=day]  The unit name (e.g. years, seconds)
		 * @return {Date}
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
		 * @method diff
		 * @param {String|Date|Number} dateObj
		 * @param {String} [unit=day]  The unit name (e.g. years, seconds)
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
		 * @method _applyFormat
		 * @private
		 * @param {String} formatStr  The format string such as "%Y-%m-%d"
		 * @param {Object} formatting  The formatting scheme set in Date.addFormat()
		 * @return {String}  Return the string representation of the date
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
				} 
				else {
					result += source;
					source = '';
				}
			}
			return result;
		},
		/**
		 * Apply the format of a single character code using the given formatting scheme
		 * @method _applyFormatChar
		 * @private
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
		 * @method format
		 * @param {String} [formatStr=Date.formatting.strftime.defaultFormat]  The format
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
		 * @method getShortYear
		 * @return {Number}
		 */
		getShortYear: function() {
			return this.getYear() % 100;
		},
		/**
		 * Get the number of the month, 1-12
		 * @method getMonthNumber
		 * @return {Number}
		 */
		getMonthNumber: function() {
			return this.getMonth() + 1;
		},
		/**
		 * Get the name of the month
		 * @method getMonthName
		 * @return {String}
		 */
		getMonthName: function() {
			return Date.MONTHNAMES[this.getMonth()];
		},
		/**
		 * Get the abbreviated name of the month
		 * @method getAbbrMonthName
		 * @return {String}
		 */
		getAbbrMonthName: function() {
			return Date.ABBR_MONTHNAMES[this.getMonth()];
		},
		/**
		 * Get the name of the week day (Sunday through Saturday)
		 * @method getDayName
		 * @return {String}
		 */
		getDayName: function() {
			return Date.DAYNAMES[this.getDay()];
		},
		/**
		 * Get the abbreviated name of the week day (Sunday through Saturday)
		 * @method getAbbrDayName
		 * @return {String}
		 */
		getAbbrDayName: function() {
			return Date.ABBR_DAYNAMES[this.getDay()];
		},
		/**
		 * Get the ordinal string associated with the day of the month (i.e. st, nd, rd, th)
		 * @method getDayOrdinal
		 * @return {String}
		 */
		getDayOrdinal: function() {
			return Date.ORDINALNAMES[this.getDate() % 10];
		},
		/**
		 * Get the hour on a 12-hour scheme
		 * @method getHours12
		 * @return {Number}
		 */
		getHours12: function() {
			var hours = this.getHours();
			return hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
		},
		/**
		 * Get the am or pm (uppercase)
		 * @method getAmPm
		 * @return {String}
		 */
		getAmPm: function() {
			return this.getHours() >= 12 ? 'PM' : 'AM';
		},
		/**
		 * Get the am or pm (lowercase)
		 * @method getAmPmLower
		 * @return {String}
		 */
		getAmPmLower: function() {
			return this.getHours() >= 12 ? 'pm' : 'am';
		},
		/**
		 * Get the date as a Unix timestamp
		 * @method getUnix
		 * @return {Number}
		 */
		getUnix: function() {
			return Math.round(this.getTime() / 1000, 0);
		},
		/**
		 * Get the system GMT offset in hours and minutes (e.g. +06:30) for that date
		 * NOTE: JavaScript Date objects do not have a concept of timezone.
		 * Dates are always in the timezone of the system and only vary by daylight savings changes.
		 * @method getUTCOffset
		 * @example

	// convert from UTC to local timezone
	Date.createUTC(utcdate).getTime();
	// convert local date to UTC
	Date.create(localdate).setUTCOffset(0).getTime();

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
		 * @method setUTCOffset 
		 * @param {Number} seconds  The number of seconds before or past UTC time
		 * @return {Date}
		 */
		setUTCOffset: function(seconds) {
			this.setTime(this.getTime() + (seconds * 60000));
			return this;
		},
		/**
		 * Set the time zone offset in minutes and seconds in the form "+0200" or "+02:00"
		 * @method setUTCOffsetString 
		 * @param {String} str  The GMT Offset
		 * @return {Date}
		 */		
		setUTCOffsetString: function(str) {
			var hoursMin = str.match(/([+\-]?)([01]\d|2[0-3])\:?([0-5]\d)/);
			if (hoursMin) {
				var seconds = parseFloat(hoursMin[2]) * 60;
				seconds += parseFloat(hoursMin[3]);
				if (hoursMin[1] == '-') {
					seconds *= -1;
				}
				this.setUTCOffset(seconds);
			}
			return this;
		},
		/**
		 * Get the GMT offset in hours and minutes without the colon (e.g. +0630)
		 * @method getUTCOffsetNumber
		 * @return {String}
		 */
		getUTCOffsetNumber: function() {
			return this.getUTCOffset().replace(':','');
		},
		/**
		 * Get the browser-reported name for the timezone (e.g. MDT, Mountain Daylight Time)
		 * Varies across browsers and languages
		 * @method getTimezoneName
		 * @return {String}
		 */
		getTimezoneName: function() {
			var match = /(?:\((.+)\)$| ([A-Z]{3}) )/.exec(this.toString());
			return match ? (match[1] || match[2]) : 'GMT' + this.getUTCOffset();
		},
		/**
		 * Convert this date to an 8-digit integer (%Y%m%d)
		 * Good for quickly comparing dates
		 * @method toYmdInt
		 * @return {Number}
		 */
		toYmdInt: function() {
			return (this.getFullYear() * 10000) + (this.getMonthNumber() * 100) + this.getDate();
		},
		/**
		 * Create a copy of this date object
		 * @method clone
		 * @return {Date}
		 */
		clone: function() {
			return new Date(this.getTime());
		},
		/**
		 * Get a textual representation of the difference between this date and now (or the given date)
		 * e.g. "3 minutes ago"
		 * @method diffText
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
				rawText = Math.floor(diff / 60) + " minutes";

			} else if (diff < 86400) {
				// less than 24 hours ago
				var hours = Math.floor(diff / 3600);
				var s = hours == 1 ? '' : 's';
				rawText = hours + " hour" + s + " ago";

			} else if (diff < 172800) {
				// yesterday
				return seconds > 0 ? 'tomorrow' : 'yesterday';

			} else if (diff < 604800) {
				// 2 to 6 days ago
				rawText = Math.floor(diff / 86400) + " days";

			} else if (diff < 1209600) {
				// within 14 days
				return seconds > 0 ? 'next week' : 'last week';

			} else if (diff < 2419200) {
				// within 28 days
				rawText = Math.floor(diff / 604800) + " weeks";

			} else if (diff < 5184000) {
				// within 60 days
				return seconds > 0 ? 'next month' : 'last month';

			}	else if (diff < 31536000) {
				// within 365 days
				rawText = Math.floor(diff / 2592000) + " months";

			} else if (diff < 63072000) {
				// within 730 days
				return seconds > 0 ? 'next year' : 'last year';

			} else {
				// years ago
				rawText = Math.floor(diff / 31536000) + " years";

			}
			return (seconds > 0 ? 'in ' + rawText : rawText + ' ago');
		},
		/**
		 * Get the number of days in the month
		 * @static
		 * @return {Number}
		 */
		daysInMonth: function() {
			return Date.daysInMonth(this.getFullYear(), this.getMonth()+1);
		},
		/**
		 * Return true if the year is a leap year
		 * @method isLeapYear
		 * @return {Boolean}
		 */
		isLeapYear: function() {
			return Date.daysInMonth(this.getFullYear(), 1) == 29 ? 1 : 0;
		},
		/**
		 * Return true if the date is before the given date
		 * @method isBefore
		 * @param {String|Date|Number} date  The date to which to compare
		 * @param {String} [units=milliseconds]  The unit to round to when comparing
		 * @return {Boolean}
		 * @example
		 
	$D('2013-09-13').isBefore('2013-12-21'); // true
	$D('2013-09-13').isBefore('2013-09-13'); // false
	$D('2013-09-13').isBefore('2013-09-13 10:00:00'); // true
		 
		 */
		isBefore: function(date, units) {
			return Math.round(this.diff(date, units || 'milliseconds', true), 0) < 0;
		},
		/**
		 * Return true if the date is after the given date
		 * @method isAfter
		 * @param {String|Date|Number} date  The date to which to compare
		 * @param {String} [units=milliseconds]  The unit to round to when comparing
		 * @return {Boolean}
		 * @example
		 
	$D('2013-09-13').isAfter('2013-12-21'); // false
	$D('2013-09-13').isAfter('2013-09-13'); // false
	$D('2013-09-13').isAfter('2013-09-12'); // true
		 
		 */		
		isAfter: function(date, units) {
			return Math.round(this.diff(date, units || 'milliseconds', true), 0) > 0;
		},
		/**
		 * Return true if the date is equal to the given date rounded to the given unit
		 * @method equals
		 * @param {String|Date|Number} date  The date to which to compare
		 * @param {String} [units=milliseconds]  The unit to round to when comparing
		 * @return {Boolean}
		 * @example
	
	$D('2013-09-13').equals('2013-09-13'); // true
	$D('2013-09-13').equals('2013-09-13 11am', 'day'); // true
	$D('2013-09-13').equals('2013-09-13 11pm', 'day'); // false
	
		 */				
		equals: function(date, units) {
			return Math.round(this.diff(date, units || 'milliseconds', true), 0) === 0;
		},
		/**
		 * Schedule a function to be run at this date. If the date is in the past, don't run
		 * @method setTimeout
		 * @param {Function} callback  The function to run
		 * @return {Number}  The id of the setTimeout that can be used to clearTimeout
		 * @example
		 
	$D('+15 minutes').setTimeout(refreshPage);
		  
		 */	
		setTimeout: function(callback) {
			var inMs = this.getTime() - Date.current().getTime();
			if (inMs < 0) {
				return undefined;
			}
			return setTimeout(callback, inMs);
		}
	});
	/**
	 * ES5 Shim for converting to full ISO String in format 2013-12-19T00:00:00Z
	 * @method toISOString
	 * @return {String}
	 */
	if (!Date.prototype.toISOString) {
		Date.prototype.toISOString = function() {
			return this.setUTCOffset(0).strftime('%Y-%m-%dT%H:%M:%S.%NZ');
		};
	}
	//
	// Add static methods and property to Date
	//
	extend(Date, {
		/**
		 * (Signature 1 of 5) There are 5 different ways to create a date with Date.create (aliased as $D).
		 * The first and most useful is to return a new Date object that is represented by the given date string.
		 * Other ways are listed below.
		 * @method create [1]
		 * @static
		 * @param {String} date  A machine-readable date string
		 * @return {Date|NaN}  The date object or NaN if the date is not recognized
		 * @example
 
	$D('Dec 19, 2013');
	$D('2013-12-19');
	$D('12/19/2013');
	$D('12/19/2013 8am');
	$D('2 hours ago');

		 */
		/**
		 * (Signature 2 of 5) Return a new Date object that is represented by the given number of milliseconds
		 * @method create [2]
		 * @static
		 * @param {Number} millisecondsPastEpoch  The number of milliseconds past (or before) 1970-01-01 00:00:00
		 * @return {Date}
		 * @example
 
	$D(1387518450578);

		 */
		/**
		 * (Signature 3 of 5) Return a new Date object with the given date part values
		 * @method create [3]
		 * @static
		 * @param {Number} year  Four-digit year
		 * @param {Number} month  Month number where 0=January
		 * @param {Number} [day=1]  The day number, 1-31
		 * @param {Number} [hours=0]  The hour number, 0-23
		 * @param {Number} [minutes=0]  The minutes value, 0-59
		 * @param {Number} [seconds=0]  The seconds value, 0-59
		 * @param {Number} [milliseconds=0]  The milliseconds value, 0-999
		 * @return {Date}
		 * @example
 
	$D(2013, 11, 19);

		 */
		/**
		 * (Signature 4 of 5) Return a new Date object with the current date
		 * @method create [4]
		 * @static
		 * @return {Date}
		 * @example
 
	$D();

		 */		
		/**
		 * (Signature 5 of 5) Return the given date object
		 * @method create [5]
		 * @static
		 * @param {Date} date
		 * @return {Date}
		 * @example
 
	$D(new Date(2013, 11, 19));

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
					// trim the date
					date = String(date).replace(/^\s*(.*)\s*$/, '$1');
					// normalize whitespace
					date = date.replace(/\s{2,}/g, ' ');
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
		/**
		 * Return a date assuming input string (or parameters) is a UTC date.
		 * Same 5 signatures as create
		 * @method createUTC
		 * @static
		 * @return {Date}
		 */
		createUTC: function() {
			var args = [].slice.call(arguments);
			var date = Date.create.apply(null, args);
			date.setUTCOffset(0);
			return date;
		},
		/**
		 * Names for the months of the year
		 * @var MONTHNAMES
		 * @static
		 * @type {Array}
		 */			
		MONTHNAMES: 'January February March April May June July August September October November December'.split(' '),
		/**
		 * Lookup of month number by month abbreviation (1=January, 12=December)
		 * @property MONTHNAMES_LOOKUP
		 * @static
		 * @type {Object}
		 */
		MONTHNAMES_LOOKUP: {jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12},
		/**
		 * Abbreviated names for the months of the year
		 * @property ABBR_MONTHNAMES
		 * @static
		 * @type {Array}
		 */	
		ABBR_MONTHNAMES: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		/**
		 * Names for the days of the week from Sunday to Saturday
		 * @property DAYNAMES
		 * @static
		 * @type {Array}
		 */			
		DAYNAMES: 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
		/**
		 * Lookup of day number by day abbreviation
		 * @property DAYNAMES_LOOKUP
		 * @static
		 * @type {Object}
		 */
		DAYNAMES_LOOKUP: {sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6},
		/**
		 * Abbreviated names for the days of the week from Sunday to Saturday
		 * @property ABBR_DAYNAMES
		 * @static
		 * @type {Array}
		 */		
		ABBR_DAYNAMES: 'Sun Mon Tue Wed Thu Fri Sat'.split(' '),
		/**
		 * The ordinal text (st, nd, rd, th) for digits 0 to 9
		 * @property ORDINALNAMES
		 * @static
		 * @type {Array}
		 */
		ORDINALNAMES: 'th st nd rd th th th th th th'.split(' '),
		/**
		 * Pattern for full ISO-8601 date conversion - 2013-12-19T22:15:42.388-0600
		 * @property ISO
		 * @static
		 * @type {String}
		 */
		ISO: '%Y-%m-%dT%H:%M:%S.%N%G',
		/**
		 * Pattern for SQL-type formatting - 2013-12-19 22:15:42
		 * @property SQL
		 * @static
		 * @type {String}
		 */
		SQL: '%Y-%m-%d %H:%M:%S',
		/**
		 * The format code for producing RFC822 formatted dates - Thu, 19 Dec 2013 22:15:42 -0600
		 * @property RFC822
		 * @static
		 * @type {String}
		 */
		RFC822: '%a, %d %b %Y %H:%M:%S %#G',
		/**
		 * The date of the script load
		 * @property SCRIPT_LOAD
		 * @static
		 * @type {Date}
		 */
		SCRIPT_LOAD: new Date(),
		/**
		 * Return the number of days in the given year and month. January = 1
		 * @method daysInMonth
		 * @static
		 * @param {Number} year
		 * @param {Number} month
		 * @return {Number}
		 * @example
		  
	Date.daysInMonth(2013,  
		 
		 */
		daysInMonth: function(year, month) {
			if (month == 2) {
				return new Date(year, 1, 29).getDate() == 29 ? 29 : 28;
			}
			return [undefined,31,undefined,31,30,31,30,31,31,30,31,30,31][month];
		},
		/**
		 * Given a month name or abbreviation, return the month number where January = 0
		 * @method getMonthByName
		 * @static
		 * @param {String} monthname
		 * @return {Number}
		 */
		getMonthByName: function(monthname) {
			return Date.MONTHNAMES_LOOKUP[ String(monthname).slice(0,3).toLowerCase() ];
		},
		/**
		 * Given a day name or abbreviation, return the day number where Sunday = 0
		 * @method getWeekdayByName
		 * @static
		 * @param {String} monthname
		 * @return {Number}
		 */		
		getWeekdayByName: function(dayname) {
			return Date.DAYNAMES_LOOKUP[ String(dayname).slice(0,3).toLowerCase() ];			
		},
		/**
		 * Set a form input to be automatically formatted to the given format. If not recognized, leave value alone
		 * @method autoFormat
		 * @static
		 * @param {HTMLElement|String} input  An HTML element or ID to which to attach the onblur event
		 * @param {String} [formatStr="Y-%m-%d %H:%M:%s"]  The pattern with which to format the date
		 * @return {HTMLElement}
		 */
		autoFormat: function(input, formatStr) {
			input = (typeof input == 'string' ? document.getElementById(input) : input);
			var correct = function() {
				var date = Date.create(input.value);
				if (date) {
					input.value = date.format(formatStr);
				}
			};
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
		 * @method addFormat
		 * @static
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
		 * @method addPattern
		 * @static
		 * @param {Array} spec  An array containing 3 items: [name, regex, function or replace pattern]
		 * @param {String} [afterName]  The named pattern after which to add this pattern. When not given, place pattern at beginning
		 * @return {Object} 
		 * @example

	Date.addPattern(['month-year', /^(\d{1,2})-(\d{4})$/, '$1/01/$2']);
	Date.addPattern(['hoy', /^hoy$/i, function(match) { return new Date(); }], 'iso_8601');

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
		 * @method removePattern
		 * @param {String} name  The name of the pattern to remove
		 * @return {Array|Boolean}  Returns the removed pattern or false if pattern not found
		 * @example

	Date.removePattern('us'); // us-style m/d/Y dates no longer recognized
	var us = Date.removePattern('us'); Date.addPattern(us, 'world'); // prefer world-style d/m/Y dates over us-style dates
				
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
		 * Instantiate Date object representing the current date (allows unit testing and mocks)
		 * @method current
		 * @static
		 * @return {Date}
		 */
		current: function() {
			return new Date();
		}		
	});
	
	// ES5 Shim
	if (!Date.now) {
		/**
		 * Return the current date in milliseconds past epoch relative to UTC time
		 * @method now
		 * @static
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
			G: 'UTCOffset',
		 '#G': 'getUTCOffsetNumber'
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

	// add uppercase versions of each sql code
	var keys = 'yyyy yy mm m mmm mmmm dd d ddd dddd w hh24 h24 hh12 h12 am pm mi ss'.split(' '), i = 0, key;
	while ((key = keys[i++])) {
		formatSql.codes[key.toUpperCase()] = formatSql.codes[key];
	}
	Date.addFormat('formatSql', formatSql);

	/**
	 * A list of conversion patterns used in regexes
	 * @property create.regexes
	 * @static
	 */
	Date.create.regexes = {
		YEAR: "[1-9]\\d{3}",
		MONTH: "1[0-2]|0?[1-9]",
		MONTH2: "1[0-2]|0[1-9]",
		MONTHNAME: "jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december",
		DAYNAME: "mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday",
		DAY: "3[01]|[12]\\d|0?[1-9]",
		DAY2: "3[01]|[12]\\d|0[1-9]",
		TIMEZONE: "[+-][01]\\d\\:?[0-5]\\d",
		H24: "[01]\\d|2[0-3]",
		MIN: "[0-5]\\d",
		SEC: "[0-5]\\d",
		MS: "\\d{3,}",
		H12: "0?[1-9]|1[012]",
		AMPM: "am|pm",
		UNIT: "year|month|week|day|hour|minute|second|millisecond"
	};
	
	/**
	 * Make a regex given a string containing patterns in Date.create.regexes
	 * @param {type} code
	 * @return {RegExp}
	 * @example
	 
	Date.create.makePattern("^(_YEAR_)-(_MONTH_)-(_DAY_)$"); // RegExp
	  
	 */
	Date.create.makePattern = function(code) {
		code = code.replace(/_([A-Z][A-Z0-9]+)_/g, function($0, $1) {
			return Date.create.regexes[$1];
		});
		return new RegExp(code, 'i');
	};
	
	/**
	 * An array of all the patterns used to parse dates
	 * @property create.patterns
	 * @static
	 */
	Date.create.patterns = [
		// 2010-03-15
		[
			'iso_8601',
			Date.create.makePattern("^(_YEAR_)-(_MONTH_)-(_DAY_)$"), 
			'$2/$3/$1'
		],

		// 3-15-2010
		[
			'us', 
			Date.create.makePattern("^(_MONTH_)([\\/-])(_DAY_)\\2(_YEAR_)$"), 
			'$1/$3/$4'
		],

		// 15.03.2010
		[
			'world', 
			Date.create.makePattern("^(_DAY_)([\\/\\.])(_MONTH_)\\2(_YEAR_)$"), 
			'$3/$1/$4'
		],

		// 15-Mar-2010, 8 Dec 2011, "Thu, 8 Dec 2011"
		[
			'chicago',
			Date.create.makePattern("^(?:(?:_DAYNAME_),? )?(_DAY_)([ -])(_MONTHNAME_)\\2(_YEAR_)$"),
			'$3 $1, $4'
		],

		// "March 4, 2012", "Mar 4 2012", "Sun Mar 4 2012"
		[
			'conversational', 
			Date.create.makePattern("^(?:(?:_DAYNAME_),? )?(_MONTHNAME_) (_DAY_),? (_YEAR_)$"), 
			'$1 $2, $3'
		],

		// Tue Jun 22 17:47:27 +0000 2010
		[
			'month_day_time_year', 
			Date.create.makePattern("^(?:_DAYNAME_) (_MONTHNAME_) (_DAY_) ((?:_H24_)\\:(?:_MIN_)(?:\\:_SEC_)?) (_TIMEZONE_) (_YEAR_)$"),
			function(m) {
				var month = zeroPad( Date.getMonthByName(m[1]), 2 );
				var day = zeroPad( m[2], 2 );
				var date = Date.create(m[5] + '-' + month + '-' + day + 'T' + m[3] + m[4]);
				if (isNaN(date)) {
					return false;
				}
				return date;
			}
		],
		
		// @123456789
		[
			'unix', 
			/^@(-?\d+)$/, 
			function(match) {
				return Date.create(parseInt(match[1], 10) * 1000);
			}
		],
	
		// 24-hour time (This will help catch Date objects that are casted to a string)
		[
			'24_hour',
			Date.create.makePattern("^(?:(.+?)(?: |T))?(_H24_)\\:(_MIN_)(?:\\:(_SEC_)(?:\\.(_MS_))?)? ?(?:GMT)?(_TIMEZONE_)?(?: \\([A-Z]+\\))?$"), 
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
					d.setMilliseconds(+String(match[5]).slice(0,3));
				}
				if (match[6]) {
					d.setUTCOffsetString(match[6]);
				}
				return d;
			}
		],

		// 12-hour time
		[
			'12_hour', 
			Date.create.makePattern("^(?:(.+) )?(_H12_)(?:\\:(_MIN_)(?:\\:(_SEC_))?)? ?(_AMPM_)$"),
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
			}
		],

		// 2 weeks after today, 3 months after 3-5-2008
		[
			'weeks_months_before_after',
			Date.create.makePattern("^(\\d+) (_UNIT_)s? (before|from|after) (.+)$"),
			function(match) {
				var fromDate = Date.create(match[4]);
				if (fromDate instanceof Date) {
					return fromDate.add((match[3].toLowerCase() == 'before' ? -1 : 1) * match[1], match[2]);
				}
				return false;
			}
		],

		// 5 months ago
		[
			'time_ago', 
			Date.create.makePattern("^(\\d+) (_UNIT_)s? ago$"), 
			function(match) {
				return Date.current().add(-1 * match[1], match[2]);
			}
		],

		// in 2 hours/weeks/etc.
		[
			'in_time', 
			Date.create.makePattern("^in (\\d) (_UNIT_)s?$"), 
			function(match) {
				return Date.current().add(match[1], match[2]);
			}
		],
	
		// "+2 hours", "-3 years"
		[
			'plus_minus', 
			Date.create.makePattern("^([+-]) ?(\\d+) (_UNIT_)s?$"), function(match) {
				var mult = match[1] == '-' ? -1 : 1;
				return Date.current().add(mult * match[2], match[3]);
			}
		],
	
		// "/Date(1296824894000)/", "/Date(1296824894000-0700)/"
		[
			'asp_json',
			/^\/Date\((\d+)([+\-]\d{4})?\)\/$/i,
			function(match) {
				var d = new Date();
				d.setTime(match[1]);
				if (match[2]) {
					d.setUTCOffsetString(match[2]);
				}
				return d;
			}
		],	

		// today, tomorrow, yesterday
		[
			'today_tomorrow',
			/^(today|now|tomorrow|yesterday)/i,
			function(match) {
				var now = Date.current();
				switch (match[1].toLowerCase()) {
					case 'today':
					case 'now':
						return now;
					case 'tomorrow':
						return now.add(1, 'day');
					case 'yesterday':
						return now.add(-1, 'day');
				}
			}
		],

		// this/next/last january, next thurs
		[
			'this_next_last', 
			Date.create.makePattern("^(this|next|last) (?:(_UNIT_)s?|(_MONTHNAME_)|(_DAYNAME_))$"), 
			function(match) {
				// $1 = this/next/last
				var multiplier = match[1].toLowerCase() == 'last' ? -1 : 1;
				var now = Date.current();
				var i;
				var diff;
				var month;
				var weekday;
				// $2 = interval name
				if (match[2]) {
					return now.add(multiplier, match[2]);
				}
				// $3 = month name
				else if (match[3]) {
					month = Date.getMonthByName(match[3]) - 1;
					diff = 12 - (now.getMonth() - month);
					diff = diff > 12 ? diff - 12 : diff;
					return now.add(multiplier * diff, 'month');
				}
				// $4 = weekday name
				else if (match[4]) {
					weekday = Date.getWeekdayByName(match[4]);
					diff = now.getDay() - weekday + 7;
					return now.add(multiplier * (diff === 0 ? 7 : diff), 'day');
				}
				return false;
			}
		],

		// January 4th, July the 4th
		[
			'conversational_sans_year', 
			Date.create.makePattern("^(_MONTHNAME_) (?:the )?(\\d+)(?:st|nd|rd|th)?$"), 
			function(match) {
				var d = Date.current();
				if (match[1]) {
					d.setMonth( Date.getMonthByName(match[1]) - 1 );
				}
				d.setDate(match[2]);
				return d;
			}
		]
	];

	/**
	 * The version of this library
	 * @property create.version
	 * @static
	 * @type {String}
	 */
	Date.create.version = '%VERSION%';

})();

// add $D shortcut to window or send Date.create to module.exports using UMD pattern
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function(root, factory) {
	if (typeof define == 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	}
	else if (typeof exports == 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	}
	else if (root) {
		// Browser globals (root is window)
		root.$D = factory();
	}
}(this, function() {
	return Date.create;
}));


// Docs for YUIDoc to pick up on native Date methods
/**
 * @class Date
 */
/**
 * @constructor
 * @param {Number} milliseconds
 */
/**
 * Get the day of the month (1-31)
 * @method getDate
 * @return {Number}
 */
/**
 * Get the day of the week (0=Sunday, 6=Saturday)
 * @method getDay
 * @return {Number}
 */
/**
 * Get the month number (0=January, 11=December)
 * @method getMonth
 * @return {Number}
 */
/**
 * Get the four-digit year
 * @method getFullYear
 * @return {Number}
 */
/**
 * Get the number of years since 1900 (such that a 2013 date returns 113)
 * @method getYear
 * @return {Number}
 */
/**
 * Get the hour (0-23)
 * @method getHours
 * @return {Number}
 */
/**
 * Get minutes (0-59)
 * @method getMinutes
 * @return {Number}
 */
/**
 * Get seconds (0-59)
 * @method getSeconds
 * @return {Number}
 */
/**
 * Get milliseconds (0-999)
 * @method getMilliseconds
 * @return {Number}
 */
/**
 * Get the number of milliseconds since 1970-01-01 00:00:00
 * @method getTime
 * @return {Number}
 */
/**
 * Get the number of minutes between the local timezone and UTC time.
 * Note that the offset is the same for all Date objects
 * @method getTimezoneOffset
 * @return {Number}
 */
/**
 * Convert to UTC then get the day of the month (1-31)
 * @method getUTCDate
 * @return {Number}
 */
/**
 * Convert to UTC then get the day of the week (0=Sunday, 6=Saturday)
 * @method getUTCDay
 * @return {Number}
 */
/**
 * Convert to UTC then get the month number (0=January, 11=December)
 * @method getUTCMonth
 * @return {Number}
 */
/**
 * Convert to UTC then get the four-digit year
 * @method getUTCFullYear
 * @return {Number}
 */
/**
 * Convert to UTC then get the hour (0-23)
 * @method getUTCHours
 * @return {Number}
 */
/**
 * Convert to UTC then get minutes (0-59)
 * @method getUTCMinutes
 * @return {Number}
 */
/**
 * Convert to UTC then get seconds (0-59)
 * @method getUTCSeconds
 * @return {Number}
 */
/**
 * Convert to UTC then get milliseconds (0-999)
 * @method getUTCMilliseconds
 * @return {Number}
 */
/**
 * Set the day of the month (1-31)
 * @method setDate
 * @param {Number} day
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set the month number (0=January, 11=December)
 * @method setMonth
 * @param {Number} month
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set the four-digit year
 * @method setFullYear
 * @param {Number} year
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set the number of years since 1900 (such that a 113 produces a date in 2013)
 * @method setYear
 * @param {Number} yearsSince1900
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set the hour (0-23) and optionally minutes, seconds, and milliseconds
 * @method setHours
 * @param {Number} hours
 * @param {Number} [minutes]
 * @param {Number} [seconds]
 * @param {Number} [milliseconds]
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set minutes (0-59) and optionally seconds and milliseconds
 * @method setMinutes
 * @param {Number} minutes
 * @param {Number} [seconds]
 * @param {Number} [milliseconds]
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set seconds (0-59) and optionally milliseconds
 * @method setSeconds
 * @param {Number} seconds
 * @param {Number} [milliseconds]
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set milliseconds (0-999)
 * @method setMilliseconds
 * @param {Number} milliseconds
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00 
 */
/**
 * Set the number of milliseconds past 1970-01-01 00:00:00
 * @method setTime
 * @param {Number} milliseconds
 * @return {Number}  The number of milliseconds since 1970-01-01 00:00:00
 */
/**
 * Convert the date to a string in the format "2013-12-20T04:34:43.284Z"
 * @method toISOString
 * @return {String}
 */
/**
 * Get the number of milliseconds since 1970-01-01 00:00:00
 * @method valueOf
 * @return {Number}
 */
/**
 * Get a string representation of the date in 
 * @method toString
 * @return {Number}
 */
/**
 * Parse a string representation into a number of milliseconds since 1970-01-01 00:00:00.
 * Parsing capability varies by browser
 * @method parse
 * @param {String} date
 * @return {Number}
 */