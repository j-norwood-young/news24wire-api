const puppeteer = require("puppeteer");
require("dotenv").config();
const rest = require("restler-bluebird");
const moment = require("moment");

(async () => {
	var storedArticleData = await rest.get(process.env.API_ENDPOINT + `?fields=provider_uid&filter[provider]=News24`, {
		username: process.env.API_USERNAME,
		password: process.env.API_PASSWORD
	});
	var storedArticles = storedArticleData.data;
	
	// Load the site
	const browser = await puppeteer.launch({ headless: true, timeout: 5000 });
	const page = await browser.newPage();
	
	console.log("Loading url", process.env.LOGIN_URL);
	await page.goto(process.env.LOGIN_URL);
	
	// Login
	await page.waitForSelector("#username");

	await page.type("#username", process.env.USERNAME);
	await page.type("#password", process.env.PASSWORD);
	await page.click("#login-form > div.row-fluid > div:nth-child(1) > div:nth-child(6) > div > input");
	await page.waitForSelector("#header-sign-in");
	
	console.log("Loading url", process.env.URL);
	await page.goto(process.env.URL);
	await page.waitForSelector(".newswire-header");

	let articleElements = await page.$$(".newswire-header");
	let articles = [];
	let cookies = await page.cookies();
	let aspSessId = null;
	for (let cookie of cookies) {
		let name = await cookie.name;
		if (name === "ASP.NET_SessionId")
			aspSessId = await cookie.value;
	}
	for (let articleEl of articleElements) {
		let urlEl = await articleEl.getProperty("href");
		let url = await urlEl.jsonValue();
		let id = url.replace(process.env.URL + "#", "");
		let exists = storedArticles.find(
			storedArticle =>
				storedArticle.provider_uid === id
		);
		if (!exists) {
			console.log({ id });
			let article = await rest.get(`http://www.galloimages.co.za/newswire/download?id=${ id }&extension=json`, { headers: { Host: "www.galloimages.co.za", Cookie: `ASP.NET_SessionId=${aspSessId}` }});
			let jsonResponse = JSON.parse(article);
			let data = {
				headline: jsonResponse.headline,
				blurb: jsonResponse.slugline,
				provider_uid: id,
				body: jsonResponse.body.value,
				byline: jsonResponse.author,
				provider: "News24",
				date: jsonResponse.dateCreated,
				keywords: jsonResponse.tags,
			}
			await rest.post(process.env.API_ENDPOINT, {
				data,
				username: process.env.API_USERNAME,
				password: process.env.API_PASSWORD
			});
		}
	}

	console.log("Done")
	browser.close();
})();
