---
title: "ENHANCE!: Upscaling images CSI-style with generative adversarial neural networks"
date: 2017-06-04 12:16 UTC
tags:
---

*I gave a silly lightning talk about GANs at [Bangbangcon 2017](http://bangbangcon.com/)! You can watch the video, or read a written version of the talk below.*

## Watch it

<iframe width="560" height="315" src="https://www.youtube.com/embed/RhUmSeko1ZE" frameborder="0" allowfullscreen></iframe>

READMORE

## Read it

If you've ever watched the TV show CSI, you may have noticed that, while it scores pretty highly in terms of entertainment value, in terms of accurately portraying what computers do, it does not do quite as well.

I spent way too long "researching" the best (worst?) examples of this, and found [an incredible example](https://www.youtube.com/watch?v=hkDD03yeLnU) where a character actually says, "I'll create a GUI interface in Visual Basic, see if I can track an IP address!" I have no words for this. Well, part of me wants to say "Have you heard of React Native?" But anyway.

The most egregious and consistent example of this sort of thing is, of course, the infamous "Zoom and Enhance," where the characters need to take a low-resolution surveillance camera image of a face or a license plate, and convert it into a crystal clear picture they can use to catch the criminal.

If you know anything about computers, you probably laugh when you see people do this in TV shows. We all know this is impossible...or is it?

It turns out that recent machine learning techniques have actually made this (kind of) possible! Let's take a look at how this works.

### An impossible request?

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

### Neural networks to the rescue...?

Maybe we can try using a neural network for this. At a very high level, a neural network is just an approximation of a function that takes some input data, applies a complex transformation to it, and produces some output data. Except instead of explicitly programming the function, we just have the neural network learn it for us based on a bunch of example input/output pairs.

So in this case, what we want is a neural network that takes a low-resolution face photo as input, and produces a high-resolution face photo as output.

Assuming we know a good structure for our neural network, this is actually pretty straightforward. We just need a bunch of pairs of low-res and high-res images of faces, and then we can feed those to the neural network as training data.

<img src="/images/article_images/enhance/9.svg">

There's a great dataset of celebrity face photos called [CelebA](http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html) that we can use for our high-res face photos. To get the low-res versions we can just downscale each photo. Voila, we have our training data!

The other thing we need to define to get our neural network to train is to define a "loss function," or the function that our network is going to try to optimize. We'll try using a pretty simple loss function here: a per-pixel difference.

On each training iteration, we give the neural network a low-res image, it produces a guess at what it thinks the high-resolution image should look like, and then we compare that to the real high-resolution image by diffing each pair of corresponding pixels in the two images. The neural network's goal becomes to change its upscaling function to reduce this difference as much as possible. This makes intuitive sense as a good function to minimize--if the neural network perfectly reproduced the actual high-res image every time, the per-pixel difference would be zero.

<img src="/images/article_images/enhance/11.svg">

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

### GANs to the rescue

GANs were [invented in 2014 by Ian Goodfellow.](https://arxiv.org/abs/1406.2661), and they provide a clever solution to this problem of incentivizing our neural network to produce realistic images.

GANs take inspiration from adversarial games where two players are competing against each other. As an example of this sort of game, imagine some criminals creating counterfeit money.  They start producing counterfeit bills, and at first the bills work fine. But then at some point, the police catch on and develop better detection techniques. In response, the counterfeiters create new fake bills to defeat those techniques. This back-and-forth continues until the counterfeiters are producing really high-quality bills.

<img src="/images/article_images/enhance/17.svg">

GANs employ a similar structure by pitting two neural networks against each other in an adversarial game. We start by repurposing our upscaling neural network from before, and we now call it the "generator." It's kind of like the counterfeiter--its job is to produce fake high-res images based on low-res images. But this time, we're not going to use the per-pixel difference loss function to train the generator.

Instead, we add a new neural network to the system, called the "discriminator." Its job is to take an image as input, and produce as output the probability that the image is a fake high-res image produced by our generator. This network is similar to the police--it's trying to determine whether a given image is "real" or "fake." Conversely, just like the counterfeiter's goal was to minimize the probability of getting caught by the police, our generator's objective is now defined in terms of the discriminator; it wants to minimize the discriminator's accuracy at differentiating real high-res images from fake high-res images created by the generator.

<img src="/images/article_images/enhance/18.svg">

So how does this actually work during training? On each iteration of training, we randomly give the discriminator network either a real high-res image from our training set, or an upscaled image produced by our generator network. It takes its best guess, and then we tell it what the correct answer was to give it feedback and help it improve over time.

The generator network gets trained indirectly through the discriminator network. When the discriminator identifies a fake upscaled image, it gives feedback to the generator about how the generator could have produced a more realistic image, and the generator adjusts according to that feedback. Through this process, on each iteration of training, the generator becomes slightly better at producing a realistic image--one that will fool the discriminator next time.

I used the same open-source Tensorflow network to train a GAN on our face training data, and here's how the output looked as it trained. The upscaled faces start out looking pretty odd, but over time they become much more defined than the bicubic interpolation upscaled photos, and start looking pretty realistic!

<img src="/images/article_images/enhance/gan-training.gif">

Alright, we've trained our GAN. Now for the moment of truth...let's see how it performs on our example face.

<img src="/images/article_images/enhance/19.svg">

Wow, that worked pretty well!

<img src="/images/article_images/enhance/20.svg">

At this point you might be thinking that there's a catch, and you would be right. The low-resolution images obviously don't contain enough information to actually reconstruct the original image. So to some extent, our neural network is just making up new pixels that seem realistic. This technique may be ready for TV, but it's not ready for actual crimefighting.

To demonstrate this, we can look at GAN-upscaled images side-by-side with the original high-res images. You can see that while the generated faces match their low-res versions and look somewhat realistic, they don't actually look too similar to the original high-res photos.

<img src="/images/article_images/enhance/21.svg">

Also, because our upscaler was trained only on photos of faces, it naturally tries to turn everything into a face. For example, if we try to upscale the Bangbangcon conference logo, we get this weird face-ish blob:

<img src="/images/article_images/enhance/23.svg">

### Fun with GANs

GANs are catching on in the machine learning community, and researchers are coming up with [dozens of papers](https://github.com/hindupuravinash/the-gan-zoo) producing remarkable results using GANs.

One group came up with [a way to automatically convert zebra photos into corresponding horse photos, and vice versa](https://github.com/junyanz/CycleGAN):

<img src="/images/article_images/enhance/horse2zebra.gif">

[Another paper](https://github.com/phillipi/pix2pix) converts line sketches of specific objects into fake photographs
matching the sketches. For example, I created a masterful sketch of a cat and got this photo:

<img src="/images/article_images/enhance/25.svg">

There's an [online web-based demo](https://affinelayer.com/pixsrv/) of that technique where you can try to draw a better cat than I did.

Yet another group created [a system](https://arxiv.org/pdf/1612.03242v1.pdf) that converts captions describing birds to fake photos of said birds:

<img src="/images/article_images/enhance/26.svg">

And this is only scratching the surface of what GANs can do today! The research community seems to be developing new GAN-based techniques at a blistering pace, and I'm looking forward to seeing what surprising new tasks computers are able to achieve using GANs over the coming years.

### Further reading

If you're looking to learn more about generative adversarial networks, I'd recommend:

* OpenAI's [blog post](https://blog.openai.com/generative-models/) about generative models: a good conceptual overview and pointers to their recent work in the space
* Brandon Amos's blog post [Image Completion with Deep Learning in TensorFlow](https://bamos.github.io/2016/08/09/deep-completion/): a more detailed look with some Tensorflow code
* Ian Goodfellow's [recent tutorial at NIPS](https://arxiv.org/pdf/1701.00160.pdf): I found this overview from the original inventor of GANs to be helpful for understanding the core ideas. It does get pretty technical but you'll be able to follow along if you have some ML background.
