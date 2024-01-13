<script>
	import { onMount } from "svelte";
	import * as d3 from "d3";
	import { get } from "svelte/store";
	import { log} from "./index.js";
	import { logs } from "./logstore.js";
	import { JsonView } from "@zerodevx/svelte-json-view";
	import AiOutlineClear from "svelte-icons-pack/ai/AiOutlineClear";
	import Icon from "svelte-icons-pack/Icon.svelte";

	let elem;
	let selected = null;
	let svg;


	onMount(() => {
		renderLogs();
	});

	function mergeSort(arr) {
		log({
			message: "Starting merge sort on array",
			arr: JSON.stringify(arr),
		});

		if (arr.length <= 1) {
			log(
				{
					message: "Returning single value",
				},
				arr
			);
			return arr;
		}

		const middle = Math.floor(arr.length / 2);
		const left = arr.slice(0, middle);
		const right = arr.slice(middle);

		return merge(mergeSort(left), mergeSort(right));
	}

	function merge(left, right) {
		log({
			message: "Merging",
			left,
			right,
		});
		let result = [];
		let leftIndex = 0;
		let rightIndex = 0;

		while (leftIndex < left.length && rightIndex < right.length) {
			if (left[leftIndex] < right[rightIndex]) {
				result.push(left[leftIndex]);
				log({
					message: "left index < right index",
					left: left[leftIndex],
					right: right[rightIndex],
					result: JSON.parse(JSON.stringify(result)),
				});
				leftIndex++;
			} else {
				result.push(right[rightIndex]);
				log({
					message: "left index >= right index",
					left: left[leftIndex],
					right: right[rightIndex],
					result: JSON.parse(JSON.stringify(result)),
				});
				rightIndex++;
			}
		}

		result = result
			.concat(left.slice(leftIndex))
			.concat(right.slice(rightIndex));

		log({
			message: "Returning from merge",
			result,
		});

		return result;
	}

	function buildGraph() {
		let logz = get(logs);
		const pos = {
			children: [],
		};
		let c = pos;

		for (let i = 0; i < logz.length; i++) {
			let log = logz[i];

			for (let j = log.stacks.length - 1; j >= 0; j--) {
				let stack = log.stacks[j];

				let found;

					found = c.children.find((childStack) => {
						if (j == log.stacks.length-1) {
							return 	childStack.stack.fileName === stack.fileName;

						}
						return (
							childStack.stack.calledFrom.col ==
								stack.calledFrom.col &&
							childStack.stack.calledFrom.function ==
								stack.calledFrom.function &&
							childStack.stack.calledFrom.line ==
								stack.calledFrom.line &&
							childStack.stack.fileName === stack.fileName
						);
					});
				

				if (found && j > 0) {
					c = found;
				} else {
					let newChild = {
						name: stack.name,
						children: [],
						log: log,
						stack: stack,
						i: i,
					};
					c.children.push(newChild);
					c = newChild;
				}
			}
			c = pos;
		}
		return pos;
	}

	function renderLogs() {
		const data = buildGraph();
		// Specify the charts’ dimensions. The height is variable, depending on the layout.
		const width = Math.floor(document.body.scrollWidth*0.6);
		const marginTop = 40;
		const marginRight = 10;
		const marginBottom = 10;
		const marginLeft = 40;

		// Rows are separated by dx pixels, columns by dy pixels. These names can be counter-intuitive
		// (dx is a height, and dy a width). This because the tree must be viewed with the root at the
		// “bottom”, in the data domain. The width of a column is based on the tree’s height.
		const root = d3.hierarchy(data);
		const dx = 20;
		const dy = (width - marginRight - marginLeft) / (1 + root.height);

		// Define the tree layout and the shape for links.
		const tree = d3.tree().nodeSize([dx, dy]);
		const diagonal = d3
			.linkHorizontal()
			.x((d) => d.y)
			.y((d) => d.x);

		// Create the SVG container, a layer for the links and a layer for the nodes.
		svg = d3
			.select(".canvas")
			.append("svg")
			.attr("width", width)
			.attr("height", dx)
			.attr("viewBox", [-marginLeft, -marginTop, width, dx])
			.attr(
				"style",
				"max-width: 100%; height: auto; font: 10px sans-serif; user-select: none;"
			);

		const gLink = svg
			.append("g")
			.attr("fill", "none")
			.attr("stroke", "#555")
			.attr("stroke-opacity", 0.4)
			.attr("stroke-width", 1.5);

		const gNode = svg
			.append("g")
			.attr("cursor", "pointer")
			.attr("pointer-events", "all");

		function update(event, source) {
			const duration = event?.altKey ? 2500 : 250; // hold the alt key to slow down the transition
			const nodes = root.descendants().reverse();
			const links = root.links();

			// Compute the new tree layout.
			tree(root);

			let left = root;
			let right = root;
			root.eachBefore((node) => {
				if (node.x < left.x) left = node;
				if (node.x > right.x) right = node;
			});

			const height = right.x - left.x + marginTop + marginBottom;

			const transition = svg
				.transition()
				.duration(duration)
				.attr("height", height)
				.attr("viewBox", [
					-marginLeft,
					left.x - marginTop,
					width,
					height,
				])
				.tween(
					"resize",
					window.ResizeObserver
						? null
						: () => () => svg.dispatch("toggle")
				);

			// Update the nodes…
			const node = gNode.selectAll("g").data(nodes, (d) => d.id);

			// Enter any new nodes at the parent's previous position.
			const nodeEnter = node
				.enter()
				.append("g")
				.attr(
					"transform",
					(d) => `translate(${source.y0},${source.x0})`
				)
				.attr("fill-opacity", 0)
				.attr("stroke-opacity", 0)
				.on("click", (event, d) => {
					if (!d.children && !d._children) {
						scrollIntoView(d.data.i);
					}
					d.children ? collapse(d) : expand(d);

					//d.children = d.children ? null : d._children;
					update(event, d);
				});

			nodeEnter
				.append("circle")
				.attr("r", 5)
				.attr("fill", (d) => {
					return d._children ? "#FFF" : "#78A1BB";
				})
				.attr("stroke-width", 10);

			nodeEnter
				.append("text")
				.attr("dy", (d) => {
					if (d.data.stack) {
						return d.data.stack.name ? "0.31em" : "-1rem";
					} else {
						return "0.31rem";
					}
				})
				.attr("x", (d) => (d._children ? -6 : 6))
				.attr("text-anchor", (d) => (d._children ? "end" : "start"))
				.text((d) => {
					if (d.data.stack) {
						return d.data.stack.name
							? d.data.stack.name
							: d.data.stack.fileName;
					} else {
						return "root";
					}
				})
				.style("font-size", "12px")
				.attr("fill", "#EBF5EE");

			// Transition nodes to their new position.
			const nodeUpdate = node
				.merge(nodeEnter)
				.transition(transition)
				.attr("transform", (d) => `translate(${d.y},${d.x})`)
				.attr("fill-opacity", 1)
				.attr("stroke-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			const nodeExit = node
				.exit()
				.transition(transition)
				.remove()
				.attr("transform", (d) => `translate(${source.y},${source.x})`)
				.attr("fill-opacity", 0)
				.attr("stroke-opacity", 0);

			// Update the links…
			const link = gLink
				.selectAll("path")
				.data(links, (d) => d.target.id);

			// Enter any new links at the parent's previous position.
			const linkEnter = link
				.enter()
				.append("path")
				.attr("d", (d) => {
					const o = { x: source.x0, y: source.y0 };
					return diagonal({ source: o, target: o });
				});

			// Transition links to their new position.
			link.merge(linkEnter).transition(transition).attr("d", diagonal);

			// Transition exiting nodes to the parent's new position.
			link.exit()
				.transition(transition)
				.remove()
				.attr("d", (d) => {
					const o = { x: source.x, y: source.y };
					return diagonal({ source: o, target: o });
				});

			// Stash the old positions for transition.
			root.eachBefore((d) => {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}

		// Do the first update to the initial configuration of the tree — where a number of nodes
		// are open (arbitrarily selected as the root, plus nodes with 7 letters).
		root.x0 = dy / 2;
		root.y0 = 0;
		root.descendants().forEach((d, i) => {
			d.id = i;
			d._children = d.children;
			if (d.depth && d.data.name?.length !== 7) d.children = null;
		});

		function expand(d) {
			if (d._children) {
				d.children = d._children;
				d._children = null;
			}

			var children = d.children ? d.children : d._children;
			update(null, d);
			if (children) children.forEach(expand);
		}
		function collapse(d) {
			if (d.children) {
				d._children = d.children;
				d._children.forEach(collapse);
				d.children = null;
			}
		}

		function expandAll() {
			expand(root);
		}

		//zupdate(null, root);
		expandAll();
		svg.node();
	}

	function scrollIntoView(i) {
		let uls = document.querySelector(".logcontainer > ul").children;

		if (!uls) return;
		uls[i].scrollIntoView({
			behavior: "smooth",
			block: "nearest",
			inline: "start",
		});
		uls[i].style.setProperty("--jsonKeyColor", "red", "");
		uls[i].style.setProperty("--jsonValStringColor", "red", "");

		if (selected != null) {
			uls[selected].style.setProperty("--jsonKeyColor", "", "");
			uls[selected].style.setProperty("--jsonValStringColor", "", "");
		}
		selected = i;
	}

	function clearLogs() {
		logs.set([]);

		if (elem) {
			elem.innerHTML = null;
		}
		renderLogs();
	}
	function getLogs(logs) {
		let l = [];
		logs.forEach((log) => {
			l.push(log.event);
		});
		return l;
	}
</script>

<svelte:head>
	<style>
		body {
			background: #02212e;
		}
	</style>
</svelte:head>
<div class="page">
	<div class="container">
		<div class="clear" on:click={clearLogs}>
			<Icon src={AiOutlineClear} color="white" size={24} />
		</div>
		<div bind:this={elem} class="canvas" />
	</div>
	{#key logs}
		<div class="logcontainer wrap">
			<JsonView json={getLogs($logs)} />
		</div>
	{/key}
</div>

<style>
	.clear {
		float: right;
		vertical-align: top;
		top: 0;
		right: 0;
		margin-top: 10px;
	}
	.wrap {
		font-family: monospace;
		font-size: 14px;
		--jsonBracketColor: rgb(197, 185, 185);
		--jsonKeyColor: rgb(197, 185, 185);
		--jsonValStringColor: #34d399;
		--jsonBorderLeft: 1px dotted gray;
		--jsonSeparatorColor: rgb(197, 185, 185);
	}

	.page {
		display: flex;
	}
	.log {
		margin-left: 5px;
		margin-top: 5px;
	}
	.container {
		width: 70%;
	}
	.grid {
		width: 100vw;
		height: 20vh;
		display: grid;
		grid-template-rows: repeat(100, 1fr);
		grid-template-columns: repeat(100, 1fr);
	}
	.tree {
		margin-left: 100px;
	}
	.logcontainer {
		background: #02212e;
		height: 100vh;
		overflow: scroll;
		margin-left: 100px;
		width: 30%;
	}
</style>
