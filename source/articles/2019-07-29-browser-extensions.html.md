---

title: "Browser extensions are underrated: the promise of hackable software"
date: 2019-07-29 13:13 UTC
tags: 
image_url: /images/article_images/legos.jpg
description: "In a world of closed platforms, browser extensions are the rare exception that let users modify the apps that we use."
---

<figure style="margin: 0;">
  <img src="/images/article_images/legos.jpg" alt="Lego bricks">
  <figcaption>Photo by <a class="figure-link" href="https://unsplash.com/photos/2FaCKyEEtis">Rick Mason on Unsplash</a></figcaption>
</figure>

Recent conversations about web browser extensions have focused on controversy: [malicious browser extensions capturing web history](https://arstechnica.com/information-technology/2019/07/dataspii-inside-the-debacle-that-dished-private-data-from-apple-tesla-blue-origin-and-4m-people/), and [Google limiting the capabilities used by ad blockers](https://www.wired.com/story/google-chrome-ad-blockers-extensions-api/?verso=true). These are important discussions, but we shouldn't lose sight of the big picture: browser extensions are a special ecosystem worth celebrating.

Among major software platforms today, **browser extensions are the rare exception that allow and encourage users to modify the apps that we use**, in creative ways not intended by their original developers. On smartphone and desktop platforms, this sort of behavior ranges from unusual to impossible, but in the browser it's an everyday activity.

Browser extensions remind us what it's like to have deep control over how we use our computers.

## Assembling our own software

Once a software platform reaches a certain level of openness, it can fundamentally change the way that normal users relate to their software. By installing four different Gmail extensions that modify everything from the visual design to the core functionality, in some sense, I've put together my own email client. **Instead of being a passive user of pre-built applications, I can start assembling my own personalized way of using my computer.**

The popularity of browser extensions proves that many people are interested in customizing their software, and it's not just  a hobby for power users. There are over 180,000 extensions on the Chrome store, and nearly half of all Chrome users have browser extensions installed.[^chrome] When people have an easy way to extend their software with useful functionality, they apparently take advantage.

## Hackable platforms, not custom APIs

Browser extensions have remarkably broad use cases. I personally use Chrome extensions that fill in my passwords, help me read Japanese kanji, simplify the visual design of Gmail, let me highlight and annotate articles, save articles for later reading, play videos at 2x speed, and of course, block ads.

The key to this breadth is that most extensions modify applications in ways that the original developers didn't specifically plan for. When Japanese newspapers publish articles, they're not thinking about compatibility with the kanji reading extension. Extension authors gain creative freedom because they don't need to use application-specific APIs that reflect the original developers' view of how people might want to extend their application.

The web platform has a few qualities that enable this sort of unplanned extensibility. The foundational one is that the classic web deployment style is to ship all the client code to the browser in human-readable form. (Source maps are a key to preserving this advantage as we ship more code that's minified or compiled from other languages.) The web's layout model also promotes extensibility by encouraging semantic markup and the use of standard tags—my password manager extension works because web pages reliably use standard form tags for password submissions instead of building their own forms.

Even with these advantages, it can require clever tricks to modify a site in ways that it wasn't built for, but it's often a reasonable amount of work, not a years-long reverse engineering effort. The sheer variety of extensions available shows that extension authors are willing to jump through a few hoops to create useful software.

Occasionally there's tensions between the goals of the original website and extensions, like those pesky messages on news sites asking you to disable your ad blocker. But it seems far more common that developers are fine with their sites being extended in creative ways, as long as they don't have to do any extra work. Extensions can even make life easier for application developers: if there's a niche request that a small minority of users want, a motivated community member can just build an extension to support it. By using a hackable platform, developers allow their users to get more value out of their applications by building extensions on top of them.

## Small tools, not big apps

Many browser extensions are generic tools designed to enhance my use of all websites. I can use my highlighting and clipping tools everywhere, instead of needing a different highlighting tool for each article I read. Just like using a physical highlighter with paper articles, I can master these tools once, and get a lot of leverage by applying them in many contexts.

In many platforms, we think of the operating system as providing the cross-cutting tools (e.g. copy-paste), and third parties as providing standalone "apps" that are used mostly in isolation. With browser extensions, third parties are also providing tools; a single piece of software has the leverage to change my entire experience.

When software is built in small units, it also changes the economics. Most extensions I use are free, and are perhaps too small in their feature set to support a full-blown business. And yet, people still choose to make them, and I get access to these bits of software that improve my life. Browsing the extension store feels more like going to a local flea market than going to a supermarket. Massive software built by huge companies isn't the only way.

## The origins of openness

It's not an accident that this openness emerged on the web platform.

Since the beginning of personal computing, there's been a philosophical tradition that encourages using computers as an interactive medium where people contribute their own ideas and build their own tools—authorship over consumption. This idea is reflected in Alan Kay's [Smalltalk](http://worrydream.com/EarlyHistoryOfSmalltalk/), Bill Atkinson's [Hypercard](https://archive.org/details/CC501_hypercard), and more recently Bret Victor's [Dynamicland](https://dynamicland.org/).

When Tim Berners-Lee created the World Wide Web, he imagined it fitting into this tradition. "My vision was a system in which sharing what you knew or thought should be as easy as learning what someone else knew."[^tbl] There were some hiccups along the way[^tbl2], but eventually that vision prevailed, and the Web evolved into a place where anyone can publish their opinions or photos through social media platforms.

Still, there's a catch. When you're using Facebook, you're still operating within a confined experience. You're forced to publish in a certain format, and to use their app in a certain way (that includes, of course, seeing all the ads). There's more room for authorship than browsing a news website, but only within the strict lines the app has painted for you.

**Browser extensions offer a deeper type of control.** Instead of just typing into the provided text box, we can color outside the lines and deeply modify the way we experience any application on the web. Browser extensions offer a kind of decentralization: large companies building major websites don't get to dictate all the details of our experience.

I don't want to focus too much on ad blockers—they're just one of many flavors of browser extension—but I find it pretty extraordinary that we have the ability to install plugins that interfere with the primary business model for the web. It's rare to see the balance of power tilted this far towards users.

## Improving on extensions

We clearly need to work on protecting people from malicious extensions that invade their privacy. Beyond that, here are some bigger picture opportunities I see for improving on extensions:

**Accessibility:** Today, it requires a big jump to go from using browser extensions to creating them: you need to learn a lot of web development to get started, and you can't easily develop extensions in the browser. What if there were a quick way to get started developing and sharing simple extensions in the browser? There are some foundations in place already: Chrome/Firefox/Edge extensions are built using web technologies, and browsers already have excellent developer tools for editing pages.

**Compatibility:** Because extensions hook into websites in odd ways, updates to websites often result in extensions temporarily breaking, and extension authors scrambling to fix them. Can we make it easier for website developers and extension authors to form stable connections between their software, without giving website developers more work or restricting the freedom of extension authors?

There are existing practices that fit into this category already—using clean semantic markup and human-readable CSS makes it easier to develop a stable extension, and minified code without source maps makes it harder.

**Power:** My final idea is radical enough that it might not ever apply to the web platform, but maybe it's a useful thought exercise for future platforms. Web extensions are limited in their power by the typical architecture of web applications: they have broad rights to modify the browser client, but the server is off limits. If a fitness app only shows me my last year of data, I could install a browser extension that reformats the graph, but it can't fetch data beyond that date range. How could we rethink the client-server boundary to enable extensions to make even deeper modifications?

This question raises tough questions around security and privacy. The modern browser extension API has done a great job balancing giving extensions flexible power with protecting people's security, and we're still grappling with the consequences of browser extensions invading people's privacy. Giving extensions more power would only raise the stakes. Still, I think it's a worthwhile challenge to find ways for application developers to expose more power to extensions, without compromising security or putting tight limits on what extension authors are allowed to invent.

## The next platform

I'm following a couple projects that are working on some of these challenges:

The [Beaker Browser](https://beakerbrowser.com/about/) and the decentralized web community are exploring how the web works without centralized servers. It seems like their proposed architecture would give users fuller control over modifying the "server" side of web applications.

Tim Berners-Lee is working on a new project called [SOLID](https://inrupt.com/blog/one-small-step-for-the-web). I don't yet understand precisely what they're up to, but given Tim's involvement I figure it's worth paying some attention to. A key principle is giving people more ownership over their data, which would enable browser extensions to manipulate people's data in more flexible ways beyond what the server API allows.

Computing is still young, and platforms are evolving quickly. Modern browser extensions are only a decade old, and the smartphone platform became dominant out of nowhere. There will be new platforms, and we will get to collectively decide how open they will be.

Browser extensions give us one example to strive for: a place where we routinely hack the software we use and make it our own. <span style="color: #aaa;">▪</style>

[^chrome]: [https://www.blog.google/technology/safety-security/update-project-strobe-new-policies-chrome-and-drive/](https://www.blog.google/technology/safety-security/update-project-strobe-new-policies-chrome-and-drive/)
[^tbl]: Weaving the Web, by Tim Berners-Lee (p33)
[^tbl2]: Tim thought web browsers should also be website editors, and was disappointed when the Mosaic browser took off in popularity without including that feature. 
