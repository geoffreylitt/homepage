---
title: On spaghetti code
date: 2013-07-06 21:00 UTC
tags:
hidden: true
---

Last summer, I found time after work and on weekends to build a small web project called [Yale Classroulette](http://yaleclassroulette.com). It's a way to randomly explore the enormous Yale undergraduate course catalog -- just tap the spacebar, and your screen fills up with a new grid of randomly selected classes, optimized for easy skimming. It basically combines the experience of skimming aimlessly through a paper course catalog with the convenience of the Internet.

I built the site for fun, and because I wanted to use it myself. It turns out other people wanted to use it too--in the year or so since it launched, Yale students have viewed over 1 million courses on it, and the average time on site is 16 minutes. Not bad engagement numbers for a side project.

There's only one problem with Classroulette. To put it bluntly, the code quality sucks. The Javascript for the frontend is a jQuery spaghetti mess with hardcoded constants and cryptic code, all polluting the global namespace. I wanted the random course loading to be fast, so the Sinatra backend fetches all the scraped course info from the database and stores it in a configuration variable upon initialization, because that was an easier in-memory data store to use than Redis. You get the idea. All this code was written in short shifts late at night when I was tired and distracted, and just wanted to get something launched. As an engineer, it's painful to write and deploy spaghetti code.

But here's what this project made me realize: sometimes, __good code isn't the top priority!__

READMORE

People love Classroulette because of the user interface, not because of the underlying software architecture. I could have spent the limited hours I had improving the codebase, but I chose instead to focus on crafting a delightful user experience, and that decision paid off. When faced with limited resources, you have to make tough choices to get to launch. Classroulette launched as a minimum viable product--meaning it had a minimal feature set and minimal code quality, but great UX.

Of course, anyone who's ever worked on production systems has alarm bells going off in their head reading this. But the site isn't maintainable! It's not extensible! It wouldn't work if there were more than one person working on the project!

These are all valid criticisms. But in many cases, it's worth releasing a great user experience first, and fixing the code later--once you've discovered whether anyone actually wants to use the product. For what it's worth, I've been using AngularJS extensively recently, and I can't wait to rewrite Classroulette the right way when I get some free time.
