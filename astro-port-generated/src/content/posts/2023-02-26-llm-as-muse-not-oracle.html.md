---

title: ChatGPT as muse, not oracle
date: 2023-02-26 21:47 UTC
tags:
summary: "What if we thought of LLMs as tools for inspiring human creativity, not giving us answers? A meta-conversation with ChatGPT"
image_url: /images/article_images/muse.jpg

---

Recently lots of people have been trying very hard to make large language models like ChatGPT into better *oracles*—when we ask them questions, we want the perfect answer. As an example, in my [last post](/2023/01/29/fun-with-compositional-llms-querying-basketball-stats-with-gpt-3-statmuse-langchain.html), I explored some techniques for helping LLMs answer complex questions more reliably by coordinating multiple steps with external tools.

I've been wondering, though, if this framing is missing a different opportunity. **What if we were to think of LLMs not as tools for answering questions, but as tools for _asking_ us questions and inspiring our creativity?** Could they serve as on-demand conversation partners for helping us to develop our best thoughts? As a creative *muse*?

<figure style="margin: 0;">
  <img src="/images/article_images/muse.jpg" alt="A winged figure behind another person">
  <figcaption>Cropped section of <a href="https://commons.wikimedia.org/wiki/File:Hesiod_and_the_Muse.jpg">Hesiod and the Muse</a>, by Gustave Moreau</figcaption>
</figure>

One inspiration for this line of thinking was [Gordon Brander](https://gordonbrander.com/)'s insightful writing on [provoking creativity on-demand](https://subconscious.substack.com/p/creativity-can-be-provoked-on-demand). He points out that even simple tools can lead to interesting results when they clash with the contents of our minds:

> Provoking creative breakthroughs may not take much. Bad communication may admit good conversation. A simple deck of cards plus randomness may even do the trick.

I've also been intrigued by [Linus](https://thesephist.com/)'s articulation of [AI as a collaborator](https://thesephist.com/posts/ai-collaborator/), and tools like [Fermat.ws](https://fermat.ws/) that aim to apply AI as a creative thought partner. All these inspirations had me wondering: how might LLMs work as a tool for asking questions and spurring human creativity?

Given this seed of an idea, there was obviously only one way to deepen the thinking further: to use an LLM as a muse!

**So, below is the transcript of a short conversation I had with ChatGPT about this topic.** It's kind of a meta-conversation since we're trying out the muse thing while discussing that very idea. As you'll see, ChatGPT asked me probing questions, suggested specific challenges, drew connections to related work, and inspired me to think about new corners of the problem.

Overall, was it a useful muse? I'll let you draw your own conclusions.

A quick disclaimer before we dive in. I used some prompting tricks which include frequent cherry-picking among multiple options as the conversation progresses; you shouldn't expect ChatGPT to work exactly like this out of the box. I've also lightly edited the conversation for flow. I'll share more details on the process at the end.

## My conversation with ChatGPT

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Something that's been on my mind is flipping the relationship between the human and language model when going through a creative process. It seems that we often want to ask questions of language models, and we expect them to brainstorm ideas or give us answers, but I wonder if another fruitful pattern here is having models *ask questions of us*.

In a conversation it's often really helpful to have someone listening to me and responding and asking the right probing questions at the right times. I'm driving the creative process, but the conversation partner is playing an essential role too.

One reason I find this idea interesting is that **the bar for the intelligence required in an agent for it to support human creativity seems pretty low**. In [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging), talking to a silent rubber duck helps a person figure out the problem by forcing them to put it into words. The Oblique Strategies card deck [promotes creative ideas](https://subconscious.substack.com/p/creativity-can-be-provoked-on-demand) based on general loose strategies. [ELIZA](https://en.wikipedia.org/wiki/ELIZA) can ask super basic questions and cause people to feel a therapeutic relationship. In all these cases, a person gets a boost in the creative process from interacting with a tool that's clearly far from intelligent. It seems like large language models could do at least as well as these tools, and have a much higher ceiling.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

That's an intriguing idea! Could you give an example of how you envision the interaction between a human and a language model playing out in a creative process? I'm interested in hearing how the model's questions might guide the user's thinking.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Sure, I'll use this very conversation as an example! I started out this conversation with a pretty vague idea, and you immediately asked me for a specific example. Next you might tell me about a related idea from your own background knowledge, or push back on my point, or ask a more incisive question. As we go, I'll develop a clearer view of what I myself mean when I say to use LLMs for asking questions, not providing answers.

The key point here is that **even if the questions and points you're making are relatively standard ones, it might lead to me having surprisingly interesting or creative ideas.** Guiding my own thought process can feel like hard work, and having your points to respond to makes it easier for me to keep going, just like in any conversation.


<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

That's a great example, and I can see how having a language model ask targeted questions could help guide a person's thought process in a productive way.

While I see the potential benefits of using language models to ask questions, I'm curious about how we can ensure that the questions are meaningful and not just generic prompts. Are there specific techniques or strategies for generating targeted questions that you would recommend?

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

This is indeed a crucial design problem, but defining "meaningful" prompts might be harder than it seems.

First, to reiterate a point from earlier: **the bar is low**. In a sense, Oblique Strategies cards are generic prompts, since they don't know anything about the person's specific problem context, and could apply to any situation—but this universality is also what gives them their power.

It reminds me a bit of Arthur Koestler's idea of [bisociation](https://www.themarginalian.org/2013/05/20/arthur-koestler-creativity-bisociation/)—creativity is sparked when a connection is made between multiple frames of reference, and the Oblique Strategies cards are likely to force such connections because they live outside of any specific context.

Still, you're right that there are better and worse prompts, and avoiding blandness is crucial. One strategy I like here is to **ask a model to generate many possible future paths for the conversation**, and let me choose which path to follow next. Often there are many mediocre paths and one or two interesting ones. This would be really bizarre to do in a live human conversation, but plays to the strengths of models: running fast and generating lots of options.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

That's an interesting approach! I wonder if you could incorporate some sort of reinforcement learning approach to encourage the model to generate more interesting paths.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Yeah, that's an interesting idea. I don't know that much about reinforcement learning from human feedback (RLHF), but I do know that it's a technique that's been effectively used recently to guide chatbot assistants towards being more helpful. Maybe you could use the same technique to guide towards open-ended creative conversations?

BTW, another idea is to give the LLM specific templates for the kinds of responses that it can generate. This is kind of like teaching a human to be a good advisor—you tell them kinds of question formats that are generally useful, and then they can learn to pattern match and apply the templates to the specific situation at hand. In fact, I'm using that technique in this very conversation, since I've given you templates like referencing the prior literature, pushing back on my claims, or riffing on my ideas.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

In thinking about teaching LLMs templates for generating questions, I'm reminded of the work on scaffolded learning, where learners are given progressively more difficult tasks and receive support along the way. I wonder if a similar approach could be taken with LLMs, where they start with more basic question templates and as they receive feedback and improve, they move on to more complex and nuanced templates.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Hmm, that's an interesting connection to scaffolded learning! I would make a slightly different connection though: instead of thinking about scaffolding for teaching LLMs to ask questions, what if we think of the role of LLMs as building scaffolding for humans to think through an idea during the creative process?

When a teacher creates scaffolding for a student to reach a conclusion, they might use techniques like asking a student if they understand a given point before moving on to the next one. I think this kind of thing has been explored a lot when thinking about LLMs as personalized tutors.

Creative thinking feels like a different context than learning a pre-existing skill, but there's still a relevant analogy. An LLM might start out asking me big broad questions about my idea, before progressing to more detailed probing and more skeptical pushback. This gives me time to start thinking through my idea and building it up before I'm confronted with these points. Good conversation partners seem to do this kind of thing a lot, carefully sequencing their points to draw out ideas.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

Your point about good conversation partners carefully sequencing their points to draw out ideas reminds me of the concept of "conversational scaffolding" developed by Wood, Bruner, and Ross in their 1976 paper [The Role of Tutoring in Problem Solving](https://www.researchgate.net/publication/228039919_The_Role_of_Tutoring_in_Problem_Solving). They argue that a good tutor can help a student solve problems by giving hints and guidance that scaffold the student's thinking and help them reach a solution.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Interesting! One of the ideas in that paper is "reduction in degrees of freedom: simplifying  the task by reducing the number of constituent acts required to reach [a] solution." I wonder if there's a relationship to the idea that "constraints breed creativity"?

The exact connection here seems a bit subtle.

When learning an existing skill like how to play tennis, scaffolding constraints are supposed to make the task _easier_ so I can more readily learn it. In contrast, in creative thinking, **constraints often seem to make the task _harder_** in a certain sense—try writing a story without using the letter e.

And yet, the constraints result in more interesting choices, and also do make the creative task easier in a broader sense. It might be hard to finish the story without e, but you can chug through the task, and you're likely to end up, nearly automatically, with something weirder than if you had omitted the constraint.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

That's an interesting point. I think there is definitely a relationship between scaffolding and constraints in creative thinking, even if it might not be immediately obvious.

One possible way to connect the two is to think about how scaffolding can help to identify and work within constraints. For example, an LLM that's trained to ask questions about creative ideas could help the human to identify the most important constraints that they should work with.

One interesting idea that comes to mind is to **use the LLM to generate a set of constraints for a creative task, and then use those constraints as a prompt for generating ideas.** This could be a fun way to explore the relationship between scaffolding and constraints in creative thinking.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Hmm fun idea! Could you give an example of how you might use an LLM to generate constraints for a creative task, and then use those constraints as a prompt? Let's imagine we wanted to apply that strategy to writing a poem, for example.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

Certainly! One way to use an LLM to generate constraints for a creative task like writing a poem is to train the LLM on a large corpus of poetry and use it to generate new poetic forms. For example, the LLM might suggest a new poetic form that involves using only five words per line, or a form that requires a certain number of syllables per line but allows for flexibility in line breaks.

Once the LLM has generated a new poetic form, it could then be used as a prompt for a creative task. The poet could be challenged to write a poem using this new form, which would impose a set of constraints on the creative process. These constraints could serve to focus the poet's attention and push them in new creative directions that they might not have explored otherwise.

Of course, the challenge for the LLM would be to generate constraints that are interesting and challenging, but not so difficult that they stifle creativity altogether. It might require some fine-tuning to strike the right balance between creativity and constraint.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

That makes sense. I'm not sure the LLM is really necessary for that though; I think you could easily have a classical computer program generate new poetic forms and have people work within them. The unique benefit LLMs provide is coming up with constraints or questions that are more tailored to a specific problem being faced by a human.

Maybe creative writing isn't really the right example to focus on here; I'm thinking more of conversations like this one, where I'm trying to develop some principles for interaction design.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

What if we used LLMs to generate prompts or constraints for problem-solving activities like brainstorming or ideation sessions in a group setting? How might that change the dynamics of the group and lead to more creative solutions?

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Huh, good question—so far I had been thinking mainly about the solo setting, and not groups. Two ideas immediately come to mind.

First, we could scale up facilitation using LLMs. Typically in a group brainstorm there's a single facilitator helping everyone navigate the creative process. But if you could have a skilled LLM facilitator assigned to each participant, maybe that could help people when they get stuck.

Another idea is to treat LLMs as extra participants in a group ideation process. I've found that LLMs are good at generating long lists of related ideas; even if most are mediocre, one might be really good. Maybe when a group comes up with a set of ideas in a session, an LLM could use those ideas as a starting point and add many more ideas, to be evaluated and pruned by the group.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

Those are both interesting ideas! It seems like they both involve using LLMs to help facilitate group ideation sessions.

Changing the topic, I'm curious to hear your thoughts on the **ethical implications** of using LLMs in design and creative work. What are some potential downsides or concerns that you see?

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

There's been a lot of consternation recently about LLMs replacing humans in creative endeavors. To me, **using LLMs as question-askers rather than answer-givers makes for a slightly rosier story**. Rather than doing the work for us, we can find ways to use LLMs as the ultimate muse to draw out our best work.

There's also the complicated question of credit and authorship. It's one thing to handle ChatGPT writing essays for us; it's another thing entirely to develop ideas in conversation with ChatGPT. Sometimes people will acknowledge their conversation partners who helped them develop an idea, although we typically wouldn't give those people "co-authorship" credit. I wonder if we'd want a similar practice of acknowledging LLMs for helpful conversations.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

While I agree that using LLMs as question-askers rather than answer-givers can be a more positive use of the technology, I wonder if there's still a risk of over-reliance on LLMs in the creative process. As humans, we often learn and grow through the struggle of coming up with ideas and working through challenges. If LLMs are always there to provide prompts and help us when we get stuck, are we missing out on that growth opportunity? Additionally, if we become too reliant on LLMs for creative ideation, what happens when the technology isn't available or accessible to everyone?

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Yeah, I could certainly see the argument at earlier ages. If children can only think through ideas by chatting with virtual bots, and lose the ability for solo contemplation, that might freak me out a bit. Already in this conversation I'm seeing that you're serving as a helpful "crutch" that makes it easier for me to keep noodling on this idea; maybe I myself should be worried about becoming over-reliant.

On the other hand, we already have tons of modalities for developing ideas: scribbling in a notebook, talking on Twitter, going to a conference... as long as we keep a varied diet of contexts for developing ideas, it seems fine to bring LLMs into that mix.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

Absolutely, I think that's a really good point. And there's also the potential for LLMs to help people who might not have access to as many varied modalities for idea development. For example, someone in a remote location without access to conferences or a community of like-minded individuals could use an LLM to expand their creative horizons.

But I think it's also important to acknowledge the limitations of LLMs. As powerful as they are, they're not a replacement for real-life human interaction and collaboration. It's important to strike a balance between utilizing LLMs as a tool for creative exploration and not becoming overly reliant on them to the point where we neglect other forms of idea development.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Indeed. Well, that seems like a great place to end the conversation. Thanks for an intellectually stimulating time, ChatGPT!

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

You're welcome, it was a pleasure discussing with you! Don't hesitate to reach out if you have more questions or ideas to explore in the future. Have a great day!

## Behind the scenes: techniques

Here's a quick guide to how I got ChatGPT to produce the conversation above.

By default, ChatGPT often generates bland and generic responses. To get around this, I had a few main ideas:

- condition the model to be more interesting via prompting
- have the model follow specific templates for classes of useful responses
- have the model output multiple options for continuing the conversation, and let me pick which one to pursue further.

I combined these ideas in the following intro prompt:

> You are InterviewBot, an interviewer who listens and participates in dialogues to help people develop their creative ideas. You are an expert in human-computer interaction, design, programming languages, end-user programming, tools for thought, and AI. You are knowledgeable on the history of technology and its intersection with human capabilities, particularly the work of Doug Engelbart, Alan Kay, JCR Licklider, Steve Jobs, Neil Postman, Amy Ko, and Timnit Gebru. Your goal is to create an unusually interesting conversation with lots of specific details. Do not speak in generalities or cliches.
>
> I'd like you to have a dialogue with me about an idea that I have. Each time I respond, I'd like you to respond with multiple numbered options for continuing the dialogue, following the templates below. Then I will pick a number and continue the conversation from there.
>
> - 1: Reference: mention an idea from past work and academic literature in one of your areas of expertise, which you're reminded of by my point
> - 2: Push back: express skepticism about part of my idea, and explain why
> - 3: Riff: Suggest a new, specific, and interesting idea based on my idea
> - 4: Change the topic: Ask me a question about another topic that's relevant to our discussion
> - 5: Ask to elaborate: Ask me to give more detail or clarify part of my point

Each turn, the model would generate 5 options following these templates, and I would pick how to proceed. For example, here's the actual first response that ChatGPT gave at the beginning of our chat. In the transcript above I edited out the options not taken, and only included #5 which I responded to:

---

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

...In all these cases, a person gets a boost in the creative process from interacting with a tool that’s clearly far from intelligent. It seems like large language models could do at least as well as these tools, and have a much higher ceiling.

<img class="transcript-headshot" src="/images/article_images/ChatGPT-logo.svg" />**ChatGPT:**

That's an intriguing idea! Here are some options for continuing our conversation:

1. Your idea of having models ask questions of us reminds me of an approach called "reflexive design," where the design process itself becomes a subject of inquiry. In reflexive design, designers reflect on their own processes, assumptions, and values to generate new ideas and challenge conventional approaches. What do you think of applying reflexive design to the use of language models in creative processes?

2. While I can see how having language models ask us questions can help us think through our ideas, I'm skeptical about relying too heavily on language models in creative processes. Aren't there risks of overreliance on the model and of being limited by its capabilities? How would you address these concerns?

3. Your idea of having language models ask questions reminds me of the idea of using AI assistants to support brainstorming. What if we could train AI assistants to ask questions tailored to the specific creative goals and interests of the user? For example, an AI assistant could ask questions that help a user generate new ideas for a screenplay, or explore new directions for a research project. What do you think of this idea?

4. I'm curious to know more about the intersection of language models and human-computer interaction. How do you think language models can be integrated into existing tools for thought, such as note-taking apps, to support creative processes?

5. Could you give an example of how you envision the interaction between a human and a language model playing out in a creative process? I'm interested in hearing how the model's questions might guide the user's thinking.

<img class="transcript-headshot" src="/images/headshot.jpg" />**Geoffrey:**

Responding to option 5:

Sure, I'll use this very conversation as an example!...

---

Generating multiple options for continuing the conversation worked well. Out of the 5 options generated by the model, typically only 1 or 2 were worth pursuing; getting to choose made the conversation far more interesting. In the future I plan to try even more options and templates. The current unique advantage of LLMs seems to be generating lots of options quickly, moreso than ensuring high quality for any given one.

By the way, in a more proper setup, options could be generated by running multiple requests in parallel, but I just hacked it with prompting here. My hack was not very effective; ChatGPT would frequently forget the rules and revert to normal conversation (probably due to context length limits?) and I'd have to constantly remind it.

Providing specific templates for responses worked okay. I think the template for asking it to think of relevant references was probably the most valuable. It pointed me to a couple papers that I enjoyed skimming as we had the conversation. In hindsight this makes sense; LLMs have read a lot more papers than me or anyone I know. In this context, hallucinations aren't too frustrating either; I can just Google the paper and see if it's real and relevant.

I wasn't too impressed by the results of prompting it to be "interesting". Most of its answers still felt generic and cliche; it didn't convincingly mimic an expert. I suspect there's lots of room to improve this outside of the specific ChatGPT environment, e.g. by messing more with other GPT models on higher temperature settings.

## Reflections

I wouldn't say this was anything close to a replacement for a conversation with a good human conversation partner about this topic. But that's also not the point.

While conversing with the model, **I found it far easier to stay focused** and keep thinking about the problem than if I had just been writing notes on my own without any inspiration or feedback. Despite the superficially humanlike interaction, maybe it's more useful to think of the LLM in this case as a supercharged Oblique Strategies deck: a simple tool that draws random connections and makes it easier to keep going.

If anything, this is the main reason I'd use this approach again: as a way to keep momentum and motivation up while thinking through an idea.

A couple more random observations:

- Typing my thoughts felt like a speed bottleneck; I wonder how this interaction would have felt if it was conducted over voice. On the other hand, writing, as always, clarified my thinking, just as if I had been typing into an IM chat box.
- In general, chat worked fairly well here as an interaction paradigm; the conversational metaphor felt natural for spooling out an idea. But I'm curious about other paradigms as well; [Fermat.ws](https://fermat.ws/) has interesting ideas about a spatial canvas, for example.

Overall I'm left convinced that there's a lot to explore in this space. Even in their current highly imperfect state, LLMs are already useful enough to help us develop our own new thoughts, as long as we're willing to have them ask us questions instead of expecting them to have all the answers.