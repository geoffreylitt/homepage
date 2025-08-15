---
layout: simple
---

# News context sidebar

While in college, my friend [Seth](https://seththompson.org/) and I spent a day at the Y-Hack 2013 Hackathon
building a browser extension to help people understand the news by
showing a sidebar with background information about key concepts in the article,
like people, places, or institutions. The project won first place out of
1000+ participants.

![screenshot](project_images/news-context/news-context-phillipines.png)

Under the hood, the project had some several components that came together to
deliver a simple user experience:

* We used the NLTK natural language processing library and the Alchemy API
  service to detect important entities in an article
* We used the Freebase API and the Bing News and Image Search APIs to
  fetch information about the entities in an article
* We made a Chrome extension that exposed all this backend functionality,
  in a simple way. The user could click a single button and get a clean
  reading experience for any news article, with the sidebar providing
  summaries and images of key entities as well as links to more information.

![screenshot](project_images/news-context/news-context-full.png)

