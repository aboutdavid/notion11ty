# notion11ty
Use notion as a CMS in 11ty. Can be used with anything else, but was specifically designed with 11ty in mind. Requires tinkering and browsing the source code to use. It exposes the following object to use in your templates:

```
title: "Why do cockroaches exist?",
date: "MMMM do[,] YYYY"
html: "<p>Hello and welcome</p>...",
readTime: "5 min read",
slug: "why-do-cockroaches-exist",
description: "Hello and welcome (150 chars or less)",
```
### Table setup
The code automagically is setup to use this table structure 
![](https://doggo.ninja/lfdgYE.png)

### env setup
`NOTION_API_KEY` is an API key for notion, used for fetching posts

`NOTION_API_TABLE` is the table ID, where the post is fetched from

`COOKIE` is for downloading the post images, used with [notion-exporter](https://npm.im/notion-exporter). It's the cookie named "token_v2"

Put it in the root folder and it should work.

![](https://doggo.ninja/HRmLaD.png)

### What each file does

`_data/posts.js`

Fetches the post content and rewrites the HTML to use the weird image path format

`.eleventy.js`

Uses imageResolve.js to download images

`imageResolve.js`

Downloads images and places them in the \_site folder to be published
