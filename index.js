require("dotenv").config();
const axios = require("axios");

(async () => {
	try {
		const url = `${process.env.API_ENDPOINT}?fields=provider_uid&filter[provider]=News24&limit=100&sort[date_created]=-1`;
		var already_fetched = (await axios.get( url, {
			auth: {
				username: process.env.API_USERNAME,
				password: process.env.API_PASSWORD
			}
		})).data.data;
		
		const login = (await axios.post(`${process.env.URL}/accounts/login`, {
			userName: process.env.USERNAME,
			password: process.env.PASSWORD
		})).data;
		console.log(login);
		const headers = {'Authorization': `bearer ${login.token}`}
		const article_list = (await axios.get(`${process.env.URL}/newsfeeds/stories/breakingauth?q=&fromDate=0&toDate=${new Date().getTime() }&limit=100`, { headers })).data.filter(article => (already_fetched.find(fetched => fetched.provider_uid === article.id) == undefined));
		console.log(article_list);
		for (let article_meta of article_list) {
			let article = (await axios.get(`${process.env.URL}/newsFeeds/${article_meta.id}`, { headers })).data;
			let data = {
				headline: article.headline,
				blurb: article.slugline,
				provider_uid: article.id,
				body: article.body,
				byline: article.author,
				provider: "News24",
				date: article.dateCreated,
				keywords: article.keywords,
			}
			console.log(data);
			await axios.post(process.env.API_ENDPOINT,
				data,
				{ 
					auth: {
						username: process.env.API_USERNAME,
						password: process.env.API_PASSWORD
					}
				}
			);
		}
		console.log("Done")
	} catch(err) {
		console.error(err);
	}
})();
