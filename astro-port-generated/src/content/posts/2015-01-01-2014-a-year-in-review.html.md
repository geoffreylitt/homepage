---
title: "2014: A year in review with iPhone pedometer data"
date: 2015-01-01 13:00 UTC
tags:
description: "Now that I've collected almost a year of data on Argus, I thought it would be a good time to use that data to gain some insight into my past year and set goals for the coming year. After all, a proper 2015 New Year's Resolution should be data-driven!"
---

About a year ago, I became interested in all the recent discussion about how "sitting is the new smoking," and decided I should start monitoring my daily physical activity. The timing seemed especially good since I would be able to monitor my transition from being a college student to having a job, which makes it harder to live an active lifestyle. I was considering buying a Fitbit or Jawbone Up, but a friend recommended the fantastic [Argus](https://www.azumio.com/argus) iOS app.

Argus uses the M7 motion coprocessor in my iPhone 5S to track my steps throughout the day without eating up too much battery life. Since I have my phone with me almost all the time, it achieves basically the same thing as a fitness wristband does, without having to worry about extra hardware. (This is a good example, among many, of smartphones assimiliating all sorts of previously separate hardware devices.)

Now that I've collected almost a year of data on Argus, I thought it would be a good time to use that data to gain some insight into my past year and set goals for the coming year. After all, a proper 2015 New Year's Resolution should be data-driven!

READMORE

### Getting the data

Azumio, the company that makes Argus, exposes an API to download your data. It's very [sparsely documented](http://developer.azumio.com/azumio-api), but I was able to figure out the data formats after some fiddling. The API lets you download "checkins," which are saved daily and track daily aggregate metrics like number of steps and distance traveled. Each checkin also contains a "steps profile" which records a step count and timestamp for every motion you make throughout the day. This is pretty cool because it allows for analysis of daily activity patterns.

I used my favorite Ruby scraping gem, [mechanize](https://github.com/sparklemotion/mechanize), to authenticate with my credentials and download my steps data as a series of JSON responses. I then did some basic transformations in Ruby (e.g. converting Unix timestamps to more friendly datetimes), and exported hourly and daily aggregated data in CSV format to use for analysis in R. All the code I used is linked at the bottom of this post if you want to download your own Argus data.

As an aside, I generally like this hybrid approach using both Ruby and R. I find that the benefit of playing to the strengths of each language (scraping and basic manipulation in Ruby, deeper analysis and graphing in R) outweighs the hassle of transferring data between them.

I was able to download 330 daily checkins, ranging from January 8 to December 7 of the past year. I'm not sure why I can't download more recent checkins, and there are a few unexplained blips like duplicate or missing checkins — the only explanation I can think of is issues related to traveling between timezones. Nevertheless, the data quality looked pretty good for the most part.

### Some big impressive numbers

I decided to extrapolate the 330 checkins to a 365-day year, to estimate my total physical activity for all of 2014. According to Argus, I walked **2.91 million steps**, for a total distance of **1388 miles**.[^1] I'm pretty surprised that normal daily walking added up to this distance; that's like walking in a straight line from Boston (where I live) to New Orleans. The map below shows where I could have walked from home if all of my steps for the year had been in the same direction.

![](/images/article_images/map.png)

[^1]: I'm not sure how Argus records distances, but it doesn't seem to use a constant distance per step. I suspect it may be using the iPhone's GPS to do some distance tracking.

### 10,000 steps a day keeps the doctor away

I have a daily goal of taking 10,000 steps, which is a common ([albeit unscientific](http://www.livescience.com/43956-walking-10000-steps-healthy.html)) rule of thumb recommendation. If I had met my goal every day, I would have taken 3.65 million steps, so my 2.91 million weighs in at around 80% of my total steps goal for the year, which seems pretty good.

But looking at a histogram of my daily step counts (shown below), it's clear that the total step count was a bit misleading. A small number of highly active days boosted my total count, but the bulk of my days were well under the goal, with my median day coming in at around 7,000 steps. Only 26% of days met the 10,000 step goal.

![](/images/article_images/distribution.png)

I'm not quite sure what to make of this. It's not a bad thing that I had some days with tons of steps. Many of those were spent walking around all day or going on long runs, which definitely seems beneficial for my health. On the other hand, it's clear that I didn't meet the 10,000 step goal on most days, and the whole point of tracking passive activity is that it's important to have sustained physical activity even on normal days. In 2015, I'm going to try to get my median daily step count much closer to 10,000. I would be pretty happy if I could reach 10,000 steps on 40% of days.

### Seasonal effects

Next, I wanted to see how my physical activity had changed over the course of the year. This graph shows my average daily steps for each month of the year.

![](/images/article_images/monthly.png)

There's clearly a big bump in daily activity during May and June. That was a vacation period between finishing school and starting my full-time job, during which I did some traveling in places with nice warm weather. April was also a fairly active month although I was busy finishing up school, perhaps also because of weather. It makes sense that nice weather leads to more walking, but I was surprised by the size of the effect. Definitely something to keep in mind when evaluating places to live in the future.

### School vs. work

As I mentioned earlier, I was curious to use this data to assess how my level of physical activity changed after graduating college. Fortunately, the graph above indicates that my activity didn't dramatically decrease, and a t-test confirmed that there was no statistically significant difference between my overall levels of activity in those two periods.

Still, I was suspicious. In college I had to frequently walk around campus to get to class, meet friends, and eat meals. Now that I have a job, I spend most of my time on weekdays in an office without walking around a whole lot. Is it really possible that I'm just as active as I was in college?

Splitting the data into weekdays and weekends turned out to be quite illuminating. The boxplot below shows my distribution of daily steps on weekdays and weekends, both while I was in school and since I've had work. The notches on the boxes indicate a 95% confidence interval for the median, meaning that if the notches on two boxes don't overlap, there's probably a statistically significant difference between the boxes.

![](/images/article_images/weekends.png)

When I was in school, weekdays and weekends had very similar step profiles. But since starting my job, there's a huge gap difference between weekdays and weekends. If you only count weekdays, I'm much less active than I used to be, with a median daily step count of only around 5,100. But weekends are far more active now, with a median of almost 9,000 steps per day.

This makes sense—in college, I had to spend most of my weekend time in the library studying, but now, freed of the shackles of homework, I can spend usually at least one weekend day doing things I enjoy, which often involves walking around outside. Still, while it's great that I'm compensating for less active weekdays with more active weekends, I'll need to increase my weekday step counts if I want to move my overall median closer to 10,000.

### Daily rhythms

While pedometer data is great for monitoring physical activity at a high level, it's also a rich source of information for analyzing daily rhythms of life. The graph below shows my average step counts every hour on weekdays, both before I graduated and after I started working.

![](/images/article_images/hourly.png)

When I was in school, the slow ramp up from 10am to 2pm shows that I often got a late start on the day. I was quite active throughout the day until 1am, with two dips around 4pm and 9pm probably corresponding to common nap times. I stayed somewhat active throughout the night because of frequent all-nighters; I think the spike around 5am is probably walking back from the library after late nights studying.

Unsurprisingly, working weekdays have a completely different rhythm. The huge spike centered around 9am is my morning commute. Things are pretty quiet from 10am to 5pm while I'm at the office, logging under 300 steps/hour for the whole workday. Then there's a bump from 7pm to 10pm because I usually go home between those hours, although it's not as sharp as the morning spike because I don't leave the office at the same time every day. Finally, there's a very steep drop off around midnight, which is about two hours ahead of the corresponding bedtime dropoff in college.

Interestingly, some of the increased walking in college seems to have come from being active way too late at night, which is less than ideal from a health standpoint—getting a good night's sleep is definitely healthier than logging a thousand extra steps at 3am. This is a good reminder that aggregated data doesn't tell the whole story, and it's important to dig deeper into the patterns behind the averages. It's hard to believe that I was more active between 5am and 6am in college than I am between 12am and 1am now!

### Conclusions

This was a fun first foray into the world of personal analytics, and I was pleasantly surprised by how much meaning there was to be found in simple pedometer data. While it's not necessary (and perhaps harmful) to analyze your personal life to the same extent that you would analyze a business, the mantra that you can't improve what you can't measure still applies in some ways. I feel equipped to make better life decisions now that I've looked back at a year of this data.

I recently installed the [Moves app](https://www.moves-app.com/) on my phone, which goes a step further than Argus and actually tracks my location throughout the day, adding a whole new dimension beyond step counting. I'm looking forward to analyzing that data a year from now and seeing what I can find out.

### Code

The Ruby and R scripts I used for this project are [on Github](https://github.com/geoffreylitt/argus-analysis).
