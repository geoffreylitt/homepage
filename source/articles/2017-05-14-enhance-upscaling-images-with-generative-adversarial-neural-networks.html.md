---
title: "ENHANCE!: Upscaling images CSI-style with generative adversarial neural networks"
date: 2017-05-14 17:16 UTC
tags:
---

---

*This is a loose transcription of a lightning talk I gave at [Bangbangcon 2017](http://bangbangcon.com/). There's also a [10-minute video on Youtube](https://youtu.be/wGB5AYvFjxE?t=6h11m30s) if you prefer that format.*

---

If you've ever watched the TV show CSI, you may have noticed that, while it scores pretty highly in terms of entertainment value, in terms of accurately portraying what computers do, it does not do quite as well.

<img src="/images/article_images/enhance/2.svg">

I spent way too long "researching" the best (worst?) examples of this, and found [an incredible example](https://www.youtube.com/watch?v=hkDD03yeLnU) where a character actually says, "I'll create a GUI interface in Visual Basic, see if I can track an IP address!" I have no words for this. Well, part of me wants to say "Have you heard of React Native?" But anyway.

The most egregious and consistent example of this sort of thing is, of course, the infamous "Zoom and Enhance," where the characters need to take a low-resolution surveillance camera image of a face or a license plate, and convert it into a crystal clear picture they can use to catch the criminal.

If you know anything about computers, you probably laugh when you see people do this in TV shows. We all know this is impossible...or is it?

It turns out that recent machine learning techniques have actually made this (kind of) possible! Let's take a look at how this works.

READMORE

## An impossible request?

<img src="/images/article_images/enhance/3.svg">

Imagine you're a technician on the CSI detective team, and you're sitting in your office, questioning your coworkers' sanity, when the boss walks in, and you have the following exchange:

*Boss*: Hey, we got this photo in but it's super grainy. Can you enhance it like we always do?

*You*: Sooo, the thing is, that's actually not really --

*Boss*: ENHANCE IT

*You*: ...Ok.

Where do we even start with this? I guess we could just try making it bigger with Photoshop?

By default, Photoshop uses a pretty simple algorithm called bicubic interpolation to make images have more pixels. It adds more pixels in between the ones we already have, and just fills each pixel up based on the colors of the pixels immediately surrounding it.

<img src="/images/article_images/enhance/5.svg">

Let's see how well that works here:

<img src="/images/article_images/enhance/6.svg">

Hmmm... well, we definitely have more pixels now, but we didn't gain much clarity in the image. Oh well, maybe this is the best we can realistically do given the technology we have. Let's try showing this to the boss.

<img src="/images/article_images/enhance/7.svg">

Alright, guess that wasn't good enough. It's 2017; there must be other tools we can try here.

## Neural networks to the rescue...?

Maybe we can try using a neural network for this. At a very high level, a neural network is just an approximation of a function that takes some input data, applies a complex transformation to it, and produces some output data. Except instead of explicitly programming the function, we just have the neural network learn it for us based on a bunch of example input/output pairs.

So in this case, what we want is a neural network that takes a low-resolution face photo as input, and produces a high-resolution face photo as output.

Assuming we know a good structure for our neural network, this is actually pretty straightforward. We just need a bunch of pairs of low-res and high-res images of faces, and then we can feed those to the neural network as training data.

<img src="/images/article_images/enhance/9.svg">

There's a great dataset of celebrity face photos called [CelebA](http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html) that we can use for our high-res face photos. To get the low-res versions we can just downscale each photo. Voila, we have our training data!

The other thing we need to define to get our neural network to train is to define a "loss function," or the function that our network is going to try to optimize. We'll try using a pretty simple loss function here: a per-pixel difference.

<img src="/images/article_images/enhance/11.svg">

On each training iteration, we give the neural network a low-res image, it produces a guess at what it thinks the high-resolution image should look like, and then we compare that to the real high-resolution image by diffing each pair of corresponding pixels in the two images. The neural network's goal becomes to change its upscaling function to reduce this difference as much as possible. This makes intuitive sense as a good function to minimize--if the neural network perfectly reproduced the actual high-res image every time, the per-pixel difference would be zero.

In the image above, you can see that the lower-left pixel is circled. The neural network guessed that it's black, but in the actual high-res photo, it's white. We heavily penalize the neural network for that, so that it's incentivized to fix that error next time.

Alright, enough talk--let's train a neural network with 200,000 CelebA photos and see how it works! I used an [open-source Tensorflow network by David Garcia](https://github.com/david-gpu/srez) for this, and modified it to just use this per-pixel loss function. (As a sidenote, after spending a couple hours trying and failing to get Tensorflow setup on an EC2 machine with a fancy GPU for fast training, I got running pretty quickly on [FloydHub](http://floydhub.com/), a "Heroku for Deep Learning" site.)

After a few hours of training, we're ready to try out our neural network on our low-res image! Let's see how it did compared to Photoshop:

<img src="/images/article_images/enhance/nn.svg">

Hmm... not much better than Photoshop. What went wrong???

It turns out the problem is with our choice of loss function. To get some intuition for what the problem is, imagine the case where we're training and a low-res image has a sharp edge in it. Our neural network correctly draws a sharp edge in the high-res image, but it misplaces it slightly.

<img src="/images/article_images/enhance/high-loss.svg">

From the perspective of our per-pixel loss function, our neural network totally messed up! It drew black pixels where there are white pixels, and vice versa. It's going to be really highly penalized for trying to draw a sharp image. And so, what it ends up doing is learning to produce fairly conservative, blurry images.

<img src="/images/article_images/enhance/low-loss.svg">

On average, these images are never too far off from the real high-res image. In fact, *on average* they're optimally close to the real high-res image.

But that's not what we want! This is never going to produce a TV-quality high-resolution face image. What we want is a neural network that will draw in a highly detailed face. We're going to need a new loss function which cares less about average similarity to the real image, and cares more about whether the image *actually looks realistic*.

And that's where generative adversarial networks (GANs) come in.

## GANs to the rescue
