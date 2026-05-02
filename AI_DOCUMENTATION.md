**1. What did you ask the AI to help you with, and why did you choose to use AI for that specific task?**

When I ran my server for the first time, I kept getting `TypeError: Cannot read properties of undefined (reading 'userId')` whenever any route tried to access `req.session`. I knew the error was session related but I couldn't figure out why `req.session` was undefined at all since I had already installed `cookie-session` and added it to my server. I pasted my `index.js ` into the chat and asked:
"I'm getting TypeError: Cannot read properties of undefined (reading 'userId') on req.session, here's my index.js, what's wrong?"
I chose to use AI here because I had already stared at the file for a while and couldn't spot the problem. It felt like a good case for a second set of eyes rather than Googling because the bug was specific to my exact code, not a general concept question.


**2. How did you evaluate whether the AI's output was correct or useful before using it?**

The AI pointed out that line 3 of my `index.js` said:
```js
const cookieSession = require('express');

//instead of:
const cookieSession = require('cookie-session');
```
Before just accepting this, I thought about it ,  if `cookieSession` is just `express`, then calling `cookieSession({ name: 'session', secret: ... })` would be calling `express()` which returns an Express app, not a middleware function. That explained why `req.session` was never being set. I restarted the server after fixing the import, ran the register curl command again, and immediately got back `{ "user_id": 4, "username": "testuser" }` which confirmed the fix worked.

**3. How did what the AI produced differ from what you ultimately used, and what does that tell you about your own understanding of the problem?**

The fix was a single line change,  just swapping `require('express')` for `require('cookie-session')`. I didn't need to modify anything else. But what stuck with me was understanding why the wrong import caused that specific error. Because `cookieSession` was actually the `express` function, calling it as middleware returned something that didn't set up `req.session`, so every controller that tried to read `req.session.userId` got `undefined` and crashed. The AI gave me the fix but I had to reason through the cause myself.

**4. What did you learn from using AI in this way?**

I learned that import errors can cause bugs that look completely unrelated to the actual mistake. The error message said `Cannot read properties of undefined` on `req.session` which pointed me toward the session logic in my controllers, not toward the require statement at the top of `index.js`. I never would have looked there on my own. Going forward I'll double check my require statements when something middleware-related isn't working, because the bug won't always show up near the line where it was introduced.
