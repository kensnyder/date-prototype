module("Format");
test('Date#strftime()', function() {
	equal($D(2006,8,9).strftime('%Y'), '2006', 'Format code "%Y" returns 4-digit year');
	equal($D(2006,8,9).strftime('%y'), '06', 'Format code "%y" returns 2-digit year');

	equal($D(2006,8,9).strftime('%m'), '09', 'Format code "%m" returns 2-digit month');
	equal($D(2006,8,9).strftime('%#m'), 9, 'Format code "%#m" returns month integer');
	equal($D(2006,8,9).strftime('%B'), 'September', 'Format code "%B" returns full month name');
	equal($D(2006,8,9).strftime('%b'), 'Sep', 'Format code "%b" returns abbreviated month name');
	equal($D(2006,8,9).strftime('%d'), '09', 'Format code "%d" returns 2-digit day');
	equal($D(2006,8,9).strftime('%#d'), 9, 'Format code "%#d" returns day integer');
	equal($D(2006,8,9).strftime('%e'), 9, 'Format code "%e" returns day integer');

	equal($D(2006,8,9).strftime('%A'), 'Saturday', 'Format code "%A" returns full weekday name');
	equal($D(2006,8,9).strftime('%a'), 'Sat', 'Format code "%a" returns abbreviated day name');
	equal($D(2006,8,9).strftime('%w'), 6, 'Format code "%w" returns day of week integer');
	equal($D(2006,8,3).strftime('%o'), 'rd', 'Format code "%o" returns ordinal string');

	equal($D(2006,8,3,15).strftime('%H'), '15', 'Format code "%H" returns 2-digit hour (24-hour clock)');
	equal($D(2006,8,3,9).strftime('%#H'), 9, 'Format code "%#H" returns hour integer (24-hour clock)');
	equal($D(2006,8,3,15).strftime('%I'), '03', 'Format code "%I" returns 2-digit hour (12-hour clock)');
	equal($D(2006,8,3,15).strftime('%#I'), 3, 'Format code "%#I" returns hour integer (12-hour clock)');
	equal($D(2006,8,3,0,3).strftime('%M'), '03', 'Format code "%M" returns 2-digit minute');
	equal($D(2006,8,3,0,3).strftime('%#M'), 3, 'Format code "%#M" returns minute integer');
	equal($D(2006,8,3,2).strftime('%p'), 'AM', 'Format code "%p" returns AM/PM');
	equal($D(2006,8,3,2).strftime('%P'), 'am', 'Format code "%P" returns am/pm');

	equal($D(2006,8,3,0,0,9).strftime('%S'), '09', 'Format code "%S" returns 2-digit second');
	equal($D(2006,8,3,0,0,9).strftime('%#S'), 9, 'Format code "%#S" returns second integer');
	var u = new Date();
	equal($D(u).strftime('%s'), Math.round(u.getTime() / 1000, 0), 'Format code "%s" returns a unix timestamp');
});

test('Date#formatPhp()', function() {
	equal($D(2006,8,9).formatPhp('Y'), '2006', 'Format code "Y" returns 4-digit year');
	equal($D(2006,8,9).formatPhp('y'), '06', 'Format code "y" returns 2-digit year');

	equal($D(2006,8,9).formatPhp('m'), '09', 'Format code "m" returns 2-digit month');
	equal($D(2006,8,9).formatPhp('n'), 9, 'Format code "n" returns month integer');
	equal($D(2006,8,9).formatPhp('F'), 'September', 'Format code "F" returns full month name');
	equal($D(2006,8,9).formatPhp('M'), 'Sep', 'Format code "M" returns abbreviated month name');
	equal($D(2006,8,9).formatPhp('d'), '09', 'Format code "dd" returns 2-digit day');
	equal($D(2006,8,9).formatPhp('j'), 9, 'Format code "j" returns day integer');

	equal($D(2006,8,9).formatPhp('l'), 'Saturday', 'Format code "l" (lowercase "L") returns full day name');
	equal($D(2006,8,9).formatPhp('D'), 'Sat', 'Format code "D" returns abbreviated weekday name');
	equal($D(2006,8,9).formatPhp('w'), 6, 'Format code "w" returns day of week integer');
	equal($D(2006,8,3).formatPhp('S'), 'rd', 'Format code "S" returns ordinal string');

	equal($D(2006,8,3,15).formatPhp('H'), '15', 'Format code "H" returns 2-digit hour (24-hour clock)');
	equal($D(2006,8,3,9).formatPhp('h'), 9, 'Format code "h" returns hour integer (24-hour clock)');
	equal($D(2006,8,3,15).formatPhp('G'), '15', 'Format code "G" returns 2-digit hour (12-hour clock)');
	equal($D(2006,8,3,15).formatPhp('g'), 3, 'Format code "g" returns hour integer (12-hour clock)');
	equal($D(2006,8,3,0,3).formatPhp('i'), '03', 'Format code "i" returns 2-digit minute');
	equal($D(2006,8,3,2).formatPhp('A'), 'AM', 'Format code "A" returns AM/PM');
	equal($D(2006,8,3,2).formatPhp('a'), 'am', 'Format code "a" returns am/pm');

	equal($D(2006,8,3,0,0,9).formatPhp('s'), '09', 'Format code "s" returns 2-digit second');
	var u = new Date();
	equal($D(u).formatPhp('U'), Math.round(u.getTime() / 1000, 0), 'Format code "U" returns a unix timestamp');
});

test('Date#formatSql()', function() {
	equal($D(2006,8,9).formatSql('yyyy'), '2006', 'Format code "yyyy" returns 4-digit year');
	equal($D(2006,8,9).formatSql('yy'), '06', 'Format code "yy" returns 2-digit year');

	equal($D(2006,8,9).formatSql('mm'), '09', 'Format code "mm" returns 2-digit month');
	equal($D(2006,8,9).formatSql('m'), 9, 'Format code "m" returns month integer');
	equal($D(2006,8,9).formatSql('mmmm'), 'September', 'Format code "mmmm" returns full month name');
	equal($D(2006,8,9).formatSql('mmm'), 'Sep', 'Format code "mmm" returns abbreviated month name');
	equal($D(2006,8,9).formatSql('dd'), '09', 'Format code "dd" returns 2-digit day');
	equal($D(2006,8,9).formatSql('d'), 9, 'Format code "d" returns day integer');

	equal($D(2006,8,9).formatSql('dddd'), 'Saturday', 'Format code "dddd" returns full weekday name');
	equal($D(2006,8,9).formatSql('ddd'), 'Sat', 'Format code "ddd" returns abbreviated day name');

	equal($D(2006,8,3,15).formatSql('hh24'), '15', 'Format code "hh24" returns 2-digit hour (24-hour clock)');
	equal($D(2006,8,3,9).formatSql('h24'), 9, 'Format code "h24" returns hour integer (24-hour clock)');
	equal($D(2006,8,3,15).formatSql('hh12'), '03', 'Format code "hh12" returns 2-digit hour (12-hour clock)');
	equal($D(2006,8,3,15).formatSql('h12'), 3, 'Format code "h12" returns hour integer (12-hour clock)');
	equal($D(2006,8,3,0,3).formatSql('mi'), '03', 'Format code "mi" returns 2-digit minute');
	equal($D(2006,8,3,2).formatSql('am'), 'AM', 'Format code "am" returns AM/PM');
	equal($D(2006,8,3,2).formatSql('pm'), 'AM', 'Format code "pm" returns AM/PM');
	equal($D(2006,8,9).formatSql('w'), 6, 'Format code "w" returns day of week integer');

	equal($D(2006,8,3,0,0,9).formatSql('ss'), '09', 'Format code "ss" returns 2-digit second');
});