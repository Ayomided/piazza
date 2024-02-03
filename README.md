
![Piazza_logo](.git_assets/WithBG.svg "Piazza Logo")
# Introduction
------------------------------------------------------------------------
This project is a course work which is a part of my assessment for my Cloud Computing Module at Birkbeck. My goal was to fulfil the criteria of the project while making sure to incorporate REST API design best practices in my folder structure and code development. 

Per the course work specifications, this application is required to use certain technologies, which were used during the duration of the module delivery in the semester. While there is room to utilise other tools. The list of requirements is as follows:
- Back end must be implemented in `Node.js`
- Communication between backend and front end must be doing using `Express.js`
- Application must have a database and in this case the database is in `MongoDB`
- Application must utilise VCS (Version Control System) such as `Git`
- Project must be deployed in as a Docker Container on a VM
- Project must implement Kubernetes and load balancing techniques, for orchestrating and scaling
*Optional*
- Develop a front end using any method of your choice
- Implement a CI/CD pipeline using terraform and GitHub actions

# Aims
------------------------------------------------------------------------
The task is to create a RESTful SaaS for a Twitter-like system called **Piazza**. In **Piazza**, users post messages for a particular topic while others browse posts. Also, users can like, dislike and comment on posts. As this is a part of a Cloud Computing Module, scalability is of utmost importance in the design and implementation of the software. 

The Piazza service should be able to do (but is not limited to) the following:
- Authorised users access the Piazza API using the OAuth v2 protocol to perform any interaction.
- Authorised users post a message for a particular topic in the Piazza API.
- Registered users browse messages per topic using the Piazza API.
- Registered users perform basic operations, including “like”, “dislike”, or “comment” a message posted for a topic.
- Authorised users could browse for the most active post per topic with the highest likes and dislikes.
- Authorised users could browse the history data of expired posts per topic.

# Objectives
------------------------------------------------------------------------
The successful completion of this project aligns with the outlined marking criteria and project description, ensuring that all objectives are met within the specified time frame. The defined objectives for the project encompass key aspects of software development, deployment, and testing. The following list encapsulates the pivotal objectives required for the project's success:

1. **Install and Deploy in Virtualized Environments:**
   - Install and deploy software within virtualized environments (GCP VM)
2. **Enforce Authentication/Verification Functionalities:**
   - Implement robust authentication and verification functionalities using OAuth V2 and `joi` packages to enhance the security and integrity of the application, fostering a secure user environment.
3. **Development of Piazza RESTful APIs:**
   - Thoroughly develop Piazza RESTful APIs, adhering to industry best practices and meeting the outlined course work specifications.
4. **Testing of Application:**
   - Conduct comprehensive testing of the application, test can be done using Postman and including screenshots and descriptions in final report or using test frameworks in JavaScript or Python.
5. **Deployment of Piazza Project in VM using Docker:**
   - Execute the deployment of the Piazza project within a virtual machine, you can deploy manually in the command line or using Docker Hub
6. **Deployment of Application in Kubernetes:**
   - Using Kubernetes clusters, increase the deployment reliability and scalability by including load balancers and replicas in your VM

By achieving these objectives, I aim to meet the expectations outlined in the project criteria.

# The Piazza System
------------------------------------------------------------------------
This section of the report will cover the phases as outlined in the project specification

## Phase A: Install and Deploy Software in Virtualized Environment
------------------------------------------------------------------------
#### Installation of Necessary Packages
Following the Class 5 lab instructions. **_(Warestack, 2023)_**, I performed the following actions to set up my virtual machine to deploy my software
```Bash
sudo apt-get update //to update my VM
sudo apt-get install docker.io //installing the docker image
```
#### Code Deployment
I pushed my code to GitHub and cloned it to my Piazza VM. More information about the VM specifications can be found in the appendix. 
```bash
git clone https://Ayomided:token@github.com/Ayomided/piazza-api.git
```
#### REST API Endpoints
Ensuring my endpoints were under my virtual machine's machine, I had an external IP of `34.27.217.6` which my service could be accessed from.

The list of endpoints for the service while running on my GCP VM on a docker container are listed below:
```http
GET https://34.27.217.6/status 
```

```http
GET https://34.27.217.6/api/v1/posts/ 
```

```http
GET https://34.27.217.6/api/v1/posts?topic=postTopic
```

```http
GET https://34.27.217.6/api/v1/posts?topic=postTopic&status=expired
```

```http
GET https://34.27.217.6/api/v1/posts/:postId
```

```http
GET https://34.27.217.6/api/v1/posts/activePosts/mostLikes
```

```http
GET https://34.27.217.6/api/v1/posts/activePosts/mostDislikes
```

```http
POST https://34.27.217.6/api/v1/posts/
```

```http
POST https://34.27.217.6/api/v1/posts/like/:postId
```

```http
POST https://34.27.217.6/api/v1/posts/dislike/:postId
```

```http
POST https://34.27.217.6/api/v1/posts/comment/:postId
```
#### Folder Structure
- `./src` - contains all the source code of the service
- `./src/controllers` - contains two controllers for user management and post interactions
- `./src/middlewares` - contains functions that make changes to the request and response objects. This includes the Authentication and Validation middleware.
- `./src/models` - contains the schema for both the Post and User data
- `./src/routes` - 
- `./node_module` - contains the packages needed for the service to run

## Phase B: Enforcing Authentication/Verification Functionalities
------------------------------------------------------------------------
The verification and authentication functionality was implemented as demonstrated in class using the `JsonWebToken` for authentication of user actions, `joi` for validation of user data and `bcrypt.js` for encryption, keeping our system secure and access reserved for authorised users only. 
#### The User Schema and Validation
```Javascript
// The User Schema
const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
	username: {
	...
	},
	email: {
	...
	},
	password: {
	...
	},
	date: {
	...
	}
})
module.exports = mongoose.model('User', userSchema)

// Joi performs input validation
const joi = require('joi')
const registerValidation = (data) => {
...
}
const loginValidation = (data) => {
...
}
module.exports = { registerValidation, loginValidation }
```
This is an example of how the user data is stored in the MongoDB database, to which validation will be performed on by `joi`. If the data inputted by the user doesn't meet the requirements set, the system passes an error. Provided the inputted data meets all the requirements, it is then passed to the authentication controller, where the user is registered or logged into the system. If the user is to be registered, the username and email are stored in the database along with a hash of the password created using `bcrypt.js`. This information is checked before an `auth-token` is generated for the user at login.
#### User Management
In the project specification, importance is placed on only granting access to users who had prior authentication and were performing interactions using an authentication token, this token is essential to perform all interactions with the system including liking a post, commenting on a post and creating a post. Through this security feature, it ensures that not just anyone has access to the system.
```Javascript
const verifyToken = require('../middlewares/authentication')
router.post('/', verifyToken, PostController.create_posts)
router.get('/pt/:postTopic', verifyToken, PostController.get_posts_topic)
```
In the above code, the `verifyToken` middleware checks that a user making a request has the necessary access in terms of the token and if they do, they will be able to perform the requests, else they will receive an "Access Denied" error. The `verifyToken` middleware is also passed to all requests to perform a check before interactions can be successful

## Phase C: Development of Piazza RESTful APIs
------------------------------------------------------------------------
#### The Piazza folder structure
```Directory
.
├── /README.md
├── /node_modules
├── /app.js
├── /.env
├── /.env_sample
├── /package-lock.json
├── /package.json
├── /test    
│    └── Piazza API Test Cases.postman_test_run.json/
└── /src
    ├── controllers/
    │   ├── AuthController.js
    │   └── PostController.js
    ├── middlewares/
    │   ├── authentication.js
    │   └── validation.js
    ├── models/
    │   ├── Post.js
    │   └── User.js
    └── routes/
        ├── auth.js
        ├── index.js
        └── post.js
```

Taking concepts from the class **_(Warestack, 2023)_** and looking to learn best practices, I structured the project folder and files to abstract functions and also package similar functionalities into the same files.
#### Controllers
Controllers will be responsible to get relevant data from the `req` object and pass it to the middleware and other services as need to return a response using the `res` object. In this project we have two controllers, processing the data for the authentication and also for the post interactions.
#### Routes
As part of the best `node.js` best practices, I took the initiative to also abstract the routes for the authentication and the posts. By doing this, I am able to keep a clean code and have similar functionalities in the same place.
#### Models
As part of the data access layer the Model is created using mongoose which connects to the MongoDB database. This helps with communication with the database.
```Javascript
const mongoose = require('mongoose')
const postSchema = mongoose.Schema({	
	title: {	
		type: String,
	}
	...
})
module.exports = mongoose.model('Post', postSchema)
```
#### Posts Data Structure
The post actions are handled using the Post controller and the routes are managed in the post route. The end point for the post follows this format

```http
GET localhost:3000/api/v1/posts
```
<center><em>Posts endpoint</em></center>

```JSON
{
	_id: new ObjectId('656b05f0ab676a231ab572b9'),
	title: 'Who is Jon Bellion?',
	topic: 'sport',
	username: 'dave24',
	location: 'California',
	message: 'He is the same,(you can see the genius)',
	expiration: 2023-12-02T10:25:48.648Z,
	status: 'live',
	likesUser: [],
	like: 0,
	dislikesUser: [],
	dislike: 0,
	commentsUser: [],
	comments: [],
	date: 2023-12-02T10:24:48.651Z,
	__v: 0
}
```

The comments, like, and dislikes store the` user_id` in an array to which is used to identify who performed an action on a post. It is also important to note that the dislike count drops when a like action is performed and vice versa. The `user_id` stored in the arrays also helps to stop the post owner from performing interactions on their own posts.

When the user sends out a post, this input is expected:

```JSON
{
	title: "String",
	topic: "String", //(which is the category) - tech, sport, politics, health
	username: "String", //(this is gotten based on the auth-token)
	location: "String",
	message: "String", 
	expiration: "Date" //(this uses the moment package to take input such as "2s" - for 2 seconds, "10m" - for 10 minutes and adds up to the current time. the status will then be updated when any interaction is perform to check if it is live or expired)
}
```

#### User Data Structure
```JSON
{
	username: "String",
	email: "String", // when a user attempts to login to the system the email isn't used at all
	password: "String" // passoword is stored as hash to ensure encryption in the system
}
```

```http
POST localhost:3000/api/v1/auth
```
<center><em>User endpoint</em></center>

The user database takes in the `username`, `email`, and `password` for the registration and only requires the `username`, and `password` to login in and access the Piazza services. 
## Phase D: Testing the Piazza Service
------------------------------------------------------------------------
Test for the service was done using postman and automated to test for all cases at once, the process included using `pm.test`, pre-request scripts to set variables. All 20 test cases included in the course work specification were achieved. The tests were performed on my local computer using `localhost`. The testing also accounts for the action points as mentioned in the Section 2 of the specification. 

The test case is implemented using for users, Olga, Nick, Mary and Nestor.
![Test Cases](.git_assets/1.png)
<center><em>Screenshot of test showing 'Access Denied' when a user performs an interaction without their token - Test case 3</em></center>

![Test Cases](.git_assets/3.png)
<center><em>Screenshot of test cases 9 - 11</em></center>

A detailed JSON containing the outcome of all test performed is also available in the test folder.
For every check of the test cases performed when a user is performing an interaction, the token is also checked to compare the token used in the `req.header` is the expected. This is possible by setting a `collectionVariables` in postman which allows comparing the tokens and also set default values.

```Javascript
pm.test("Token is Valid for Olga", () =>{
const headerResponse = pm.request.headers.get('auth-token')
pm.expect(headerResponse).to.eqls(pm.collectionVariables.get("olga_auth_token"))
})
```
![Test Cases](.git_assets/5.png)
<center><em>Screenshot of test cases 1 - 6</em></center>
![Test Cases](.git_assets/6.png)
<center><em>Screenshot of test cases 8 - 12</em></center>

## Phase E: Deploy your Piazza Project in VM using Docker and Deploying Application in Kubernetes
------------------------------------------------------------------------
#### Deployment in Docker
![Screenshot of the Docker Image build process for Piazza API](.git_assets/BuildProcess0000.png)
To deploy my software using Docker I cloned my `piazza-api` repository from GitHub, then created a `Dockerfile`, that is used to build the image. The image is then run in a container which is accessed using the VM's IP at `35.238.61.76/.`

```bash
git clone https://Ayomided:token@github.com/Ayomided/piazza-api.git
...
```

```bash
docker image build -t ayomided/piazza-api:1 .
docker container run -d --name piazza-api --publish 80:3000 piazza-api:1
```
![Screenshot of the Docker Image build process for Piazza API](.git_assets/BuildImages/BuildProcess1.png)
#### Deployment in Kubernetes
Using the Google Cloud Kubernetes Cluster and the Docker image I created earlier, I pushed the image to my Docker Hub repository `ayomided/piazza-api`.

```bash
docker push ayomided/piazza-api:1
```

When I perform a search on the docker hub using my username, I get a response with my `piazza-api `image, meaning the image was successfully pushed to the repository created

![Screenshot of the Docker Image build process for Piazza API](.git_assets/dockerPush.png)
Next, I created a Kubernetes Cluster (GKE Standard) named `piazza-api-cluster` with `nodes = 3`. I then connected to the cluster using the provided command 

```bash
gcloud container clusters get-credentials ...
```

To run my docker image in Kubernetes I created a `deployment.yaml` file, the file was deploying three replicas of the `piazza-api` app 

```bash
pico piazza-api-deployment.yaml

...

apiVersion: apps/v1
kind: Deployment
metadata:
  name: piazza-api-deployment
  labels:
    app: piazza-api 
spec:
  replicas: 3
  selector:
    matchLabels:
      app: piazza-api
  template:
    metadata:
      labels:
        app: piazza-api
    spec:
      containers:
      - name: piazza-api
        image: ayomided/piazza-api:1
        imagePullPolicy: Always
        ports:
        - containerPort: 3000

...

kubectl apply -f piazza-api-deployment.yaml
```

![Screenshot of the Kubernetes build process for Piazza API](.git_assets/KubeProcess.png)
I increased the number of `replicas` for my app from `3` to `10`., and applied the new configuration. Next, I added a `service.yaml` to deploy a load balancer. This will allow me to connect to HTTP traffic. This service will be exposed on `port:3000` for our app running in docker. 

```bash
apiVersion: v1
kind: Service
metadata:
  name: piazza-api-service
  labels:
    app: piazza-api-service
spec:
  type: LoadBalancer
  ports:
  - name: http
    port: 80
    protocol: TCP
    targetPort: 3000
  selector:
    app: piazza-api
  sessionAffinity: None
```

On applying this configuration, I get an external IP for my production environment in Kubernetes.
```bash
kubectl get services

NAME                 TYPE           CLUSTER-IP   EXTERNAL-IP   PORT(S)        AGE
kubernetes           ClusterIP      10.84.0.1    <none>        443/TCP        20m
piazza-api-service   LoadBalancer   10.84.1.92   34.41.212.4   80:32549/TCP 3m25s
```

This IP is then accessed in Postman, which shows my application is running as intended. 

![Screenshot of the Kubernetes build process for Piazza API](.git_assets/KubeEndpoint.png)

# Appendix
---
_Warestack. (2023). cc/Class-5 at master · warestack/cc_. [online] Available at: https://github.com/warestack/cc/tree/master/Class-5 [Accessed 8 Dec. 2023].

_Warestack. (2023). warestack/cc_. [online] Available at: https://github.com/warestack/cc/tree/master [Accessed 9 Dec. 2023].

David Adediji. (2023). _Postman · Piazza API Test Cases_. [online] Available at: https://www.postman.com/telecoms-geologist-12833832/workspace/piazza-public/collection/30501790-06d60d5c-f3fc-4627-8b45-cfc6f2f8f3c9?action=share&creator=30501790 [Accessed 9 Dec. 2023].

‌