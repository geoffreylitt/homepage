---
title: "Waze for public transit: my first adventure in civic hacking"
date: 2015-02-28 20:14 UTC
tags:
description: "Together with two coworkers, I built a crowdsourced subway alerting app called MBTA Ninja. We weren't really expecting anyone besides our coworkers and friends to use the app at first...and then it went viral on Twitter."
image_url: "http://www.mbta.ninja/images/ninja.png"
---

Last weekend I attended CodeAcross Boston 2015, a civic innovation hackathon hosted by [Code for Boston](http://www.codeforboston.org/) as part of the national [CodeAcross](http://www.codeforamerica.org/events/codeacross-2015/) weekend.

Having been driven insane by [the wintry woes](http://www.bostonglobe.com/news/bigpicture/2015/02/23/wintry-woes-for-mbta/UFasXMvGjJnzmfYTF2WMAI/story.html?comments=all&sort=NEWEST_CREATE_DT) of Boston's public transit system, my idea for the event was to build "Waze for the T" -- a crowdsourced alerting system to let commuters directly warn each other of delays, crowded platforms, and other problems on the subway. (The T is Boston's nickname for the public transit system.)

I joined forces with two coworkers from Panorama Education, and over a weekend we built out the idea as a mobile web app using Meteor. We affectionately called it [MBTA Ninja](http://mbta.ninja). (As weird as the new gTLDs are, .ninja domains are a gold mine for hackathons!) We weren't really expecting anyone besides our coworkers and friends to use the app at first...

...and then it went viral on Twitter.

<blockquote class="twitter-tweet" data-cards="hidden" lang="en"><p>More cities need a project like Boston’s MBTA Ninja <a href="http://t.co/uJGS6ntBc9">http://t.co/uJGS6ntBc9</a> Nice work <a href="https://twitter.com/hashtag/CodeAcross?src=hash">#CodeAcross</a> Boston!</p>&mdash; Tim O&#39;Reilly (@timoreilly) <a href="https://twitter.com/timoreilly/status/570680232568614912">February 25, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" lang="en"><p><a href="https://twitter.com/mbta_ninja">@MBTA_ninja</a> where were you last month! <a href="https://twitter.com/hashtag/theanswertomyprayers?src=hash">#theanswertomyprayers</a> <a href="http://t.co/LjE79k1aqd">http://t.co/LjE79k1aqd</a></p>&mdash; Kirsten O. Spilker (@KOSpilker) <a href="https://twitter.com/KOSpilker/status/570977014745841664">February 26, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" lang="en"><p><a href="https://twitter.com/mbta_ninja">@mbta_ninja</a> Too bad you can&#39;t whip up a new transit system as quickly as you came up with this site. Thank you! <a href="https://twitter.com/hashtag/mbtaninja?src=hash">#mbtaninja</a> <a href="https://twitter.com/hashtag/mbtafail?src=hash">#mbtafail</a> <a href="https://twitter.com/hashtag/mbta?src=hash">#mbta</a></p>&mdash; Stuck on the T (@IneedTupdates) <a href="https://twitter.com/IneedTupdates/status/571095606728515584">February 26, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" lang="en"><p>. <a href="https://twitter.com/mbta_ninja">@mbta_ninja</a> is my new favorite thing on the internet</p>&mdash; Brian (@bmshirley) <a href="https://twitter.com/bmshirley/status/570615560070963200">February 25, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" data-cards="hidden" lang="en"><p><a href="http://t.co/bKekGoM8nj">http://t.co/bKekGoM8nj</a> is <a href="https://twitter.com/waze">@waze</a> for the <a href="https://twitter.com/MBTA">@MBTA</a>. Could have used it this week. <a href="https://twitter.com/hashtag/CodeAcross?src=hash">#CodeAcross</a> Boston <a href="http://t.co/WRzrJvJGHO">pic.twitter.com/WRzrJvJGHO</a></p>&mdash; Jascha F.-H. (@jfh) <a href="https://twitter.com/jfh/status/569561220375814144">February 22, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet" lang="en"><p>Bless you <a href="https://twitter.com/mbta_ninja">@mbta_ninja</a> ❤ now... If only you had a downloadable app... <a href="https://twitter.com/hashtag/BabySteps?src=hash">#BabySteps</a></p>&mdash; Chris Souza (@CSwizzle69) <a href="https://twitter.com/CSwizzle69/status/571313319447023616">February 27, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

READMORE

The last week has been a whirlwind. In just five days, 14,000 people have visited the site over 21,000 times. It's been [featured](http://www.betaboston.com/news/2015/02/24/like-a-waze-for-the-t-mbta-ninja-lets-bostonians-crowdsource-trouble-on-their-commute/) on various [news](http://bostinno.streetwise.co/2015/02/25/t-schedule-update-mbta-ninja-provides-subway-service-information/?utm_content=bufferd1bd4&utm_medium=social&utm_source=facebook.com&utm_campaign=buffer) [sites](http://www.bostonherald.com/news_opinion/local_coverage/2015/02/new_websites_offer_live_mbta_monitoring_tools), and we even got interviewed for local TV news on Thursday—the clip does a great job of telling the story.

<div class="iframe-container">
  <iframe class='video' scrolling='no' frameborder='0' src='https://screen.yahoo.com/commuters-mbta-ninja-help-other-232000334.html?format=embed' allowfullscreen='true' mozallowfullscreen='true' webkitallowfullscreen='true' allowtransparency='true'></iframe>
</div>

In thinking over this experience, I've come away with two main thoughts.

### 1. Creating new data sources is important.

When I hear the term "open data", I tend to think of governments opening up existing data sources so that they can be more readily accessed, or mashed up in interesting ways. Boston has a respectable [list of hundreds of open datasets](https://data.cityofboston.gov), as well as a fantastic [transit data API](http://realtime.mbta.com/portal) that now powers dozens of apps. As expected, we saw some innovative projects at CodeAcross Boston using this type of data, including tools for analyzing building permits and 311 service requests.

MBTA Ninja doesn't fit into that category though. Rather than relying on existing data, the site actually creates a new data source based on decentralized reporting from people on the ground who are seeing the reality of a situation. This might seem counterproductive—isn't the problem these days that we have _too much_ data to sort through? There are certainly domains where that's the case, but there are still dark spots out there where we could benefit from having way more data.

At [Panorama Education](http://panoramaed.com), the startup I work at, we're helping schools incorporate feedback surveys so that they can better understand what students are experiencing behind classroom doors and on the playground. Another example is [Ushahidi](http://www.ushahidi.com/product/ushahidi/), which is an incredible open platform for crowdsourced reporting that has been used for things like [tracking child deaths in Syria](http://www.ushahidi.com/2015/02/23/story-syria-tracker-child-killing-trends-syria/) and [tracking the status of water wells in Afghanistan](http://www.ushahidi.com/2012/06/25/watertracker/).

My favorite project at CodeAcross Boston was also oriented around creating a new data source. The founder of a nonprofit called [Foster Skills](http://www.fosterskills.org/) created [Rate My Foster Home](http://ratemyfosterhome.com/), which would enable kids to fill out online surveys about their foster care conditions.

I think these examples show that there are still tons of places—ranging from as trivial as a train platform to as important as a foster home—where we can benefit from more data. I loved this tweet from the hackathon, and it made me want to work on a meatier problem next time around:

<blockquote class="twitter-tweet" data-cards="hidden" lang="en"><p>“Rate My Foster Home” We’ve clearly moved past “where’s my bus”phase of civic hackathons <a href="https://twitter.com/CodeForBoston">@CodeForBoston</a> <a href="https://twitter.com/hashtag/CodeAcross?src=hash">#CodeAcross</a> <a href="http://t.co/Khdntq8fZb">pic.twitter.com/Khdntq8fZb</a></p>&mdash; Saul Tannenbaum (@stannenb) <a href="https://twitter.com/stannenb/status/569556037872844800">February 22, 2015</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

When building new data sources, it's also important to realize the difference in value between unstructured and structured data. People were already tweeting up a storm about the subway (I know because I would check every morning), but it was hard to interpret that data because it was completely unstructured. MBTA Ninja requires people to submit alerts using specific categories, and also enables them to upvote existing alerts rather than creating their own independent tweets. It turns out that imposing a domain-specific structure makes the data far more actionable in this case.

On their page about [tracking wells in Afghanistan](http://www.ushahidi.com/2012/06/25/watertracker/), Ushahidi makes a similar point:

> asking the right questions of what’s required goes a long way in removing the burden of inefficiency around processing unstructured information (what you will most likely receive using SMS or social media channels).

I'm sure there are many domains that could benefit from more structured reporting, rather than trying to parse unstructured Twitter data. The problem, though, is actually getting people to use these mechanisms. This is a challenge that applies to MBTA Ninja, since the utility of the app is entirely reliant on people actually using it. We initially thought we might have to incentivize contributions somehow, but so far we've had tons of alerts, and popular ones have been getting 30 or 40 confirmations.

I think people are getting enough value out of the app that they're willing to contribute by reporting and upvoting since it's a really easy process. There also seems to be some aspect of community solidarity involved—just the act of reporting or upvoting an alert might be an outlet for frustration. While other apps that create new data sources might require more thorough data entry than MBTA Ninja, I think the general principles still apply: clearly demonstrate the value of the data to users, and make it as easy as possible to contribute.

### 2. Open source is da bomb

My second takeaway is that the open source movement is the best thing that's ever happened to the field of software development.

Thought exercise: imagine telling someone back in the year 2000 to build a website that provides an interface for reporting and viewing transit events, syncing everything in realtime to hundreds of mobile clients simultaneously. Of course it needs to have an intuitive, mobile-friendly UI that anyone can instantly use. No page refreshing obviously, because that's annoying. Oh yeah, and it needs to go from zero to deployed in the cloud in just two days.

In 2015, this has somehow, unbelievably, become nearly trivial. Using [Meteor](https://www.meteor.com/) for the realtime backend, [MaterializeCSS](http://materializecss.com/) for the frontend components, and [Heroku](http://heroku.com) for cloud deployment[^1], it was just a matter of combining some parts in the right way to realize our idea. Talk about standing on the shoulders of giants.

[^1]: Heroku itself isn't open source, but is built on open-source foundations.

We also open sourced our code ([Github repo](https://github.com/davidlago/mbta-ninja)) and have already reaped the benefits of community contributions, with five pull requests contributed by people outside of the original team who just wanted to help out.

Among the countless ways that people have found to give back to the world, open source software feels special in terms of the leverage that an individual contribution can have. The crazy thing about the open source community is that such a large percentage it is dedicated to producing better tools (from operating systems to programming languages to libraries), which often are in turn used to create even better tools. Intuitively, this type of ecosystem seems like it should lead to exponential progress, and we're still in the early days of seeing that curve play out.

### In conclusion...

In a world where political systems are increasingly gridlocked every day, and much of Silicon Valley is focused on peddling ads, the civic innovation and open data movements are a bright and optimistic exception to the zeitgeist. When the noble goals and pervasive reach of governments combine with the freewheeling innovation of the tech world, I'm confident that amazing things can happen.

I couldn't have asked for a better first experience, and I'm excited to stay active in this space. If you live in Boston, you should come by a [Code for Boston](http://www.meetup.com/Code-for-Boston/) meetup sometime, and join dozens of people who are interested in hacking the future.
