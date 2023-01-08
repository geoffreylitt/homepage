---

title: For your next side project, make a browser extension
date: 2023-01-08 19:37 UTC
tags:
image_url: /images/article_images/gears.jpg

---

In a [previous post](/2019/07/29/browser-extensions.html) I've written about why browser extensions are an amazing platform for customizing existing software. Because the browser DOM can be hacked in such open-ended ways, it's easy to build extensions that modify the behavior of an app in ways that the original creators never anticipated or intended to support.

Today I'll zoom in and share a specific example from a side project of mine. Over the past two years, I built and grew a browser extension for Twitter called [Twemex](https://tweethunter.io/twemex), and ultimately sold it to [Tweet Hunter](https://tweethunter.io/) in an acquisition.

In this post, I'll reflect on that experience and share what I see as some of the unique advantages (and tradeoffs) of building an extension over building an entire new app.

Most importantly, **extensions can be an extremely *efficient* way of creating value in a side project** where the developer can only invest limited time and effort, as was the case here. It's also easier to get ideas for extensions and find users than it is to make an app from scratch. The benefits aren't just for devs, either: extensions can be a really convenient way for users to improve their existing computing experience without learning a whole new thing.

<figure style="margin: 0;">
  <img src="/images/article_images/gears.jpg" alt="Many gears interlocking">
  <figcaption>Illustration from Midjourney</figcaption>
</figure>

##  The beginning

In 2020, I was a pretty heavy Twitter <s>addict</s> user. I got really into a strange style of Twitter usage popularized by @visakanv and @conaw [link relevant threads]: creating intricate webs of ideas, using Twitter's quote-tweet and linking mechanisms for connecting related thoughts.

This kind of usage required a few small hacks. One particularly important one was finding old tweets using Twitter's advanced search capabilities. For example, if I wanted to link to an older tweet I had written about spreadsheets, I would open a new tab and search `from:geoffreylitt spreadsheets`. Twitter's search was nice enough that this wasn't too painful, but it clearly wasn't a use case the product was optimized for.

I decided to take matters into my hands, and spent a day hacking on a sidebar extension where I could type in a search term and get immediate search results from my own past tweets.

<video src="/images/article_images/twemex/v0.mp4" autoplay=true controls=true loop=true />

The implementation was simple. All it did was prepend `from:<my username>` to the beginning of the search term and access the AJAX search API used by the web client. I found that the search API was fast enough to power a nice live search experience as the user typed, even though this UX wasn't exposed anywhere in the Twitter client itself.

## Launch

After using this tool for a few months and sharing screenshots, a few people started asking me if they could use it too. I shared the prototype, and through conversations with these early users quickly got ideas for more features to build on top of Twitter's search.

The most exciting one was "Highlights": a way to see the most-liked tweets from the account currently being viewed, to understand more context for that account's history beyond the most recent posts.

<img height="500px" src="/images/article_images/twemex/highlights.png" />

I also added a richer search keyword language which made it simpler to do common searches and incorporate information from the current page: for example, `/me` would search your own tweets, and `/user` would search within the tweets of the user currently being viewed.

<img height="500px" src="/images/article_images/twemex/search.png" />

Once this initial feature set solidified, I got some buzz with a soft launch tweet, and expanded the beta to over 100 interested users. Everything was super manual: I posted the extension source on a Notion page and DM'd the link to people to sideload into their browsers.

In hindsight, this distribution turned out to be a great idea, because DMs were the perfect way to gather early feedback. Over 50% of early users actually sent meaningful feedback, and I suspect it's because we already had a casual messaging channel opened when I originally sent the app. I also found that DMs (with proper follow-up) were a super efficient way of getting feedback, compared to calls, emails, etc.

For a while I just kept iterating and polishing. My #1 priority  was to "earn the space": to make the extension feel native to Twitter, never cause glitches, and to generally offer a high quality, pro-user style experience. Eventually things stabilized and I shipped a proper public beta through the Chrome store. 

At this point a lot of people started really loving the Twemex experience. I got reviews like "Rapidly became one of my core features when browsing Twitter. Cuts through the noise and finds quality so well.", and "I cannot believe how broken twitter feels *without* twemex".

Once the extension shipped, I didn't update it very much. I would occasionally fix bugs or make minor tweaks, but I didn't have time for any more than that, since I was busy with my day job of doing [research on user agency in computing](/#projects). I also made a little website for the tool, but didn't make any serious efforts at marketing...

## Growth + acquisition

...and yet, somehow, it kept growing on its own. Users were growing reliably around 10 to 15% per month; after a year or two, that had built up to over 20,000 users. (This is Chrome's report of the number of users who have the extension installed; I didn't have analytics measuring any more detailed stats on activity.)

![](/images/article_images/twemex/growth.png)

From time to time I would think about getting more serious about the project, but I was busy with my research, and also wasn't willing to invest serious time without some kind of compensation. I contemplated making the product paid, but didn't love that option for users.

Around that time, a couple teams building Twitter related products reached out to me with interest in acquiring the extension. I decided that a dedicated team could do a better job maintaining and growing the extension than I could do paying it almost no attention, and so I ended up selling it to [Tweet Hunter](https://tweethunter.io/). I was particularly excited that they were longtime users of the extension and deeply understood its value, and also that they planned to keep the existing functionality free. (Of course the financial outcome was also helpful for me, since I'm currently a grad student foregoing a tech industry salary to do more speculative research.)

## The benefits of extensions

Looking back on my work on Twemex, I'm struck by how efficient it was as a project.

Throughout the Twemex project, I didn't give it very much time and attention; it always remained a low-priority side project below other things. And yet, I think I was still able to create something valuable that other people benefited from. I credit a lot of this efficiency to the fact that it was a browser extension.

Here are three key ways that extensions are nice for a side project:

### Easy to find an idea

Transformational ideas for software—the ones that could become huge businesses and change the world—are rare and hard to spot. Even when they do work out, they often take tremendous effort and require an appetite for risk.

In contrast, **incremental improvements to existing software are far easier to find**. If you're opinionated about software and have taste in design, every day spent in browser apps is guaranteed to yield a flood of small complaints, each of which could be the seed for an extension.

It's also totally okay if the complaints are quite niche or specific. My starting point for Twemex came from an esoteric usage pattern, and even after I added some more generic features, it's very far from having mass appeal. Twemex is used by something like 0.01% of Twitter's overall userbase, and that's perfectly fine.

Obviously, this line of thinking can only yield small improvements to existing tools, and it won't lead to the next big revolutionary thing. But sometimes little tweaks can make a big difference, and I find this to be an appropriate and humble mentality for a small side project.

### Easy operations

I had a strict rule for this project: **no operational stress**. This meant no servers, and no data storage.

The tool was shipped as a purely client-side browser extension, using Twitter's backend for search. I didn't have my own user accounts; the extension would just send requests from the user's browser using their authentication credentials.

I also avoided building any features that would require storing data on my end. Data is a liability; it requires careful handling to preserve privacy, and to avoid data loss. If I had built data storage features, I probably would have tried a [local-first](https://www.inkandswitch.com/local-first/) approach to avoid operational stress.

These rules made it far easier to keep the project running without investing much ongoing effort. Of course, these aren't necessarily reasonable constraints for a larger or more serious project, but they worked for this one.

### Easy growth

Two truths of building new stuff: Getting people to use a new thing is hard, and getting them to keep using it is even harder. 

The great news is, **with an extension, the flywheel isn't starting from scratch**. Once a user installed Twemex, they would automatically see the new sidebar whenever they visited Twitter. For the power users who were the most likely to use Twemex anyway, this meant that their existing habits would seamlessly grow to include Twemex.

A very common piece of feedback I heard was that people would entirely forget the extension wasn't part of Twitter itself. I think this also points to the benefits for users: would you rather have to learn a whole new interface, or just have your existing one seamlessly improved?

The flip side of this is that the extension has to "earn the space". Any glitchiness or quality problems that would mess up the core Twitter experience would lead to an uninstall. Most of my time working on the extension went into making it feel native and removing any problems that would actively degrade from the experience.

One benefit in this particular case was that the real estate I was replacing on Twitter was the crappy news and trends sidebar, which I and many other users found completely pointless, so the bar was pretty low.

![](/images/article_images/twemex/useless.png)

In summary, building an extension gave me access to an easy idea, easy operations, and easy growth, relative to building a larger application. It still took careful design work and lots of iterations to reach a good product, but the leverage from the hours I put in was pretty high.

## The drawbacks

I also found that there are some key tradeoffs to grapple with in extension development.

### Platform risk

There's always platform risk since you're building on top of someone else's app. This could range from day-to-day instability, to getting completely shut out or replaced by a first-party feature.

In practice I luckily didn't have to deal with this much, perhaps because Twitter didn't change its core features very much while I was working on the tool. Careful engineering can also work around some of the issues—for example, my code for detecting color themes from the site uses ranges of colors rather than exact hex values, to be resilient in case Twitter were to slightly tweak their colors.

In some ways though, maybe platform risk can be an advantage for a side project. The platform risk might be too great to build a whole business on top of, but for a lower-stakes extension it's fine.

Another thing worth mentioning is that it's getting harder to engineer browser extensions well as web frontends become compiled artifacts that are ever further removed from their original source code. Semantic CSS classes are mostly gone these days; stably addressing UI elements is hard.

### Distribution

I'm used to building web applications where you can ship an update anytime, especially when something is broken.

In contrast, I found that distribution is miserable on the extension platform. Reaching most users requires going through the Chrome Web Store, which has an opaque manual review process that can take anywhere from a couple hours to a few weeks. Not being able to ship updates quickly meant I had to be far more diligent about QAing releases.

### Other limitations

All of this only works on the web; there's no way to extend the Twitter native mobile app with Twemex. For some kinds of extension use cases this might be a dealbreaker. 

Of course, there are also general limitations to what you can build when you're extending an existing app vs. building your own from scratch. That's sort of the point: incremental improvement over radical change.

## Conclusion

Software should be a malleable medium, where anyone can edit their tools to better fit their personal needs. The laws of physics aren't relevant here; all we need is to find ways to architect systems in such a way that they can be tweaked at runtime, and give everyone the tools to do so.

Beyond the pragmatic efficiency benefits of building a browser extension, I would argue that it's **simply more fun to engage with the digital world in a read-write way**, to see a problem and actually consider it fixable by tweaking from the outside.

So, if you're a programmer: the next time you come across an annoying problem on a web app frontend, maybe consider writing a browser extension to make it better, and then share it so that other people can benefit too.