---
title: "No Redis Needed: building a Postgres-backed recommendation engine for Rails"
date: 2017-03-19 20:33 UTC
tags:
---

I recently became interested in how online recommendation engines work, and decided to try implementing one myself as a Rails gem. I ended up building a gem that runs recommendations on your relational database, instead of using Redis like other gems. Read on to learn more about how I got there.

READMORE

## Existing Rails recommendation gems

Looking at the existing options for Rails recommendation engines, I quickly realized two things.

### Realization #1: Basic recommendation algorithms are surprisingly simple!

If you've heard of the Netflix challenge or all the fancy algorithms that big companies use to recommend things to you, you might think that recommendation is a really hard problem. And you're not wrong. Producing high-quality recommendations is a deep subject that whole companies specialize in.

But producing basic, workable recommendations to users is actually a pretty simple problem! To take an example, let's see how we could provide recommendations to users on a movie website.

On our website, users can "like" movies, so we have a record of all the movies that each user liked.

First, we take each pair of movies in our database and compute a similarity between the two movies. To find this similarity, we compare the lists of users who liked the two movies. If many people liked both of the movies, chances are they're fairly similar. Conversely, if not many people liked both movies, they're probably less similar. A table of similarities might look something like this:

<h4>Movie similarities</h4>
<table>
  <tr>
    <th></th>
    <th>Batman</th>
    <th>Superman</th>
    <th>Toy Story</th>
  </tr>
  <tr>
    <th>Batman</th>
    <td>1</td>
    <td></td>
    <td></td>
  </tr>
  <tr>
    <th>Superman</th>
    <td>0.7</td>
    <td>1</td>
    <td></td>
  </tr>
  <tr>
    <th>Toy Story</th>
    <td>0.2</td>
    <td>0.1</td>
    <td>1</td>
  </tr>
</table>

Once we have this list of similarity scores between movies, it's pretty easy to provide recommendations. If a user is viewing a page for a specific movie, we can provide a list of "Similar Movies" by just finding the most similar movies on our earlier metric. On a user's homepage, we can just take all the movies our user has liked, find the most similar movies for each of them, and then aggregate those results together into one list.

This approach to recommendation is called "item-item collaborative filtering," which is just a fancy name for providing recommendations using similarity between items based on user preferences. There are plenty of ways to make it fancier, but the core idea is simple.

One nice thing about this algorithm is that your item-item similarities are probably pretty stable, so you can precompute them offline. If a user likes a new movie, you can instantly incorporate that data into their recommendations, without recomputing all their recommendations.

One not-nice thing is that it's O(n^2) on the number of items in your system. It's (usually) better to have runtime grow with number of items rather than number of users, but performance is still a challenge that all recommendation engines face.

### Realization #2: Existing Rails gems use Redis, which sometimes isn't great.

The most popular Rails recommendation gems, [predictor](https://github.com/Pathgather/predictor) and [recommendable](https://github.com/davidcelis/recommendable), both use Redis as their backing store.

There are many reasons this is a sensible dependency. Redis has performant in-memory operations that allow you to push your computation to where the data lives. It also might make sense to relax durability guarantees for your recommendation system to achieve higher throughput.

However, using Redis also comes with drawbacks.

From an operational standpoint, you now need to maintain a Redis server. Or if you're already running a Redis server, you must consider adding large amounts of data and read/write traffic to that server, or setting up a new one. Your recommendation system also now depends on Redis being up, so if you were previously using Redis just as an optional caching layer, you've upped your availability requirements.

From a code complexity standpoint, you've added a second place where all relevant user behavior needs to be persisted--every time a user likes or unlikes a movie, you also need to make sure that gets reflected in Redis.

For an experienced Rails developer running a large Rails app in production, these might not seem like significant barriers. But if you're just running a simple Rails app and want to quickly add recommendation functionality, this could be a lot of work. It might even be enough to make you put off adding recommendations to your app.

I started to envision a simpler approach. You're already storing your user Likes in a relational database. Would it be possible to have a performant recommendation engine just run on top of that primary datastore?

### Postgres to the rescue

To find the similarity of two movies, we need to take the user IDs that liked each of the two movies, and compute: (size of intersection of sets) / (size of union of sets). (The fancy name for this is the [Jaccard similarity coefficient](https://en.wikipedia.org/wiki/Jaccard_index).) Because we have to do this computation for every pair of movies, performance becomes important.

One strategy used by the Redis-based gems is to push the similarity computation into our datastore-- we want to avoid the overhead of sending each pair of ID sets back and forth to our application server, especially if those are large sets. We also get extra performance points if our datastore has primitives that help make the similarity computation faster.

Fortunately, these are both problems that can be solved with a relational database. SQL is totally flexible enough to express a single query that computes many item similarities at once. Also, postgres happens to have a convenient extension called `intarray` which provides efficient intersection and union operations for arrays of integers!

## simple_recommender gem

So, I created a small gem called [simple_recommender](https://github.com/geoffreylitt/simple_recommender) that provides recommendations directly on top of your primary Postgres datastore using `intarray` -- no Redis needed.

The setup is as simple as installing the gem and adding two lines to your model, to specify an ActiveRecord association to use for recommendation:

```ruby
class Book < ActiveRecord::Base
  has_many :likes
  has_many :users, through: :likes

  include SimpleRecommender::Recommendable
  similar_by :users
end

```

And then can call `similar_items` to find similar items based on who liked them!

```ruby
book.similar_items(n_results: 3)
# => [#<Book id: 1840, name: "Twilight">,
      #<Book id: 1231, name: "Redwall">,
      #<Book id: 1455, name: "Lord of the Rings">]
```

Under the hood, it reflects on your ActiveRecord associations and composes a SQL query that operates on your join table (e.g. a `Likes` table with `user_id` and `movie_id`). It uses [common table expressions](https://www.postgresql.org/docs/9.2/static/queries-with.html) to create a temporary table with one row per pair of movies, and computes the similarity for each row of that table. That temporary table looks something like this:

<table>
  <tr>
    <th>Movie 1 Name</th>
    <th>Movie 1 User IDs</th>
    <th>Movie 2 Name</th>
    <th>Movie 2 User IDs</th>
    <th>Similarity</th>
  </tr>
  <tr>
    <td>Batman</td>
    <td>{1, 2, 3, 4, 5}</td>
    <td>Superman</td>
    <td>{1, 3, 4, 5, 6}</td>
    <td>0.7</td>
  </tr>
  <tr>
    <td>Batman</td>
    <td>{1, 2, 3, 4, 5}</td>
    <td>Toy Story</td>
    <td>{3, 8, 10, 12, 13}</td>
    <td>0.1</td>
  </tr>
</table>

Then it just finds the highest similarity scores off that table, and returns the resulting movies. If you're curious for more details, you can peek at [the source code](https://github.com/geoffreylitt/simple_recommender/blob/master/lib/simple_recommender/recommendable.rb).

### But is it fast enough?

I've run some quick benchmarks that indicate this is a viable foundation for a useful gem.

On a small dataset of 1000 movies where each movie has 10 descriptive tags, simple_recommender can find similar movies for a given movie in tens of milliseconds, which is fast enough to run recommendations in realtime for a website.

Once that number grows to 10,000 movies, recommendations start to take around 200ms. As mentioned above, time per recommendation also grows with the square of the number of items. So around this point you would want to start considering moving recommendations to an offline precomputation step. I haven't implemented this feature in `simple_recommender` yet, but it's on the todo list.

When I benchmarked `simple_recommender` against the `predictor` gem, I found that predictor was typically about 4x faster. While that might seem like a big gap, it may not make a huge difference in practice. For small datasets both are fast enough, and for larger datasets you need to run precomputation offline anyway. Also, `simple_recommender` hasn't gone through nearly as much optimization, so I wouldn't be surprised if some of that gap could be closed pretty easily.

These benchmarking results aren't meant to be detailed or exhaustive--just enough to demonstrate that the project might be useful.

### More to do!

There's still a lot more I want to do with this gem.

I'm still experimenting with the API, mainly by integrating the gem into some test projects and seeing how it feels. There are still some core features missing, like recommendations for a user based on all their items, and combined recommendations based on multiple sources of data.

Performance is also top of mind. I'm hoping I can squeeze more performance out of the realtime recommendations before resorting to building offline pre-computation of item similarities. The primary differentiator of the gem is one-line install with no extra infrastructure, and users with larger scaling needs will be looking elsewhere anyway, so it seems worth preserving that simplicity for the moment.

Depending on how these experiments go, we'll see if this becomes a toy gem for my own learning, or something that people might actually find useful!
