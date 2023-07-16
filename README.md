# Blog API

A REST API only back-end serving JSON to two front-ends as part of a full-stack Blog application. Written with the Node/Express framework and uses Mongoose/MongoDB for a database. Utilizes PassportJS and JSON Web Token for User Authentication and route protection. Also leverages Cloudinary API for asset management and Markdown for more robust content.

Penultimate project in the NodeJS course of the Full Stack JavaScript curriculum @ [The Odin Project](https://www.theodinproject.com/lessons/nodejs-blog-api).

Link to Blog CMS @ [https://github.com/beejathon/blog-cms](https://github.com/beejathon/blog-cms)
Link to Blog Client @ [https://github.com/beejathon/portfolio](https://github.com/beejathon/portfolio)

Live demo @ [https://beejathon.github.io/portfolio/#/portfolio/blog](https://beejathon.github.io/portfolio/#/portfolio/blog)

## Technologies used

<p align="left"> 
<a href="https://nodejs.org/en" target="_blank"> 
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original-wordmark.svg" alt="NodeJS" width="40" height="40"/> </a>
<a href="https://expressjs.com/" target="_blank"> 
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" alt="Express" width="40" height="40" /> </a>
<a href="https://www.mongodb.com/" target="_blank"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original-wordmark.svg" alt="MongoDB" width="40" height="40" />  </a>
<a href="https://www.npmjs.com/package/marked" target="_blank">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg" alt="Markdown" width="40" height="40" /></a>
<a href="https://cloudinary.com/" target="_blank">
<img src="https://cloudinary-marketing-res.cloudinary.com/image/upload/c_pad,b_auto:predominant,fl_preserve_transparency/v1638385862/cloudinary_cloud_glyph_blue_png.jpg?_s=public-apps" alt="Cloudinary" width="40" height="40" /></a></a>
</p>
   

## Reflection

I spent a lot of time at the beginning testing my routes and making sure authentication worked using Postman and this definitely paid off in the end with less routing related bugs encountered. Originally I had intended to store images on this server but shortly realized this wouldn't be viable with the free tiers of serer hosting I'd be using. In the end I was very happy to find a free and easy to use asset management solution in Cloudinary. I also spent some time learning about Markdown to make the blog content more robust as well as how to safely sanitize data sent from a user.