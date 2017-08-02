# Donleeve
Allows you to perform an action when your website visitor is about to leave (exit intent). **Even on mobile.** Uses `localStorage` to prevent the action from occurring too often.

# [Demo](https://hdodov.github.io/donleeve/)

Can be seen [here](https://hdodov.github.io/donleeve/).

# Installation

```
npm install donleeve
```

or

```
git clone https://github.com/hdodov/donleeve
```

# Dependencies

## [active-timeout.js](https://github.com/hdodov/active-timeout.js)

The first several seconds of a user's visit are crucial and it would be bad if you pissed him off with an exit intent modal that was triggered by a false positive. That's why the event listeners who watch the user's behavior are bound after a set delay.

However, your user might have opened your site in a new tab for later reading. In that case, the bind delay would be useless and would pass while the user was inactive.

**That's why this library is used.** It allows you to invoke a function after a set amount of *active* time. That is, time that passed *while the user was viewing the page*.

# Blocking

For better user experience, there are two types of blocking that can prevent the exit intent action from happening even if the conditions are met.

## Flag blocking

This is a short-term block. When the user sees the exit intent for the first time, the `Donleeve.acted` flag is raised. If `ignoreFlagBlocking` in the options is not enabled, the visitor won't be seeing any exit intents until he refreshes the page.

## Storage blocking

This is a long-term block that utilizes `localStorage`. It's an array of objects with two values inside:

- Regex string. Controls which pages a block affects. If the regex matched the current URL it will block the current page. If not, this block will be ignored. The default value is `*` and blocks **all** pages.
- UNIX timestamp. Defines a point in the future until which this block is going to be active.

## Example

If an exit intent is triggered on a page with `storageBlockingRegex` set to `\\?para\\=[0-9]` and `storageBlockingMinutes` set to `10`, something like this would be created:

```js
["\\?para\\=[0-9]", 1501680075442]
```

When Donleeve tries to emit the `onAction` event, it would check all listed blocks that have their specified regex match the current URL. If a block matches it and its time is greater than `Date.now()`, the action would be blocked. After 10 minutes have passed since the block's creation, the block will be obsolete.

# API

## Properties

```js
Donleeve.options    // The configuration object.
Donleeve.enabled    // Set to `false` to disable Donleeve.
Donleeve.acted      // Whether the exit intent action fired on this page visit.
```

## Methods

```js
/**
 * Loops through all the keys of an object and saves them in `_conf`.
 * @param {object} options
 */
Donleeve.setOptions(options)

/**
 * Optionally configures the library, gives it an action callback and binds
 * the exit intent triggers after the initial bind delay.
 * @param  {object}   config   Optional configuration object used to modify
 *                             `_conf`.
 * @param  {function} callback Function to call when the exit intent must be
 *                             activated.
 */
Donleeve.init(config, callback)

/**
 * This function gives you the ability to remove old storage blocks. For
 * example, if you set a block for 2 weeks and later decide to reduce it to
 * 5 minutes, any visitor who came while the block was 2 weeks will have to
 * wait for it to pass.
 *
 * With this function, you can pass a string that is saved in the storage.
 * If its new value differs from the old one, the blocks are purged.
 *
 * Back to our example. You release version 1 of your site with the 2 week
 * block and pass "v1" to this function. It is saved. Then, when you release
 * version 2 with the 5 minute block, you pass "v2" to this function. It
 * notices the difference and clears the previous blocks.
 * @param  {string} purge The purge string.
 */
Donleeve.purgeBlocks(purge)
```

## Events

```js
// Fired after the user tracking events have been attached.
Donleeve.onBound

// Fired when any event triggered and met the exit intent condition.
// Receives one argument - the DOM event that was triggered.
Donleeve.onTrigger 

// Fired when the action was blocked by localStorage.
// Receives two arguments - the regex string used to check the URL, the time remaining on the block.
Donleeve.onStorageBlock 

// The main action callback. Set via `init()`.
// Receives one argument - the DOM event that triggered the action.
Donleeve.onAction
```

## Options

```js
bindDelay               // Time to wait before binding the user tracking events.
bindEventBlur           // Whether to use the "onblur" event.
bindEventMouseLeave     // Whether to use the "onmouseleave" event.
bindEventMouseMove      // Whether to use the "onmousemove" event.
storageBlockingRegex    // What blocking regex to apply on this page. Default is "*" and blocks on all URLs.
storageBlockingMinutes  // For how many minutes the storage block lasts.
ignoreStorageBlocking   // Whether to ignore storage blocks.
ignoreFlagBlocking      // Whether to fire the action once per page visit. `Donleeve.acted` is the flag.
```

# Usage

Start by including [active-timeout.js](https://github.com/hdodov/active-timeout.js) and Donleeve in your page:

```html
<script src="node_modules/active-timeout.js/dist/active-timeout.min.js"></script>
<script src="node_modules/donleeve/dist/donleeve.min.js"></script>
```

After that, initialize Donleeve:

```js
Donleeve.init({
    bindDelay: 2000
}, function (e) {
    alert("STAY ON MY PAGE, PLEASE.");
});
```

**Note: If you couldn't do your exit intent action for some reason, you can return `false` in the callback function to make Donleeve act as if nothing happened and add no blocks.**

# Changelog

1.0.0 - Initial release.