module("Scheduler");
////test('schedule', 3, function() {
//	stop(350);
//	var d = $D('+250 milliseconds');
//	var ms = new Date().getTime();
//	var callback1 = function() {
//		var diff = new Date().getTime() - ms;
//		// expect 250 ms, but give it a bit of wiggle room
//		equal(diff > 200 && diff < 299, true, 'scheduled for 250 milliseconds in the future (actually fired at ' + diff + 'ms)');
//	};
//	d.schedule(callback1);
//	equal(d.getSchedule().length, 1, 'schedule has one item');
//	setTimeout(function() {
//		equal(d.getSchedule().length, 0, 'schedule is empty again');
//		start();
//	}, 300);
//});
//
//test('schedule in past', 1, function() {
//	var d = $D('-250 milliseconds');
//	var ms = new Date().getTime();
//	var callback2 = function() {
//		var diff = new Date().getTime() - ms;
//		equal(diff < 50, true, 'called immediately if scheduled in past (actually fired at ' + diff + 'ms)');
//	};
//	d.schedule(callback2);
//});
//
//test('unschedule', 1, function() {
//	stop(500);
//	var callback3 = function() {
//		ok(false, 'oops. it was called even after unscheduling.');
//	};
//	var d = $D('+250 milliseconds');
//	d.schedule(callback3);
//	d.unschedule(callback3);
//	setTimeout(function() {
//		equal(d.getSchedule().length, 0, 'schedule is empty');
//		start();
//	}, 400);
//});