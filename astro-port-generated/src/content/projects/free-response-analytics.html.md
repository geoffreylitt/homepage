---
---

# Panorama Free Response Analytics

![wordcloud](/images/project_images/free-response-analytics/wordcloud.png)

I led development of a new feature at [Panorama Education](https://www.panoramaed.com/)
to categorize survey feedback responses for educators.

After prototyping the initial algorithm, I worked with a data scientist
and a few other engineers to deploy the feature in production to thousands of schools.
I led the engineering work and contributed throughout the entire stack,
from the core NLP algorithms to the UI design.

## The problem

At Panorama Education, we help K-12 schools run feedback surveys to understand
the perspectives of their students, families, and staff.

In 2016, we were hearing from our users that they got tremendous value out of
responses to qualitative free response questions like "What 1-2 steps could
your school take to improve the school climate?", but that reading through
all these responses took too much time for their busy schedules.

## Prototyping the algorithm

At the time I was running a machine learning study group with several coworkers.
We were taking an online machine learning course and studying
[word vector embeddings](https://en.wikipedia.org/wiki/Word_embedding),
a technique for modeling the similarities between different sets of words.

We started to wonder if we could use word vectors to group responses that
were discussing similar themes, helping people find patterns in the survey
responses and drill down to the responses they cared most about.

At a company hackathon, we built an algorithm based on the following
high-level architecture:

* Extract key words and phrases from each response using grammar rules
* Use [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) to rank
  the importance of each word or phrase
* Use a word vector model to embed each keyword in a vector space
* Run a [hierarchical clustering algorithm](https://en.wikipedia.org/wiki/Hierarchical_clustering) on the word vectors to group the keywords
  into related clusters

We then displayed each cluster of keywords in a word cloud,
to visualize the key themes in the feedback:

![wordcloud](/images/project_images/free-response-analytics/wordcloud-2.png)

Because of the unsupervised nature of the problem, we had no objective measure
of the quality of the algorithm, so we judged quality with
subjective evaluations from our coworkers and our actual customers looking
at their real data in prototypes. After dozens of iterations and lots more parameter tuning,
we were able to consistently get high-quality grouping results in practice.

In addition to feedback on the grouping results, iterative testing with customers
also helped us understand what they actually wanted to get out of the data.
For example, we learned that people didn't just want to see a word cloud
summarizing the responses; they needed to also be able to read the individual
responses within a given theme in order to understand the specific feedback
that could help them improve their schools.

So we built a way for people
to click on any word in the cloud and view all the responses associated
with that theme. In the example below you can see the benefit of grouping
similar words together—responses about "support" and "encouragement" both show up
under the "encouragement" keyword.

![wordcloud](/images/project_images/free-response-analytics/response-examples.png)

## Shipping to production

After validating the algorithm and user interface through prototyping and
user feedback, I led a team of engineers to ship the feature to
thousands of schools, running across millions of survey responses.

Even with a core working algorithm complete, there was still a lot of
work left to do:

* Creating tools to monitor result quality and iterate on the algorithm
* Scaling the algorithm to run much more efficiently and in parallel
* Interfacing between our Python NLP code and our Ruby application
* Making the product robust against a variety of edge cases in real data
* Developing a narrative about the product value, and a technical explanation
  of the algorithmic approach, that made sense to K-12 educators and helped
  them trust the results

Once we shipped, our users loved the feature, and found it helpful for
making sense of all the free response feedback they were receiving. One school leader told us,
“It’s data that I can take action upon. Free Response Analytics really helps us deliver more specific information to our principals to guide improvement.”

## What I learned

This project gave me a new appreciation for the nuances and complexities
of shipping a product feature using machine learning.

Beyond the challenges of developing the core algorithm, there are
fascinating and deep challenges to be found in
designing a feature that delivers real value, dealing with the nitty-gritty details of
shipping a robust system at scale, and explaining how it all works to non-technical users.

---

For more info, you can read [the Panorama blog post about the feature](https://blog.panoramaed.com/introducing-free-response-analytics/).

