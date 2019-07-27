---

title: Why browser extensions are the best software ecosystem
date: 2019-07-26 21:13 UTC
tags: 

---

*This post is still a preview draft, please don't share broadly!*

<figure style="margin: 0;">
  <img src="/images/article_images/legos.jpg" alt="Lego bricks">
  <figcaption>Photo by <a class="figure-link" href="https://unsplash.com/photos/2FaCKyEEtis">Rick Mason on Unsplash</a></figcaption>
</figure>

Recent conversations about web browser extensions have focused on controversy: [malicious browser extensions capturing web history](https://arstechnica.com/information-technology/2019/07/dataspii-inside-the-debacle-that-dished-private-data-from-apple-tesla-blue-origin-and-4m-people/), and [Google limiting the capabilities used by ad blockers](https://www.wired.com/story/google-chrome-ad-blockers-extensions-api/?verso=true). These are important discussions, but we shouldn't let them distract us from the big picture: browser extensions are the best widely used software ecosystem we have today.

In a world of closed platforms like iOS, **browser extensions are the rare exception that let users modify the apps that we use**, in creative ways not intended by their original developers.

Extensions remind us what it's like to have deep control over how we use our computers.

## Going beyond developers' intentions

Browser extensions have remarkably broad use cases. I personally use Chrome extensions that fill in my passwords, help me read Japanese kanji, simplify the visual design of Gmail, let me highlight and annotate articles, save articles for later reading, play videos at 2x speed, and of course, block ads. [add links] Over time, these extensions have become a critical part of the way that I experience the Web.

**Usually, extensions modify applications in ways that the original developers didn't anticipate at all.** When Japanese newspapers publish articles, they're not thinking about compatibility with the kanji reading extension. This gives extension authors a lot of creative space to maneuver in. It sometimes requires clever tricks to modify a site in ways that it wasn't built for, but it's often technically possible, and the sheer variety of extensions out there shows that people are willing to put in the effort.

Occasionally there's tensions between the goals of the original website and extensions, like those pesky messages on news sites asking you to disable your ad blocker. But I think it's much more common that developers are totally fine with their sites being extended in creative ways, as long as they don't have to do any extra work. Extensions can even life easier for application developers—if there's a niche request that a small minority of users want, a motivated community member can just build an extension to support it, rather than everybody waiting for the feature request to make it up the backlog.

## Crafting our own software

When a software platform reaches a certain level of openness, it can fundamentally change the way that we experience software. By installing four different Gmail extensions that modify everything from the visual design to the core functionality, in some sense, I've put together my own email client. **Instead of being a passive user of pre-built applications, I can start assembling my own personalized way of using my computer.**

The popularity of browser extensions proves that many people are interested in customizing their software, and it's not just for geeky power users. There are over 180,000 extensions on the Chrome store, and nearly half of all Chrome users have browser extensions installed.[^chrome] When people have an easy way to flexibly extend their software with useful functionality, they take advantage.

## Small tools > Big apps

Many browser extensions are generic tools designed to enhance my use of all websites. I can use my highlighting and clipping tools everywhere, instead of needing a different highlighting tool for each article I read. Just like using a real highlighters and scissors for paper articles, I can master these tools once and get a lot of leverage by applying them in many contexts.

This way of thinking about software is quite different from building standalone apps that are meant to be used in isolation from each other.

When software is built in small units, it also changes the economics. The majority of extensions I use are free, and are perhaps too small in their feature set to support a business. And yet, because small extensions are cheap enough to build and distribute, people still choose to make them, and I can get access to these bits of software that improve my life. Massive software built by huge companies isn't the only way.

## The origins of openness

It's not an accident that the web turned out to be the platform where this type of openness emerged.

Since the beginning of personal computing, there's been a sort of philosophical tradition that encourages using computers as a medium for people to flexibly create things, not just to use them—authorship over consumption. It's reflected in Alan Kay's [Smalltalk](http://worrydream.com/EarlyHistoryOfSmalltalk/), Bill Atkinson's [Hypercard](https://archive.org/details/CC501_hypercard), and more recently Bret Victor's [Dynamicland](https://dynamicland.org/).

When Tim Berners-Lee created the World Wide Web, he imagined it fitting into this tradition. "My vision was a system in which sharing what you knew or thought should be as easy as learning what someone else knew."[^tbl] There were some hiccups along the way[^tbl2], but eventually that vision prevailed, and the Web evolved into a place where anyone can publish their opinions or photos through social media platforms. Still, there's a catch. When you're using Facebook, you're still operating within a confined experience—you're forced to publish in a certain format, and to use their app in a certain way (that includes, of course, seeing all the ads).

**Browser extensions offer a deeper type of control.** Instead of just typing into the provided text box, we can color outside the lines and totally change the way we experience any application on the web. Browser extensions offer a kind of decentralization, in the sense that large companies building major websites don't get to dictate all the details of our experience.

## Improving on extensions

As great as browser extensions are, I see some opportunities for improving on them.

**Accessibility:** Today, it requires a big jump to go from using browser extensions to creating them: you need to learn a lot of web development to get started, and you can't easily develop extensions in the browser. What if there were a quick way to get started developing and sharing simple extensions in the browser? There are some foundations in place already: Chrome/Firefox/Edge extensions are built using web technologies, and browsers already have developer tools for editing pages.

**Compatibility:** Because extensions hook into websites in odd ways, updates to websites often result in extensions temporarily breaking, and extension authors scrambling to fix them. Can we make it easier for website developers and extension authors to form stable connections between their software, without giving website developers do a lot more work, or restricting the freedom of extension authors? There are existing practices that fit into this category already—using clean semantic markup and human-readable CSS makes it easier to develop a stable extension.

**Power:** My final idea is radical enough that it might not ever apply to the web platform, but maybe it's a useful thought exercise for future platforms. Web extensions are limited in their power by the typical architecture of web applications: they have broad rights to modify the browser client, but the server is off limits. If a fitness app only shows me my last year of data, I could install a browser extension that reformats the graph, but it can't fetch data beyond that date range. How could we rethink the client-server boundary to enable extensions to make even deeper modifications?

This question raises tough questions around security and privacy. The modern browser extension API has done a great job balancing giving extensions flexible power with protecting people's security, and we're still grappling with the consequences of browser extensions invading people's privacy. Giving extensions more power would only raise the stakes. Still, I think it's a worthwhile challenge to find ways for application developers to expose more power to extensions, without compromising security or putting tight limits on what extension authors are allowed to invent.

## The future

There are many people working on these sorts of challenges. A couple projects that I'm following:

The [Beaker Browser](https://beakerbrowser.com/about/) and the decentralized web community are exploring how the web works without centralized servers. This should create opportunities for people to more deeply access and edit the internals of applications they're using on the web.

Tim Berners-Lee is working on a new project called [SOLID](https://inrupt.com/blog/one-small-step-for-the-web). I've found the public communication around the project to be so opaque that I don't understand precisely what they're doing, but given Tim's involvement I figure it's worth paying some attention to. A key principle is giving people more ownership over their data, which seems like it would enable browser extensions to access and manipulate people's data in more flexible ways.

More broadly, it's important to remember that computing is still young, and platforms are evolving quickly. Modern browser extensions are only a decade old, and smartphones have become dominant in a similar timeframe. There will be new platforms, and we get to collectively decide how open they will be.

Browser extensions give us one example to strive for: a place where users have ultimate control over how our software is constructed.

<br />

[^chrome]: [https://www.blog.google/technology/safety-security/update-project-strobe-new-policies-chrome-and-drive/](https://www.blog.google/technology/safety-security/update-project-strobe-new-policies-chrome-and-drive/)
[^tbl]: Weaving the Web, by Tim Berners-Lee (p33)
[^tbl2]: Tim thought web browsers should also be website editors, and was disappointed when the Mosaic browser took off in popularity without including that feature. 
