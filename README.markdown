This script provides JavaScript Date instance methods for parsing, formatting, and calculating dates. It leverages the existing functionality of the native Date.parse method and uses a concise and configurable algorithm for interpreting format codes.

Features include:
 * Parse various formats with ability to register custom format parsing.
 * Format dates using the well-known percent-letter formatting options with the ability to register custom formating.
 * Add and subtract years, months, days, hours, minutes or seconds.
 * Calculate differences between dates in the given unit.
 * Methods are available on all Date Objects.

Examples:
 * $D('2006-09-20').strftime('%m/%d/%Y'); // "09/20/2006"
 * $D('Sep 20 2006').add(3).strftime('%Y-%m-%d'); // "2006-09-23"
 * $D('09/20/2006').add(4, 'years').strftime('%Y-%m-%d'); // "2010-09-20"
 * $D('09/20/2006 20:15:00').add(4, 'hours').format('%Y-%m-%d %H:%M:%S'); // "2006-09-21 00:15:00"
 * $D('2006-09-20').format('m/d/Y'); // "09/20/2006"
 * $D('2006.09.28').diff('20 Sep, 2006', 'days'); // 8

See reference.html for demo and complete guide