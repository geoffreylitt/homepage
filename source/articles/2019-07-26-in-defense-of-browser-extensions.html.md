---

title: In defense of browser extensions
date: 2019-07-26 21:13 UTC
tags: 

---

Recently there's been a lot of tough discussions about browser extensions: Malicious extensions spying on you, fights over what Google should allow ad blockers to do. These are important discussions.

But, we also can't lose sight of the big picture: browser extensions are one of the best ecosystems we have in software today! Browser extensions are a rare example of an open platform that allows us to modify the apps we use, in a world where other platforms like iOS are generally becoming more closed. They show us how powerful it can be to have more control over our software. We should celebrate this, build platforms that are more like this, and fight for these values.

## The value of openness

Browser extensions have such broad use cases. I personally use extensions to read kanji, simplify the design of Gmail, highlight and annotate articles, block ads, play videos at 2x speed. It's amazing that the web platform allows for this many types of extensions, most of them unanticipated by the original developers. I would be crushed to lose access to many of my extensions.

"Unanticipated by the original developers" is key. It's not like they're hooking into explicit extension APIs. They're often taking the backdoor in and truly "hacking" the app. Much broader possibilities. Sometimes the original creators aren't happy (eg ad blockers), but mostly developers don't mind extensions at all. They often are happy to have their sites extended, as long as they don't have to do any work.

When a software platform has this level of openness, it can profoundly change the way that we experience software. Instead of being just a passive user of pre-built applications, I can start cobbling together my own way of using the web. By installing five different Gmail extensions, in a sense I've built my own email client. Points towards a world where we're crafting our own experiences on the computer, rather than just buying pre-built.

One thing I've always wondered about this vision of crafting our own experiences is whether anyone actually cares. Is this just a fantasy view from a "power user" perspective? I see browser extensions as a major validation point here: almost half of Chrome users use extensions. This is far, far more than the number who program. This suggests that many people will actually take advantage of ways to personalize their computing experiences.

## The original vision for the web

It's not a total accident that browser extensions became this way. 

Tim Berners-Lee deeply believed in this ethos all along: the web as a place where everybody is not only viewing, but creating. This vision was part of a tradition of imagining personal computing as a medium for people to flexibly express themselves, also expressed by earlier tools like Smalltalk and Hypercard.

TBL's first browser was a browser/editor. That didn't quite work out, but the web did eventually become quite authorable through blogs and social media. You can post opinions, photos, videos...

Still, this authorship is limited. Original MySpace was "type in HTML", now we're down to "type your text into a box." We're coloring within the lines.

Browser extensions offer a different type of authorship. They let us color outside the lines. Instead of typing into the text box that Facebook designed for us, we get to subvert what Facebook wanted us to see. They let us take some control of our experience.

## Going further

There are 3 areas I see where extensions could be improved: making it easier to write extensions, making them able to do more things, and making them fit together better.

To go from using browser extensions to making them is a huge jump today. This limits the range of authors. How could we smooth that path? The fact that modern web extensions are based on web technologies is the perfect starting point. We're so close! How might we go from playing in developer tools to sharing an extension? Right now it takes so many steps.

Can we also improve the power of extensions? Right now, browser extensions can only access the client, but can't modify stuff on the server. This limits many useful things you could do. Of course, there's a tradeoff with security/privacy. The current Chrome API was controversial for removing certain types of power originally, and has done a good job balancing those concerns. Maybe there are creative solutions that encourage both power and privacy.

We can also work on making extensions fit together better, with websites and with other extensions. Currently extensions are easily broken by updates to websites, and sometimes two extensions conflict with each other. Can we create better ways for things to compose, to prevent these problems?

## What can we do?

3 things: try to keep extensions open, support those working on these problems, and bring the lessons to other platforms.

Put pressure on Google to keep APIs open (eg for ad blocking).

There are some projects working on these problems. TBL's Solid project, and Beaker browser, seem promising. Let's support them.

Most importantly: remember these principles don't only apply on the web. Mobile apps already don't have this level of openness at all. When we build the next big platform, can we bring these lessons along?

---

I'm a PhD student at MIT doing research on these topics.

If you're interested in following my work, follow me on Twitter or subscribe via RSS.

And if you're interested in talking about these ideas, send me an email! 