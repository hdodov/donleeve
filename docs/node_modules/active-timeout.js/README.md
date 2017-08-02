# active-timeout.js
Lets you measure time the user has spent **viewing** your page. If he focuses another tab or minimizes the browser, that inactive time will **not** be counted.

# [Demo](https://hdodov.github.io/active-timeout/)
Can be seen [here](https://hdodov.github.io/active-timeout/)

# Installation
```
npm install active-timeout.js
```
or
```
git clone https://github.com/hdodov/active-timeout.js
```

# Usage
Make sure to include the library somewhere in your page:
```html
<script type="text/javascript" src="active-timeout.min.js"></script>
```

## API
```js
// Pulse at ~60 intervals per second until the predicate function
// returns a falsy value.
ActiveTimeout.pulse(function (tick) {
    // `tick` holds the time in milliseconds from the last tick to the
    // current one.
    console.log(tick); // ~16
    return true;
});

// Uses `pulse()` and adds its ticks to count time until the predicate
// function returns a falsy value.
ActiveTimeout.count(function (time) {
    // `time` holds the *active* time passed up to this point.
    return true;
});

// Uses `count()` to invoke a callback function after a set amount of
// *active* time has passed.
ActiveTimeout.set(function () {
    // Invoked when the timeout ends.
}, 10000);

// Optionally, `set()` can receive a second function to invoke upon
// each timer tick.
ActiveTimeout.set(function () {
    // Invoked when the timeout ends.
}, function (remainder, tick) {
    // `remainder` holds the time left until the timeout ends
    // `tick`      holds the time since the last tick
}, 10000);
```
