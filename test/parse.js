module('Date parsing');

test('Date.create() - numeric arguments', function() {
	var d, pd;
	// 0 arguments
	d = new Date();
	d.setMilliseconds(0);
	d.setHours(0, 0, 0);
	pd = $D();
	pd.setMilliseconds(0);
	pd.setHours(0, 0, 0);
	equal(pd+'', d+'', '0 arguments');

	// 2 arguments
	d = new Date(2008, 11, 1);
	d.setMilliseconds(0);
	d.setHours(0, 0, 0);
	pd = $D(2008, 11);
	pd.setMilliseconds(0);
	pd.setHours(0, 0, 0);
	equal(pd+'', d+'', '3 arguments');

	// 3 arguments
	d = new Date(2008, 11, 13);
	d.setMilliseconds(0);
	d.setHours(0, 0, 0);
	pd = $D(2008, 11, 13);
	pd.setMilliseconds(0);
	pd.setHours(0, 0, 0);
	equal(pd+'', d+'', '3 arguments');

	// 4 arguments
	d = new Date(2008, 11, 13, 6);
	d.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	pd = $D(2008, 11, 13, 6);
	pd.setMilliseconds(0);
	d.setSeconds(0);
	d.setMinutes(0);
	equal(pd+'', d+'', '4 arguments');

	// 5 arguments
	d = new Date(2008, 11, 13, 6, 55);
	d.setMilliseconds(0);
	d.setSeconds(0);
	pd = $D(2008, 11, 13, 6, 55);
	pd.setMilliseconds(0);
	d.setSeconds(0);
	equal(pd+'', d+'', '5 arguments');

	// 6 arguments
	d = new Date(2008, 11, 13, 6, 55, 1);
	d.setMilliseconds(0);
	pd = $D(2008, 11, 13, 6, 55, 1);
	pd.setMilliseconds(0);
	equal(pd+'', d+'', '6 arguments');

	// 7 arguments
	d = new Date(2008, 11, 13, 6, 55, 1, 800);
	pd = $D(2008, 11, 13, 6, 55, 1, 800);
	equal(pd+'', d+'', '7 arguments');

	// 8 arguments
	d = new Date(2008, 11, 13, 6, 55, 1, 800, -1);
	pd = $D(2008, 11, 13, 6, 55, 1, 800, -1);
	equal(pd+'', d+'', '8 arguments');			

	// 1 argument
	d = new Date();
	pd = $D();
	strictEqual($D(d), d, 'passing Date object');
	equal($D(1234567890)+'', new Date(1234567890)+'', 'passing number (ms past epoch)');
	equal($D('Dec 1, 2006')+'', new Date(2006, 11, 1)+'', 'string');
});

test('Date.create() - string date', function() {
	var d = new Date();
	d.setTime(1312132465000);
	equal($D('@1312132465')+'', d+'', 'parsing `@13121324651` unix timestamp');
	d.setTime(-1000);
	equal($D('@-1')+'', d+'', 'parsing `@-1` unix timestamp');
	equal($D(' \r\n\t ')+'', new Date()+'', 'parsing whitespace string');
	equal($D('2006-08-01')+'', new Date(2006, 7, 1)+'', 'parsing `2006-08-01`');
	equal($D('2006-08-01 20:15')+'', new Date(2006, 7, 1, 20, 15)+'', 'parsing `2006-08-01 20:15`');
	equal($D('2006-08-01 20:15:59')+'', new Date(2006, 7, 1, 20, 15, 59)+'', 'parsing `2006-08-01 20:15:59`');
	equal($D('2006-08-01 00:15:59')+'', new Date(2006, 7, 1, 0, 15, 59)+'', 'parsing `2006-08-01 00:15:59`');
	equal($D('2006-08-01T00:15:59+01:00')+'', new Date(2006, 7, 1, 0, 15, 59).setUTCOffsetString('+01:00')+'', 'parsing `2010-03-15T12:34:56+01:00` (full iso 8601)');
	equal($D('2010-11-26T12:01:05.179-05:00').getTime(), new Date(2010, 10, 26, 12, 1, 5, 179).setUTCOffsetString('-05:00').getTime(), 'parsing `2010-11-26T12:01:05.179-05:00` (full iso 8601 with milliseconds)');
	equal($D('2010-11-26T12:01:05.1794748-05:00').getTime(), new Date(2010, 10, 26, 12, 1, 5, 179).setUTCOffsetString('-05:00').getTime(), 'parsing `2010-11-26T12:01:05.1794748-05:00` (full iso 8601 with microseconds)');
	equal($D('12-01-2006')+'', new Date(2006, 11, 1)+'', 'parsing `12-01-2006`');
	equal($D('12-1-2006')+'', new Date(2006, 11, 1)+'', 'parsing `12-1-2006`');
	equal($D('13.1.2006')+'', new Date(2006, 0, 13)+'', 'parsing `13.1.2006`');
	equal($D('13.01.2006')+'', new Date(2006, 0, 13)+'', 'parsing `13.01.2006`');
	equal($D('13/1/2006')+'', new Date(2006, 0, 13)+'', 'parsing `13/1/2006`');
	equal($D('13/01/2006')+'', new Date(2006, 0, 13)+'', 'parsing `13/01/2006`');
	equal($D('8-Dec-2006')+'', new Date(2006, 11, 8)+'', 'parsing `8-Dec-2006`');
	equal($D('8 Dec 2006')+'', new Date(2006, 11, 8)+'', 'parsing `8 Dec 2006`');
	equal($D('Thu, 8 Dec 2011')+'', new Date(2011, 11, 8)+'', 'parsing `Thu, 8 Dec 2006`');
	equal($D('Thu 8 Dec 2011')+'', new Date(2011, 11, 8)+'', 'parsing `Thu 8 Dec 2006`');
	equal($D('08-Dec-2006')+'', new Date(2006, 11, 8)+'', 'parsing `08-Dec-2006`');
	equal($D('12-December-2006')+'', new Date(2006, 11, 12)+'', 'parsing `12-December-2006`');
	equal($D('12 December 2006')+'', new Date(2006, 11, 12)+'', 'parsing `12 December 2006`');
	equal($D('Thu, 21 Dec 2000 16:01:07 +0200')+'', new Date(2000, 11, 21, 16, 1, 7).setUTCOffsetString('+0200')+'', 'parsing `Thu, 21 Dec 2000 16:01:07 +0200` (rfc 2822)');
	equal($D('Thu, 21 Dec 2000 16:01:07 GMT+0200')+'', new Date(2000, 11, 21, 16, 1, 7).setUTCOffsetString('+0200')+'', 'parsing `Thu, 21 Dec 2000 16:01:07 GMT+0200`');
	equal($D('Sat Apr 14 2012 09:45:25 GMT-0600 (MDT)')+'', new Date(2012, 3, 14, 9, 45, 25).setUTCOffsetString('-0600')+'', 'parsing `Sat Apr 14 2012 09:45:25 GMT-0600 (MDT)` (JavaScript String Format)');
	equal($D('Tue Jun 22 17:47:27 +0000 2010')+'', new Date(2010, 5, 22, 17, 47, 27).setUTCOffsetString('0000')+'', 'parsing `Tue Jun 22 17:47:27 +0000 2010` (JavaScript String Format)');
	equal($D('8-Dec-2006 20:15:59')+'', new Date(2006, 11, 8, 20, 15, 59)+'', 'parsing `8-Dec-2006 20:15:59`');
	equal($D('8-Dec-2006 8:15pm')+'', new Date(2006, 11, 8, 20, 15)+'', 'parsing `8-Dec-2006 8:15pm`');
	equal($D('8-Dec-2006 08:15pm')+'', new Date(2006, 11, 8, 20, 15)+'', 'parsing `8-Dec-2006 08:15pm`');
	equal($D('10/28/2007')+'', new Date(2007, 9, 28)+'', 'parsing `10/28/2007`');
	equal($D('Oct 28, 2007')+'', new Date(2007, 9, 28)+'', 'parsing `Oct 28, 2007`');
	equal($D('Oct 28 2007')+'', new Date(2007, 9, 28)+'', 'parsing `Oct 28 2007`');
	equal($D('Sat Apr 14 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat Apr 14 2012`');
	equal($D('Sat, Apr 14 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat, Apr 14 2012`');
	equal($D('Sat Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat Apr, 14 2012`');
	equal($D('Sat, Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat, Apr, 14 2012`');
	equal($D('Saturday, Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Saturday, Apr, 14 2012`');
	equal($D('28 Oct 2007')+'', new Date(2007, 9, 28)+'', 'parsing `28 Oct 2007`');
	equal($D('10-28-2007 20:15')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 20:15`');
	equal($D('10-28-2007 8:15:00pm')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 8:15:00pm`');
	equal($D('10-28-2007 8:15pm')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 8:15pm`');
	equal($D('10-28-2007 8pm')+'', new Date(2007, 9, 28, 20, 0, 0)+'', 'parsing `10-28-2007 8pm`');
	equal($D('/Date(1296824894000)/')+'', new Date(2011, 1, 4, 6, 8, 14)+'', 'parsing `/Date(1296824894000)/`');
	equal($D('/Date(1296824894000-0700)/')+'', new Date(2011, 1, 4, 6, 8, 14).setUTCOffsetString('-0700')+'', 'parsing `/Date(1296824894000-0700)/`');

	// parsing times alone
	var today = new Date();
	today.setMilliseconds(0);
	today.setHours(20, 15, 0);
	equal($D('8:15:00pm')+'', today+'', 'parsing `8:15:00pm`');
	equal($D('8:15pm')+'', today+'', 'parsing `8:15pm`');
	today.setHours(20, 0, 0);
	equal($D('8pm')+'', today+'', 'parsing `8pm`');
});

test('Date.create() - string expression', function() {
	// control the date that will be used internally for current date
	var oldCurrent = Date.current;
	Date.current = function() {
		return new Date(2010,6,19);
	};

	equal($D('1 month from 10-28-2007')+'', new Date(2007, 10, 28)+'', 'parsing `1 month from 10-28-2007`');
	equal($D('2 days after 10-28-2007')+'', new Date(2007, 9, 30)+'', 'parsing `2 days after 10-28-2007`');
	equal($D('5 days before 10-28-2007')+'', new Date(2007, 9, 23)+'', 'parsing `5 days before 10-28-2007`');
	equal($D('5 days from today')+'', new Date(2010, 6, 24)+'', 'parsing `5 days from today`');
	equal($D('3 seconds before now')+'', new Date(2010, 6, 18, 23, 59, 57)+'', 'parsing `3 seconds before now`');

	equal($D('yesterday')+'', new Date(2010,6,18)+'', 'recognize "yesterday"');
	equal($D('today')+'', new Date(2010,6,19)+'', 'recognize "today"');
	equal($D('now')+'', new Date(2010,6,19)+'', 'recognize "now"');
	equal($D('tomorrow')+'', new Date(2010,6,20)+'', 'recognize "tomorrow"');

	equal($D('5 days ago')+'', new Date(2010,6,14)+'', 'recognize "5 days ago"');
	equal($D('2 hour ago')+'', new Date(2010,6,18,22)+'', 'recognize "2 hour ago"');
	equal($D('in 2 days')+'', new Date(2010,6,21)+'', 'recognize "in 2 days"');
	equal($D('23 minutes ago')+'', new Date(2010,6,18,23,37)+'', 'recognize "23 minutes ago"');

	equal($D('january 5')+'', new Date(2010,0,5)+'', 'recognize "january 5"');
	equal($D('jan 5')+'', new Date(2010,0,5)+'', 'recognize "jan 5"');
	equal($D('january 5th')+'', new Date(2010,0,5)+'', 'recognize "january 5th"');
	equal($D('january the 5th')+'', new Date(2010,0,5)+'', 'recognize "january the 5th"');

	equal($D('4 hours from now')+'', new Date(2010,6,19,4)+'', 'recognize "4 hours from now"');
	equal($D('next month')+'', new Date(2010,7,19)+'', 'recognize "next month"');
	equal($D('last week')+'', new Date(2010,6,12)+'', 'recognize "last week"');
	equal($D('last tuesday')+'', new Date(2010,6,13)+'', 'recognize "last tuesday"');
	equal($D('next monday')+'', new Date(2010,6,26)+'', 'recognize "next monday"');
	equal($D('last monday')+'', new Date(2010,6,12)+'', 'recognize "last monday"');

	equal($D('+2 hours')+'', new Date(2010,6,19,2,0,0)+'', 'recognize `+2 hours`');
	equal($D('-1 day')+'', new Date(2010,6,18)+'', 'recognize `-1 day`');
	equal($D('+3 weeks')+'', new Date(2010,7,9)+'', 'recognize `+3 weeks`');

	Date.current = function() {
		return new Date(2010,2,19);
	};			

	equal($D('this june')+'', new Date(2010,5,19)+'', 'recognize "this june"');
	equal($D('next june')+'', new Date(2010,5,19)+'', 'recognize "next june"');
	equal($D('next january')+'', new Date(2011,0,19)+'', 'recognize "next january"');
	equal($D('this march')+'', new Date(2011,2,19)+'', 'recognize "this march"');
	equal($D('last march')+'', new Date(2009,2,19)+'', 'recognize "last march"');

	Date.current = oldCurrent;
});

test('Date.create() - invalid strings return NaN', function() {
	equal($D('bubba')+'', NaN+'', '`bubba`');
	equal($D('25 13')+'', NaN+'', '`25 13`');
	equal($D('1')+'', NaN+'', '`1`');
	equal($D('2010-11-26T24:01:05.1794748-05:00')+'', NaN+'', 'invalid hours');
	equal($D('13/01.2006')+'', NaN+'', 'parsing `13/01.2006` should be NaN');
	equal($D('12 December-2006')+'', NaN+'', 'parsing `12 December-2006` should be NaN');

	equal($D('0006-08-01')+'', NaN+'', 'year starting with 0');
	equal($D('2006-13-01')+'', NaN+'', 'month 13');
	equal($D('2006-00-01')+'', NaN+'', 'month 00');
	equal($D('2006-08-32')+'', NaN+'', 'day 32');
});

test("Date.createUTC", function() {
	strictEqual(Date.createUTC('2006-08-01 20:15:59')+'', new Date(2006, 7, 1, 20, 15, 59).setUTCOffset(0)+'', 'parsing `2006-08-01 20:15:59` as UTC');
	/*
	equal($D('2006-08-01 20:15')+'', new Date(2006, 7, 1, 20, 15)+'', 'parsing `2006-08-01 20:15`');
	equal($D('2006-08-01 20:15:59')+'', new Date(2006, 7, 1, 20, 15, 59)+'', 'parsing `2006-08-01 20:15:59`');
	equal($D('2006-08-01 00:15:59')+'', new Date(2006, 7, 1, 0, 15, 59)+'', 'parsing `2006-08-01 00:15:59`');
	equal($D('2006-08-01T00:15:59+01:00')+'', new Date(2006, 7, 1, 0, 15, 59).setUTCOffsetString('+01:00')+'', 'parsing `2010-03-15T12:34:56+01:00` (full iso 8601)');
	equal($D('2010-11-26T12:01:05.179-05:00').getTime(), new Date(2010, 10, 26, 12, 1, 5, 179).setUTCOffsetString('-05:00').getTime(), 'parsing `2010-11-26T12:01:05.179-05:00` (full iso 8601 with milliseconds)');
	equal($D('2010-11-26T12:01:05.1794748-05:00').getTime(), new Date(2010, 10, 26, 12, 1, 5, 179).setUTCOffsetString('-05:00').getTime(), 'parsing `2010-11-26T12:01:05.1794748-05:00` (full iso 8601 with microseconds)');
	equal($D('12-01-2006')+'', new Date(2006, 11, 1)+'', 'parsing `12-01-2006`');
	equal($D('12-1-2006')+'', new Date(2006, 11, 1)+'', 'parsing `12-1-2006`');
	equal($D('13.1.2006')+'', new Date(2006, 0, 13)+'', 'parsing `13.1.2006`');
	equal($D('13.01.2006')+'', new Date(2006, 0, 13)+'', 'parsing `13.01.2006`');
	equal($D('13/1/2006')+'', new Date(2006, 0, 13)+'', 'parsing `13/1/2006`');
	equal($D('13/01/2006')+'', new Date(2006, 0, 13)+'', 'parsing `13/01/2006`');
	equal($D('8-Dec-2006')+'', new Date(2006, 11, 8)+'', 'parsing `8-Dec-2006`');
	equal($D('8 Dec 2006')+'', new Date(2006, 11, 8)+'', 'parsing `8 Dec 2006`');
	equal($D('Thu, 8 Dec 2011')+'', new Date(2011, 11, 8)+'', 'parsing `Thu, 8 Dec 2006`');
	equal($D('Thu 8 Dec 2011')+'', new Date(2011, 11, 8)+'', 'parsing `Thu 8 Dec 2006`');
	equal($D('08-Dec-2006')+'', new Date(2006, 11, 8)+'', 'parsing `08-Dec-2006`');
	equal($D('12-December-2006')+'', new Date(2006, 11, 12)+'', 'parsing `12-December-2006`');
	equal($D('12 December 2006')+'', new Date(2006, 11, 12)+'', 'parsing `12 December 2006`');
	equal($D('Thu, 21 Dec 2000 16:01:07 +0200')+'', new Date(2000, 11, 21, 16, 1, 7).setUTCOffsetString('+0200')+'', 'parsing `Thu, 21 Dec 2000 16:01:07 +0200` (rfc 2822)');
	equal($D('Thu, 21 Dec 2000 16:01:07 GMT+0200')+'', new Date(2000, 11, 21, 16, 1, 7).setUTCOffsetString('+0200')+'', 'parsing `Thu, 21 Dec 2000 16:01:07 GMT+0200`');
	equal($D('Sat Apr 14 2012 09:45:25 GMT-0600 (MDT)')+'', new Date(2012, 3, 14, 9, 45, 25).setUTCOffsetString('-0600')+'', 'parsing `Sat Apr 14 2012 09:45:25 GMT-0600 (MDT)` (JavaScript String Format)');
	equal($D('Tue Jun 22 17:47:27 +0000 2010')+'', new Date(2010, 5, 22, 17, 47, 27).setUTCOffsetString('0000')+'', 'parsing `Tue Jun 22 17:47:27 +0000 2010` (JavaScript String Format)');
	equal($D('8-Dec-2006 20:15:59')+'', new Date(2006, 11, 8, 20, 15, 59)+'', 'parsing `8-Dec-2006 20:15:59`');
	equal($D('8-Dec-2006 8:15pm')+'', new Date(2006, 11, 8, 20, 15)+'', 'parsing `8-Dec-2006 8:15pm`');
	equal($D('8-Dec-2006 08:15pm')+'', new Date(2006, 11, 8, 20, 15)+'', 'parsing `8-Dec-2006 08:15pm`');
	equal($D('10/28/2007')+'', new Date(2007, 9, 28)+'', 'parsing `10/28/2007`');
	equal($D('Oct 28, 2007')+'', new Date(2007, 9, 28)+'', 'parsing `Oct 28, 2007`');
	equal($D('Oct 28 2007')+'', new Date(2007, 9, 28)+'', 'parsing `Oct 28 2007`');
	equal($D('Sat Apr 14 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat Apr 14 2012`');
	equal($D('Sat, Apr 14 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat, Apr 14 2012`');
	equal($D('Sat Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat Apr, 14 2012`');
	equal($D('Sat, Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Sat, Apr, 14 2012`');
	equal($D('Saturday, Apr 14, 2012')+'', new Date(2012, 3, 14)+'', 'parsing `Saturday, Apr, 14 2012`');
	equal($D('28 Oct 2007')+'', new Date(2007, 9, 28)+'', 'parsing `28 Oct 2007`');
	equal($D('10-28-2007 20:15')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 20:15`');
	equal($D('10-28-2007 8:15:00pm')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 8:15:00pm`');
	equal($D('10-28-2007 8:15pm')+'', new Date(2007, 9, 28, 20, 15, 0)+'', 'parsing `10-28-2007 8:15pm`');
	equal($D('10-28-2007 8pm')+'', new Date(2007, 9, 28, 20, 0, 0)+'', 'parsing `10-28-2007 8pm`');
	equal($D('/Date(1296824894000)/')+'', new Date(2011, 1, 4, 6, 8, 14)+'', 'parsing `/Date(1296824894000)/`');
	equal($D('/Date(1296824894000-0700)/')+'', new Date(2011, 1, 4, 6, 8, 14).setUTCOffsetString('-0700')+'', 'parsing `/Date(1296824894000-0700)/`');		
	*/
});
		
test('customize patterns', function() {
	notEqual($D('1/3/2006')+'', $D(2006,2,1)+'', 'before removing us pattern');
	var us = Date.removePattern('us');
	equal(us[0], 'us', 'got removed us pattern');
	equal($D('1/3/2006')+'', $D(2006,2,1)+'', 'remove us pattern');
	Date.addPattern(us, 'world');
	equal($D('1/3/2006')+'', $D(2006,2,1)+'', 'us pattern added after wold pattern');
	Date.removePattern('us');
	Date.addPattern(us);
	equal(Date.create.patterns[0]+'', us+'', 'us pattern added to beginning');
});


