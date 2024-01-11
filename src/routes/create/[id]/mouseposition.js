import { readable } from 'svelte/store';

// const subscribers = [];
// const lastMousePosition = { x: 0, y: 0 }

// let isSetup = false;
// function setupEventListener() {
// 	if (isSetup) return;
// 	isSetup = true;
// 	document.body.addEventListener("mousemove", move);
// }
// function removeEventListener() {
// 	isSetup = false;
// 	document.body.removeEventListener("mousemove", move);
// }
// function move(event) {
// 	lastMousePosition.x = event.clientX;
// 	lastMousePosition.y = event.clientY;

// 	subscribers.forEach(subscriber => {
// 		subscriber(lastMousePosition);
// 	});
// }

// const store = {
// 	subscribe(fn) {
// 		fn(lastMousePosition);
// 		subscribers.push(fn);
		
// 		setupEventListener();
// 		return () => {
// 			subscribers.splice(subscribers.indexOf(fn), 1);
// 			if (subscribers.length === 0) {
// 				removeEventListener();
// 			}
// 		}
// 	},
// }
// export default store;

export default readable({x:0, y:0}, (set) => {
	document.body.addEventListener("mousemove", move);
	
	function move(event) {
		set({
			x: event.clientX,
			y: event.clientY,
		});
	}
	
	return () => {
		document.body.removeEventListener("mousemove", move);
	}
})