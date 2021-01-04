import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb";
import path from "path";

// Construct a document
let blogs = [
	{ name: "learn-react", upvotes: 0, comments: [] },
	{
		name: "learn-node",
		upvotes: 0,
		comments: [],
	},
	{
		name: "my-thoughts-on-resumes",
		upvotes: 0,
		comments: [],
	},
];

const app = express();
// const uri = "mongodb://localhost:27017";
const uri =
	"mongodb+srv://react-full-stack-website-aws_user:react-full-stack-website-aws_user@react-full-stack-websit.0ostt.mongodb.net/my-blog?retryWrites=true&w=majority";
const Port = process.env.Port || 8000;

app.use(express.static(path.join(__dirname, "/build")));
app.use(bodyParser.json());

const withDB = async (operations, res) => {
	try {
		const client = await MongoClient.connect(uri, {
			useNewUrlParser: true,
		});
		const db = client.db("my-blog");

		// // Use the collection "people"
		// const col = db.collection("articles");

		// const p = await col.insertMany(blogs);
		// console.log(p);

		console.log("...................");
		console.log("Database Connected");
		console.log("...................");

		await operations(db);

		client.close();
	} catch (error) {
		res.status(500).json({ message: "Error connecting to db", error });
	}
};

withDB(() => {}, null);

// app.get("/hello", (req, res) => res.send("Hello!"));
// app.get("/hello/:name", (req, res) => res.send(`Hello ${req.params.name}`));
app.post("/hello", (req, res) => res.send(`Hello ${req.body.name}!`));

// ! NOT WORKING FOR NOW - FETCHING ALL DATA FROM DB
// app.get("/api/articles-list", async (req, res) => {
// 	withDB(async (db) => {
// 		const articlesList = await db.collection("articles").find({});
// 		console.log(articlesList.json());

// 		res.status(200).json(articlesList);
// 	}, res);
// });

app.get("/api/articles/:name", async (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name;

		const articleInfo = await db.collection("articles").findOne({ name: articleName });

		res.status(200).json(articleInfo);
	}, res);
});

app.post("/api/articles/:name/upvote", async (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name;

		const articleInfo = await db.collection("articles").findOne({ name: articleName });

		await db.collection("articles").updateOne(
			{ name: articleName },
			{
				$set: {
					upvotes: articleInfo.upvotes + 1,
				},
			}
		);

		const updatedArticleInfo = await db.collection("articles").findOne({ name: articleName });

		res.status(200).json(updatedArticleInfo);
	}, res);
});

app.post("/api/articles/:name/add-comment", (req, res) => {
	const { username, text } = req.body;
	const articleName = req.params.name;

	console.log(username, text, articleName);

	withDB(async (db) => {
		const articleInfo = await db.collection("articles").findOne({ name: articleName });
		await db.collection("articles").updateOne(
			{ name: articleName },
			{
				$set: {
					comments: articleInfo.comments.concat({ username, text }),
				},
			}
		);
		const updatedArticleInfo = await db.collection("articles").findOne({ name: articleName });

		res.status(200).json(updatedArticleInfo);
	}, res);
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(Port, () => console.log("Listening on Port " + Port)); // http://localhost:8000/hello
