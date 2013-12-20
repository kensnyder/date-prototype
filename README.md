Date Prototype methods
=

Version 3.5.0-pre, Jul 2013, MIT License

Date instance methods for parsing, formatting, and calculating dates

[Download](/Date-3.5.0-pre-Download.zip?raw=true), [Demos](#), [Unit tests](#)

Table of Contents
-

<ul>
	<li><a href="#introduction">Introduction</a></li>
	<li><a href="#how-to-use">How to Use</a></li>
	<li><a href="#options">Options</a></li>
	<li><a href="#events">Events</a></li>
	<li><a href="#instance-properties">Instance Properties</a></li>
	<li><a href="#instance-methods">Instance Methods</a></li>
	<li><a href="#static-members">Static Members</a></li>
	<li><a href="#more-examples">More Examples</a></li>
	<li><a href="#changelog">Changelog</a></li>
	<li><a href="#contributing">Contributing</a></li>
	<li><a href="#reporting-bugs">Reporting Bugs</a></li>
	<li><a href="#license">License</a></li>
</ul>

Introduction
-

Features include:

* One
* Two
* Unit tested
* Works on IE8+, FF, Chrome, Safari
* Compatible with AMD


How to Use
-

Hi

```html
<link  href="/js/Date.min.css" rel="stylesheet" />
<script src="/js/Date.min.js"></script>
```

Then somewhere in your code, call:

```javascript
var instance = new $.Date(selector, options);
// OR
$(selector).(options);
```

See the documentation below for a full list of options.

Options
-

<table>
	<tr>
		<th>Type</th>
		<th>Option Name</th>
		<th>Default</th>
		<th>Description</th>
	<tr>
	
</table>

Also note that default options can be overwritten by altering `$.Date.defaultOptions`.

Events
-

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.one()`, `.unbind()` and `.trigger()`

For example:

```javascript
// Register events in initial options
$(input).({
	option1: value1,
	onEVENT: doStuff
});
// Register events later
$(input).({
	option1: value1
}).('bind', 'EVENT', doStuff);
```

How is data passed to event callbacks?

* Each event callback receives one argument: `event`
* `event` is a jQuery event object
* `event` also contains useful information related to the event. See the [Events](#events) section below for more information.
* When an event has a default action that can be prevented, `event` will have property `cancelable` set to true and `event.isCancelable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* In some case, altering information on the `event` object will change the behavior of the default action
* The callback will be fired in the scope of the Date instance. In other words, using `this` in the callback will refer to the Date instance. See the [Instance Properties](#instance-properties) and [Instance Methods](#instance-methods) sections below for more information.

The following is a description of each event.

<table>
	<tr>
		<th>Event</th>
		<th>Data available on <code>event</code></th>
		<th>Effect of `event.preventDefault()`</th>
	</tr>
	
</table>
			
Instance Properties
-

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	<tr>
	
</table>

Instance Methods
-

Instance methods may be called using an Object Oriented style or with the classic jQuery style:

```javascript
// Object Oriented Style
var  = new $.Date(input, options);
.methodName(arg1, arg2, argN);

// jQuery Style
$(input).(options);
$(input).('methodName', arg1, arg2, argN);

// jQuery Style followed by Object Oriented Style
$(input).(options);
var instance = $(input).('getInstance');
instance.methodName(arg1, arg2, argN);
```

<table>

</table>

More examples
-

Stuff

```javascript

```

Changelog
-

**Version 0.1.0, July 2013**
* initial version


Contributing
-

After using git to clone the repo, you'll need nodejs, npm, and grunt-cli installed. See [gruntjs.com](http://gruntjs.com/getting-started) for more information. Then inside the cloned directory run `npm install` and then `grunt`

Make updates only to the files in the `./src` directory. Then run `grunt` to automatically generate documentation and other files. You may also make changes to the demos by editing `./demos/*` files or improve the build process by editing `./Gruntfile.js`. Then make a pull request.


Reporting Bugs
-

To report bugs, add an issue to the [GitHub issue tracker]().


License
-

Copyright 2012-2013, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)
