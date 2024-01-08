---
title: Quizwire
subtitle: A bot for quizzes generated on wikidata
date: 2020-11-29T00:09:04.225Z
summary: A bot for quizzes generated on wikidata
draft: false
featured: true
authors:
  - admin
lastmod: 2021-11-29T00:00:00Z
tags:
  - Docker
  - Express
  - Elasticsearch
  - Mongodb
  - Wikidata
  - Dialogflow
categories:
  - Fun
  - Coding
  - Bots
  - Quiz
projects: []
image:
  caption: ""
  focal_point: ""
  placement: 2
  preview_only: false

links:
url_project: "https://quizwire.reboting.com/"
url_code: ""
url_pdf: ""
url_slides: ""
url_video: ""
---

**Diving Deep into QuizWire's Technical Composition**

Welcome to a behind-the-scenes exploration of QuizWire, a web-based chatbot designed to deliver a captivating quiz experience. With its integration of several key technologies, QuizWire offers users a unique and educational interaction with trivia.

**Foundational Technologies of QuizWire**

QuizWire is crafted using a stack of modern web technologies:

- **Angular**: The client-side of QuizWire is built with Angular, chosen for its robust framework that facilitates creating dynamic single-page applications, perfect for the interactive nature of a quiz interface.

  [Learn more about Angular](https://angular.io/)

- **Node.js with Express**: On the server side, QuizWire leverages Node.js with an Express.js framework to handle the chatbot's logic, process requests, and manage user interactions.

  [Discover Node.js](https://nodejs.org/en/)
  [Explore Express](https://expressjs.com/)

- **Wikidata Integration**: QuizWire utilizes Wikidata to automatically generate multiple-choice questions and answers. For each quiz topic, such as actresses, places, or things, the answers are sourced from Wikidata within the same domain, ensuring relevance and accuracy.

  [Dive into Wikidata](https://www.wikidata.org/)

- **Dialogflow**: This tool is integrated for its advanced natural language processing capabilities, which allow QuizWire to understand and interact with users in a conversational manner.

  [Check out Dialogflow](https://dialogflow.cloud.google.com/)

**The Interactive Quiz Experience**

Users engaging with QuizWire are presented with a series of multiple-choice questions, each accompanied by a relevant image. The potential answers are intelligently generated from Wikidata, ensuring that they are contextually appropriate for the image displayed.

**Prompt and Response Mechanics**

{{< figure src="quizwire_startquiz.png" id="quizwire_startquiz" >}}

Upon requesting a quiz, users are met with an enthusiastic challenge:

> I will ask you a series of multiple choice Questions
> If you answer them right you get a point of Awesomeness!
> If you answer them wrong you lose a life.
> You have 5 lives.
> The quiz is over when you have 0 lives.
> Go Get that highscore!

This playful engagement is heightened by the visual element—each question is paired with an image of an actress, place, or thing, and users select from four possible answers, all actresses if the image is of an actress, for example.

**Real-Time Feedback and Scoring**

As users interact with the quiz, they receive instant feedback. Correct answers increase their Awesomeness points, while incorrect ones result in a loss of lives. The quiz continues until all lives are lost.

{{< figure src="quizwire_wrongquestion.png" id="quizwire_wrongquestion" >}}

{{< figure src="quizwire_rightquestion.png" id="quizwire_rightquestion" >}}

**Sharing Achievements**

Concluding the quiz, participants can share their high scores via a link, promoting a competitive and social aspect to the experience.

**Conclusion**

QuizWire showcases the integration of Angular, Node.js, Wikidata, and Dialogflow to create an engaging and smart web-based quizbot.
