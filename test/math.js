test('Date#add()', function() {
	// be careful not to cross daylight savings time changeovers
	equal($D('Oct 27, 2007').add(4, 'year')+'', $D(Date.parse('Oct 27, 2011'))+'', 'adding "years"');
	equal($D('Oct 27, 2007').add(4, 'years')+'', $D(Date.parse('Oct 27, 2011'))+'', 'adding "year"');
	equal($D('Nov 28, 2007').add(1, 'months')+'', $D(Date.parse('Dec 28, 2007'))+'', 'adding 1 "months"');
	equal($D('Nov 27, 2007').add(1, 'month')+'', $D(Date.parse('Dec 27, 2007'))+'', 'adding 1 "month"');
	equal($D('Nov 11, 2007').add(3, 'month')+'', $D(Date.parse('Feb 11, 2008'))+'', 'adding months that cause year wrapping');
	equal($D('Feb 11, 2008').add(-2, 'month')+'', $D(Date.parse('Dec 11, 2007'))+'', 'subtracting months that cause year wrapping');
	equal($D('Dec 12, 2007').add(25, 'months')+'', $D(Date.parse('Jan 12, 2010'))+'', 'adding more than 12 months');
	equal($D('Oct 26, 2007').add(2, 'days')+'', $D(Date.parse('Oct 28, 2007'))+'', 'adding "days"');
	equal($D('Oct 26, 2007').add(1, 'day')+'', $D(Date.parse('Oct 27, 2007'))+'', 'adding "day"');
	equal($D('Oct 27, 2007 16:00').add(4, 'hours')+'', $D(Date.parse('Oct 27, 2007 20:00'))+'', 'adding "hours"');
	equal($D('Oct 27, 2007 19:30:00').add(1, 'hour')+'', $D(Date.parse('Oct 27, 2007 20:30'))+'', 'adding "hour"');
	equal($D('Oct 27, 2007 19:30:00').add(60, 'seconds')+'', $D(Date.parse('Oct 27, 2007 19:31'))+'', 'adding "seconds"');
	equal($D('Oct 27, 2007 19:30:00').add(60, 'second')+'', $D(Date.parse('Oct 27, 2007 19:31'))+'', ' adding "second"');
	equal($D('Oct 27, 2007 19:30:00').add(60000, 'milliseconds')+'', $D(Date.parse('Oct 27, 2007 19:31'))+'', 'adding "milliseconds"');
	equal($D('Oct 27, 2007 19:30:00').add(60000, 'millisecond')+'', $D(Date.parse('Oct 27, 2007 19:31'))+'', 'adding "millisecond"');
	equal($D('May 31, 2007 19:31').add(1, 'month')+'', $D(Date.parse('Jun 30, 2007 19:31'))+'', 'months that have more days than the original month (addition)');
	equal($D('May 31, 2007 19:31').add(-1, 'month')+'', $D(Date.parse('Apr 30, 2007 19:31'))+'', 'months that have more days than the original month (subtraction)');
});

test('Date#diff()', function() {
	equal($D('10/29/2007').diff('2007-10-31'), -2, 'comparing days');
	equal($D('10/31/2007').diff('2007-10-29', 'hours'), 48, 'comparing hours');
	equal($D('10/29/2007 23:25').diff('2007-10-29 23:00', 'minutes'), 25, 'comparing minutes');
	equal($D('10/29/2007 23:00:18').diff($D('2007-10-29 23:00:00'), 'seconds'), 18, 'comparing seconds');
	equal($D('10/29/2007 23:00:18').diff('2007-10-29 23:00:00', 'milliseconds'), 18000, 'comparing milliseconds');
	equal($D('10/29/2008 23:00:18').diff('2006-10-29 23:00:00', 'year'), 2, 'comparing years');
	equal($D('12/29/2008 23:00:18').diff('2006-10-29 23:00:00', 'year'), 2, 'comparing years with rounding');
	equal($D('12-31-2008').diff('2008-10-29', 'month'), 2, 'comparing months');
	equal($D('2008-10-29').diff('12-31-2008', 'month'), -2, 'comparing months (negative)');
	equal($D('12-26-2008').diff('2008-10-31', 'month'), 1, 'comparing months with rounding');
	equal($D('10/29/2007 23:25:30').diff($D('2007-10-29 23:00:00'), 'minute', true), 25.5, 'comparing minutes with decimal');
	equal($D('10/29/2007 23:30').diff('2007-10-29 23:00', 'hour', true), 0.5, 'comparing hours with decimal');
});

test('Date#diffText', function() {
	// control the date that will be used internally for current date
	var oldCurrent = Date.current;
	Date.current = function() {
		return new Date(2010,6,19);
	};

	equal($D(2010,6,20).diffText(), 'tomorrow', '1 day');

	Date.current = oldCurrent;
});

test('comparison operators', function() {
	equal($D('Dec 16 2006').getTime() == $D('2006-12-16').getTime(), true, 'comparing dates with ==');
	equal($D('12-16-2006').getTime() == $D('2006-12-17').getTime(), false, 'comparing dates with ==');

	equal($D('12-16-2006') < $D('2006-12-17'), true, 'comparing dates with <');
	equal($D('12-16-2006') > $D('2006-12-17'), false, 'comparing dates with >');
});

test('comparison functions: equals, isBefore, isAfter', function() {
	equal($D('2012-06-09 20:00:00').equals('06/09/2012 20:00:00'), true, 'equals');
	equal($D('2012-06-09 20:00:00').equals('06/09/2012 20:00:01'), false, 'not equals');
	equal($D('2012-06-09 20:00:00').equals('06/09/2012 20:00:00', 'millisecond'), true, 'equals to nearest millisecond 2');
	equal($D('2012-06-09T20:00:00.123').equals('06/09/2012 20:00:00', 'second'), true, 'equals to nearest second');
	equal($D('2012-06-09 20:00:29').equals('06/09/2012 20:00:00', 'minute'), true, 'equals to nearest minute');
	equal($D('2012-06-09 19:30:00').equals('06/09/2012 20:00:00', 'hour'), true, 'equals to nearest hour');
	equal($D('2012-06-09 21:29:29').equals('06/09/2012 20:00:00', 'day'), true, 'equals to nearest day');
	equal($D('2012-06-09 20:00:01').equals('06/05/2012 20:00:01', 'month'), true, 'equals to nearest month');
	equal($D('2012-06-09 20:00:00').equals('05/05/2012 20:00:00', 'year'), true, 'equals to nearest year');

	equal($D('12-16-2006').isBefore('2006-12-17'), true, 'isBefore');
	equal($D('12-16-2006').isBefore('2006-12-15'), false, 'not isBefore');







});