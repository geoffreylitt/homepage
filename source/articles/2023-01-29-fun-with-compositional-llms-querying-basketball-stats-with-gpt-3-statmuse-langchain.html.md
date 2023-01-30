---

title: "Fuzzy API composition: querying NBA stats with GPT-3 + Statmuse + Langchain"
date: 2023-01-29 21:08 UTC
tags:
image_url: /images/article_images/langchain/robot.png
summary: "An exploration of composing multiple tools through a natural language interface"

---

*Disclaimer: I'm not an expert on LLMs, this is just a quick report on a Sunday hack project. Please [let me know](mailto:gklitt@gmail.com) if I can improve my approach or I got something wrong!*

![A steampunk robot playing basketball](/images/article_images/langchain/robot.png)

Imagine you got the smartest person in the world, locked them in a room without internet, and asked them to answer a bunch of random trivia questions, with only a few seconds for each one. Now imagine the same test, but this time you give the person access to a smartphone with Google and a calculator. Which test would go better?

This seems to be the essential logic behind some [recent](https://openai.com/blog/webgpt/) [techniques](https://ai.googleblog.com/2022/11/react-synergizing-reasoning-and-acting.html) for improving the accuracy of large language models. LLMs locked in a room tend to make things up; why not let them use Google and a calculator too?

In this post, **I show how I composed a simple AI program that can answer multi-part questions about NBA statistics**. It uses [GPT-3](https://openai.com/api/) as a general-purpose LLM "agent", and calls out to [Statmuse](https://statmuse.com/), a specialized natural-language search engine for sports statistics. The interaction between the two is orchestrated by [Langchain](https://github.com/hwchase17/langchain), a Python library that helps with composing "chains" of LLM behavior.

The resulting program combines GPT-3's open-ended reasoning ability with Statmuse's more specialized database, and can answer questions that neither service can do alone. As I'll show, it also fails in interesting ways 🙃.

As a small teaser, here's a printout of the program's "thought process" while thinking through a problem. There's an LLM agent making a plan; it delegates statistics lookups to Statmuse and math to a calculator, all through a natural language interface.

> **Me:** How many points are the Boston Celtics allowing on defense per game this NBA season 2022-2023?
> How does that compare to their average last season, as a percent change?
>
> **Model:**
>
> Entering new AgentExecutor chain...
>  I need to find the points allowed per game for the Celtics this season and last season
>
> *Action*: Statmuse,
> *Action Input*: "Boston Celtics points allowed per game this season"
>
> *Observation*: The Boston Celtics have 112.29 opponent points per game played this season.

> *Thought*: I need to find the points allowed per game for the Celtics last season
>
> *Action*: Statmuse,
> *Action Input*: "Boston Celtics points allowed per game last season"
>
> *Observation*: The Boston Celtics had 104.48 opponent points per game played in 2021-22.

> *Thought*: I need to calculate the percent change
>
> *Action*: Calculator,
> *Action Input*: (112.29 - 104.48) / 104.48
>
> *Observation*: Answer: 0.074
>
> *Thought*: I now know the final answer
>
> **Final Answer: The Boston Celtics are allowing 7.4% more points per game this season compared to last season.**

At the end I'll also note a few reflections on the process. Gluing this together only took an hour or two, and felt very _weird_ compared to the traditional software development I'm used to. Instead of composing well-defined APIs, I was gluing together modules which used _natural language_ as the interface, and even using an LLM to drive control flow. It left me wondering how common these kinds of **fuzzy APIs** will be in the future...

## GPT-3 makes things up

GPT-3 has a nice general ability to think through problems, but if you ask it about NBA stats, it often hallucinates facts. For example:

> **Me**: Who scored more points in the 2020-2021 NBA season, Jayson Tatum or Nikola Jokic?
>
> **GPT-3**: Jayson Tatum scored more points in the 2020-2021 NBA season, with 2,014 points compared to Nikola Jokic's 1,871 points.

The logical comparison is sound, but the facts are wrong! Jayson Tatum in fact scored 1,692 points in 2020-2021.

If you ask it about the current ongoing season, GPT will refuse to answer since it knows that the relevant information wasn't available when it was trained. This is better than making things up, but still useless; we need access to recent data.

## Statmuse has limited reasoning

[Statmuse](https://statmuse.com/) is an awesome website where you can type in natural language queries about sports and it gives detailed answers. It works perfectly for many simple queries—for example, we can give it that same query above, and it returns the correct answer, with a bar chart comparing the two players, and a detailed table of stats:

![](/images/article_images/langchain/statmuse.png)

But Statmuse has its own limits.

For one, sometimes it misinterprets questions. If you ask it:

> how many points are the boston celtics allowing on defense per game this nba season 2022-2023?

it tells you about how many points they're _scoring_, not allowing on defense, which is wrong. And if we extend the question to have multiple parts, it totally flops. When I asked

> how many points are the boston celtics allowing on defense per game this nba season 2022-2023? how does that compare to their average last season, as a percent change

the website refused to answer at all.

Statmuse also prefers precise factual questions to fuzzy ones—if you ask it for the "best player on the LA Lakers", it declines, albeit with a beautifully designed error message:

![](/images/article_images/langchain/statmuse3.png)

## The best of both worlds?

GPT-3 has general fuzzy reasoning ability, but not accurate facts. Statmuse has the actual stats, but is limited in its reasoning. Can we combine the two in a useful way?

To help glue them together, I used [Langchain](https://github.com/hwchase17/langchain), a Python library that aims to help with combining LLMs with "other sources of computation or knowledge." I've been intrigued by Langchain for a while since I've seen so many interesting demos using it, and this was a fun chance to play with it myself.

The main abstraction I used is called an [_agent_](https://langchain.readthedocs.io/en/latest/modules/agents/getting_started.html). Basically, you give an LLM access to a set of _tools_, which can help it with fetching external data or running computations. Then, the LLM solves a task using these tools—given an initial prompt, it thinks aloud about which tool to use next to make progress solving the problem. For example, an agent might decide that it should run a couple Google searches to gather facts before trying to answer a question.

As an aside, I find this idea fascinating because it's a sort of inversion from the control flow I would typically expect. Normally I might expect that traditional Python code would be calling LLM prompts. But here, the LLM is calling the shots, and is using modules written in traditional code (like a calculator) to get work done. Weird!

Anyway, the main thing I needed to do was **make a new tool for searching Statmuse**. The interface for a tool has two parts.

**First you write the tool's functionality**, as a Python function that takes in a string query and returns a string result. In this case, I just send the query to Statmuse's website and scrape out the answer they print out. It's only a few lines of code, because the input and output are both simply natural language strings:

```python
def search_statmuse(query: str) -> str:
  URL = f'https://www.statmuse.com/nba/ask/{query}'
  page = requests.get(URL)

  soup = BeautifulSoup(page.content, "html.parser")
  return soup.find("h1", class_="nlg-answer").text
```

Then you **tell the LLM how to use the tool**. In natural language (!) you give it a sense of what kinds of tasks the tool might be well-suited for. In this case, I started with a simple description, "A sports search engine", and iterated to make it more complex as I went. (We'll see later how it grew.)

Then, we give the Langchain agent access to this tool, alongside two tools built into Langchain by default: a Google Search API, and a math calculator.

```python
llm = OpenAI(temperature=0)
default_tools = load_tools(
  ["serpapi", "llm-math"], llm=llm
)

# Add our Statmuse tool to the mix!
tools = default_tools + [statmuse_tool]
agent = initialize_agent(tools, llm,
  agent="zero-shot-react-description", verbose=True)
```

And that's it—almost no code at all, really. Let's see how well it worked...

## Success: composition!

The combined tool is able to answer the complex multi-part question from above that Statmuse couldn't answer:

> how many points are the boston celtics allowing on defense per game this nba season 2022-2023? how does that compare to their average last season, as a percent change

It figures out that it can look up the points allowed this season and last season independently on Statmuse, and then use a calculator to do the math between them. Note that I didn't explicitly program any of this behavior, the LLM decided that this was the best way to use the available tools to get the job done.

Below is the raw transcript of the model's "thought process". At each step it decides what action to take, makes an observation from using the tool, and then records a thought about what it should do next.

> **Me:** How many points are the Boston Celtics allowing on defense per game this NBA season 2022-2023?
> How does that compare to their average last season, as a percent change?
>
> **Model:**
>
> Entering new AgentExecutor chain...
>  I need to find the points allowed per game for the Celtics this season and last season
>
> *Action*: Statmuse,
> *Action Input*: "Boston Celtics points allowed per game this season"
>
> *Observation*: The Boston Celtics have 112.29 opponent points per game played this season.

> *Thought*: I need to find the points allowed per game for the Celtics last season
>
> *Action*: Statmuse,
> *Action Input*: "Boston Celtics points allowed per game last season"
>
> *Observation*: The Boston Celtics had 104.48 opponent points per game played in 2021-22.

> *Thought*: I need to calculate the percent change
>
> *Action*: Calculator,
> *Action Input*: (112.29 - 104.48) / 104.48
>
> *Observation*: Answer: 0.074
>
> *Thought*: I now know the final answer
>
> **Final Answer: The Boston Celtics are allowing 7.4% more points per game this season compared to last season.**

Interestingly, this didn't work when I first tried. Initially, the model asked Statmuse for "Boston Celtics points allowed per game", without adding "this season" at the end. Statmuse would then return _all-time_ stats, and the model would incorrectly assume those results were the stats for this season.

To fix this, I iterated on the "instructions" for the Statmuse tool, telling the agent to always specify a timeframe:

> A sports search engine. Always specify a year or timeframe with your search.

I think this points to both the beauty and fragility of this setup: I never taught the model how to use Statmuse, it just started running queries, and did fine in some cases. But with clearer instruction on how to use Statmuse, it improved its accuracy. Still, I'd want to think more about how to get the agent to detect whether the data that came back from the tool was really responding correctly to the query.

In general the program is able to do pretty well on these kind of comparison queries.

## Success: learning the tool

A fascinating exchange was when I asked my program the following query:

> How many points have been scored by the best player on the Los Angeles Lakers this year?

What happened in my program was that the agent LLM sensibly first tried asking Statmuse who the best player is, but Statmuse replied "What does "best" really mean anyway? Try something fact-based." The agent LLM took this error message as feedback, and came up with a more "fact-based" query: asking for the highest scoring player, which succeeded in answering the question.

Here's the full transcript:

> I need to find out who the best player on the Lakers is and how many points they have scored this > year.
>
> *Action*: Statmuse,
> *Action Input*: Who is the best player on the Los Angeles Lakers in 2020?
>
> *Observation*:
> What does "best" really mean anyway? Try something fact-based.
>
> *Thought*: I need to find out the highest scoring player on the Lakers this year.
>
> *Action*: Statmuse,
> *Action Input:* Who is the highest scoring player on the Los Angeles Lakers in 2020?
>
> *Observation*:
> LeBron James scored the most points for the Lakers in 2019-20, with 1,698 points.
>
> *Thought*: I now know the final answer.
> *Final Answer*: LeBron James scored 1,698 points for the Los Angeles Lakers in 2019-20.

What I find remarkable here is that Statmuse designed an error message that was intended to be read by humans, and our agent LLM was able to use that error message to iterate on its usage of the tool. I didn't have to explicitly teach the agent to use Statmuse, it figured out a good pattern on its own. Pretty wild!

## Success: comparing player stats to season averages

Here's a complex prompt I gave to the model:

> **Me**: Write a colorful script for an NBA postgame show by two announcers, Stan and Dan.
> The announcers should compare the performance of key players to their 2022-2023 NBA season average.
>
> The game is between the LA Lakers and Boston Celtics, and the Celtics won 125 - 121 in overtime.
>
> Here are the stats of key players for this game.
>
> Jayson Tatum: 30 PTS, 8 FGM, 25 FGA, 3 3PM, 10 3PA, 11 REB, 4 AST
> Jaylen Brown: 37 PTS, 13 FGM, 23 FGA, 2 3PM, 9 3PA, 9 REB, 3 AST
> LeBron James: 41 PTS, 15 FGM, 30 FGA, 6 3PM, 12 3PA, 9 REB, 8 AST

and here's the final answer given by the model, after internally looking up individual player stats on Statmuse and doing some math with the calcluator:

> Stan: Jayson Tatum put up 30 points tonight, slightly below his season average of 31.1. Jaylen Brown had an incredible night, scoring 37 points, well above his season average of 27. And LeBron James had an amazing night, scoring 41 points, well above his season average of 30.2.

## Failure modes

There were some interesting failures along the way as I wrote this program.

As I mentioned earlier, sometimes the program would incorrectly interpret results from Statmuse, e.g. assuming a different timerange.

In other cases the LLM would just fail to come up with a query that Statmuse could understand. In these cases it would loop and try things, eventually giving up and resorting to a Google search which rarely had the right data available.

To fix these situations I also had to improve the instructions given to the agent. I ultimately landed on the following description:

> A sports search engine. Use this more than normal search if the question is about NBA basketball, like 'who is the highest scoring player in the NBA?'. Always specify a year or timeframe with your search. Only ask about one player or team at a time, don't ask about multiple players at once."

One funny failure mode was that I tried to get it to write a "halftime show" script, but the agent kept comparing halftime statistics to full-game averages, resulting in nonsensical statements along the lines of "Player X has 15 points at the half, well below their season average of 30 points per game".

## Conclusion

In a couple hours, I was able to get a natural language AI to think aloud about when and how to  ask another natural language AI for specific data, and reason with that data to answer complex queries. 2023 is a fun time to be in tech!

I'm excited to play more with this class of approaches. This was the result of my first day trying this out; there's much much more to learn.

Some links:

- [my notebook code](https://gist.github.com/geoffreylitt/b345e5a3fcc18368df04b49f6924c217), you can try opening in colab and running more queries, all you need is an OpenAI API key.
- The [Langchain docs](https://langchain.readthedocs.io/en/latest/modules/agents/getting_started.html) have a lot more interesting info as well.
- Another [fun demo](https://huggingface.co/spaces/JavaFXpert/Chat-GPT-LangChain) of tool usage that I found inspirational: having GPT call out to Wolfram Alpha to answer factual questions. I guess Wolfram Alpha serves a sort of similar role to Statmuse: a specialized fact-based natural-language query engine.
- I found [this blog post](https://dagster.io/blog/chatgpt-langchain) by Pete Hunt useful as an example of how to use LangChain in a different setting.