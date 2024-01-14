import { log } from "$lib/index.js";

export async function load({ params }) {
    let post = {
        name: "Article 1"
    }
    log({
        message: "Loading data",
        data: post
    })
	return post;
}