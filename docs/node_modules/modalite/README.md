# Modalite
Is the simplest JavaScript modal library. No jQuery, classes... Just a few HTML attributes.

# [Demo](https://hdodov.github.io/modalite/)
Can be seen [here](https://hdodov.github.io/modalite/).

# Installation

```
npm install modalite
```

or

```
git clone https://github.com/hdodov/modalite/
```

# How to use?
You could use the Modalite modal template and CSS, it takes responsiveness into consideration. If you're not interested in that, you can create your modal from scratch too.

Whatever you do, start by including the Modalite JavaScript in your page:
```html
<script type="text/javascript" src="path/to/modalite.min.js"></script>
```

## Building a modal with the Modalite template
The CSS provided by the library styles the modal so that it's visible only when it has the `modal-visible` class. It also styles the close button, container and content area. For modals with the `modal-remote` class, an overlay and loading spinner are also added. To have all of that, simply include the CSS:

```html
<link rel="stylesheet" type="text/css" href="path/to/modalite.min.css">
```

Then, to create a modal, use this template:

```html
<div id="my-modal-id" class="modal" data-modal>
    <div class="modal-container">
        <div class="modal-close" data-close-modal></div>

        <div class="modal-content">
            <h1>My content here!</h1>
        </div>
    </div>
</div>
```

At this point, your modal will be sitting silently and won't be visible. Now, you need to add a trigger:

```html
<p data-open-modal="my-modal-id">Click me for a juicy modal!</p>
```

**Note: If you have a remote modal, it won't have the loading spinner and overlay unless you add the `modal-remote` class to the element with the `data-modal` attribute.**

## Building a modal with your own CSS
To create a modal, you simply need to:

1. Add an element with the `data-modal` attribute and give it an `id`. Style it so that it's hidden. You can use the `visibility` CSS property. It's good for the job, because it's affected by transitions and makes animations a whole lot easier. Add another rule-set for when the element has the `modal-visible` class. This should define its visible behaviour.
2. Add an element with the `data-open-modal` attribute and set its value to equal the previously created modal's `id`. When clicked, this will add the `modal-visible` class to the targeted modal.
3. **Optionally**, you can add a close button for the modal. By default, it will be closed when its background is clicked, as this is expected modal behaviour. To add a close functionality, simply add any element **inside** the modal and give it the `data-close-modal` attribute.

For example, this would be a fully functional modal:

```html
<div id="my-modal" data-modal>
    <p data-close-modal>Close me!</p>
</div>

<p data-open-modal="my-modal">Open the modal!</p>
```

You just need to add some CSS to make the modal is invisible by default and add some styles that show it when it has the `modal-visible` class.

# Remote modals
They rock! Have a 5MB Privacy Policy? Remote modals are the way. No need to demolish your page loading times with something nobody's going to read. **Ever.** Simply load all of that text when the modal is opened. This way, if your visitor isn't interested in your Privacy Policy, he wouldn't have to wait for it to load in those crucial first seconds of his visit.

## How do remote modals work?
When the modal is opened, its contents are searched for elements with the `data-modal-remote` attribute. It should hold the URL to the desired resource. However, DOM operations can be costly, especially for large elements. Suppose you decided to actually splatter that Privacy Policy directly in your modal. It could have thousands of elements... searching for an attribute that might not even exist will be a huge overhead.

That's why the remote modal must have the `data-modal-has-remote` attribute. Without it, you'll just be having a regular modal. No DOM searches will be performed whatsoever.

When an element with `data-modal-remote` is found, two things can happen:

- If the element is **not** an `<iframe>`, an XHR to the remote URL will be initiated. The contents of the element will be replaced with the XHR response text.
- If the element **is** an `<iframe>`, its `src` attribute will simply be set to the remote URL specified in `data-modal-remote`.

**Note: Remote resources are loaded only once! If you close the modal and open it again, nothing would happen.**

## How to create a remote modal?
It's the same thing as before, but with two additional steps:

4. Add the `data-modal-has-remote` attribute to your modal.
5. Add the `data-modal-remote` attribute to any element **inside** the modal. Its value should be set to the URL of the remote resource.

This would be a fully functioning _remote_ modal:

```html
<div id="my-modal" data-modal data-modal-has-remote>
    <div data-modal-remote="path/to/my/file.txt">
        Get ready for the content!!!
    </div>
</div>

<p data-open-modal="my-modal">Open the modal!</p>
```

**Note: You can load any file type, as long as it's text. If you're loading HTML, be wary... it may contain harmful `<script>` tags that could inject JavaScript and compromise the security of your site!**

# API
Modals are opened and closed just by adding/removing their visibility class. However, if the modal has to load any remote resources, that won't be enough.

```js
/**
 * Adds the visibility class to a modal and loads its remotes.
 * @param  {object/string} modal The modal DOM element or its ID attribute.
 */
Modalite.open(modal);

/**
 * Removes the visibility class from a modal.
 * @param  {object/string} modal The modal DOM element or its ID attribute.
 */
Modalite.close(modal);
```

# Styling guide
Here are the CSS classes provided by Modailte that you can use to style your modals.

## Modal classes
Added to the element with attribute `data-modal`.

- `modal-visible`: Bread and butter. Added when the modal is opened and removed when it's closed.
- `modal-loading`: Added when the modal starts loading remote resources. Removed when all remote resources in the modal have finished loading or failed to do so<.
- `modal-loaded`: Added at the same time `modal-loading` is removed.
- `modal-remote`: _This isn't added by the library, but if you use the Modalite CSS, you could add it manually to your remote modal to give it a loading overlay and spinner icon._

## Remote container classes
Added to all elements with attribute `data-modal-remote`.

- `modal-remote-loading`: Added when the remote starts loading. Removed when the remote has loaded or failed to do so.
- `modal-remote-success`: Added when the remote has successfully loaded. Iframe remotes get this class when their `load` event triggers.
- `modal-remote-error`: Added if the XHR response status code isn't in the 200-299 range. Iframe remotes don't get this class as there is no way to check whether they have successfully loaded.

# Changelog
- 1.0.0 - Initial release.
- 1.1.0 - Added support for modals with external resources.
- 1.2.0 - Exposed the `openModal()` and `closeModal()` functions to control modals via code.
