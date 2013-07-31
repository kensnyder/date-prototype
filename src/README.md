<%- pkg.title %>
=

Version <%- pkg.version %>, <%- grunt.template.today("mmm yyyy") %>, MIT License

<%- pkg.description %>

[Download](<%- pkg.homepage %>/<%- pkg.constructor_name %>-<%- pkg.version %>-Download.zip?raw=true), [Demos](#), [Unit tests](#)

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
<link  href="/js/<%- pkg.constructor_name %>.min.css" rel="stylesheet" />
<script src="/js/<%- pkg.constructor_name %>.min.js"></script>
```

Then somewhere in your code, call:

```javascript
var instance = new $.<%- pkg.constructor_name %>(selector, options);
// OR
$(selector).<%- pkg.method %>(options);
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
	<% _.forEach(options, function(option) { %><tr>
		<td>{<%- option.type.replace('JQuery','jQuery') %>}</td>
		<td><strong><%- option.name %></strong></td>
		<td><%- option.optdefault %></td>
		<td><%- option.description %></td>
	</tr>
	<% }); %>
</table>

Also note that default options can be overwritten by altering `$.<%- pkg.constructor_name %>.defaultOptions`.

Events
-

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.one()`, `.unbind()` and `.trigger()`

For example:

```javascript
// Register events in initial options
$(input).<%- pkg.method %>({
	option1: value1,
	onEVENT: doStuff
});
// Register events later
$(input).<%- pkg.method %>({
	option1: value1
}).<%- pkg.method %>('bind', 'EVENT', doStuff);
```

How is data passed to event callbacks?

* Each event callback receives one argument: `event`
* `event` is a jQuery event object
* `event` also contains useful information related to the event. See the [Events](#events) section below for more information.
* When an event has a default action that can be prevented, `event` will have property `cancelable` set to true and `event.isCancelable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* In some case, altering information on the `event` object will change the behavior of the default action
* The callback will be fired in the scope of the <%- pkg.constructor_name %> instance. In other words, using `this` in the callback will refer to the <%- pkg.constructor_name %> instance. See the [Instance Properties](#instance-properties) and [Instance Methods](#instance-methods) sections below for more information.

The following is a description of each event.

<table>
	<tr>
		<th>Event</th>
		<th>Data available on <code>event</code></th>
		<th>Effect of `event.preventDefault()`</th>
	</tr>
	<% _.forEach(events, function(event) { %><tr>
		<td><strong><%- event.name %></strong><br /><%- event.description %></td>
		<td>
		<% _.forEach(event.params || [], function(param) { %>	{<%- (param.type || '').replace('JQuery','jQuery') %>} <strong><%- param.name %></strong> <%- param.description %><br />
		<% }); %></td>
		<td><%- event.ifprevented || '-' %></td>
	</tr>
	<% }); %>
</table>
			
Instance Properties
-

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	<tr>
	<% _.forEach(properties, function(prop) { %><tr>
		<td>{<%- prop.type.replace('JQuery','jQuery')%>}</td>
		<td><strong><%- prop.name %></strong></td>
		<td><%- prop.description %></td>
	</tr>
	<% }); %>
</table>

Instance Methods
-

Instance methods may be called using an Object Oriented style or with the classic jQuery style:

```javascript
// Object Oriented Style
var <%- pkg.method %> = new $.<%- pkg.constructor_name %>(input, options);
<%- pkg.method %>.methodName(arg1, arg2, argN);

// jQuery Style
$(input).<%- pkg.method %>(options);
$(input).<%- pkg.method %>('methodName', arg1, arg2, argN);

// jQuery Style followed by Object Oriented Style
$(input).<%- pkg.method %>(options);
var instance = $(input).<%- pkg.method %>('getInstance');
instance.methodName(arg1, arg2, argN);
```

<table>
<% _.forEach(methods, function(method) { %>
<tr>
	<td>
		<strong><%- method.name %></strong>(<% _.forEach(method.params || [], function(param, i) { %><% if (param.optional) { %>[<% } %><% if (i !== 0) { %>, <% } %><%- param.name %><% if (param.optdefault !== undefined) { %>=<%- param.optdefault %><% } %><% if (param.optional) { %>]<% } %><% }); %>)<br />
		<%- method.description %><% if (_.size(method.params) > 0) { %><br /><% } %>
		<% _.forEach(method.params || [], function(param, i) { %><strong>@param</strong> {<%- param.type.replace('JQuery','jQuery') %>} <% if (param.optional) { %>[<% } %><%- param.name %><% if (param.optdefault !== undefined) { %>=<%- param.optdefault %><% } %><% if (param.optional) { %>]<% } %> <%- param.description %><% }); %><br />
		<strong>@return</strong> <% if (method.return) { %>{<%- method.return.type.replace('JQuery','jQuery') %>} <%- method.return.description %><% } else { %>{undefined}<% } %>
	</td>
</tr>
<% }); %>
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

To report bugs, add an issue to the [GitHub issue tracker](<%- pkg.bugs %>).


License
-

Copyright 2012-2013, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)
