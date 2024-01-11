<script>
    import { onMount } from "svelte";
	import { log, logs, } from "$lib/index.js";

    let grid = [];
    let width = 100;
    let height = 50;
    let html = "<input></input>";
    let objs = {};
    let m = { x: 0, y: 0 };

    let repl;
    let gap = 1;
    let clickedObj;
    let z = 200;
    let q = 10;
    function handleMousemove(event) {

        m.x = event.clientX;
        m.y = event.clientY;
        const gridX = Math.floor((m.x-300) / 10);
            const gridY = Math.floor(m.y / 10);
            console.log(gridX, gridY)

        if (clickedObj) {
            const gridX = Math.floor((m.x-200)  / 10);
            const gridY = Math.floor(m.y / 10);

            objs[`${gridY},${gridX}`] = clickedObj;
            objs[`${clickedObj.pos.y},${clickedObj.pos.x}`] = null;

            clickedObj.pos = {
                x: gridX,
                y: gridY,
            };
            objs[`${gridY},${gridX}`] = clickedObj;
            console.log(gridX, gridY);
            objs = objs;
        }
        console.log(objs);
    }
    
    let down = false;
    function mouseup() {
        if (clickedObj) {
            clickedObj = null;
        }
    }
    let loaded =false;

    onMount(() => {
        document.body.addEventListener("mousemove", handleMousemove);
        document.body.addEventListener("mouseup", mouseup);

        for (let i = 0; i < width; i++) {
            let row = [];
            for (let j = 0; j < height; j++) {
                row.push({});
            }
            grid.push(row);
        }
        grid = grid;
        objs["1,1"] = {
            pos: {
                x: 1,
                y: 1,
            },
            value: html,
        };
        log({
            message:"Hello from this page"
        })
    });

    function click(i, j) {
        let obj = objs[`${i},${j}`];
        clickedObj = obj;
    }
</script>

<div class="page">
    <div class="sidebar">
        <textbox />
    </div>
    <div class="wrapper">
        {#each grid as col, i}
            {#each col as row, j}
                {#if objs[`${i},${j}`]}
                    <div
                        class="inner"
                        style={`grid-row: ${i}; grid-column:${j}`}
                        on:mousedown={() => click(i, j)}
                    >
                        {@html objs[`${i},${j}`].value}
                    </div>
                {/if}
                <div />
            {/each}
        {/each}
    </div>
</div>

<style>
    .page {
        display: flex;
    }
    .inner {
        position: relative;
    }
    .sidebar {
        width: 200px;
        height: 100%;
    }
    .wrapper {
        display: inline-grid;
        grid-template-columns: repeat(100, 10px);
        grid-template-rows: repeat(50, 10px);
        border: 1px solid black;
        grid-gap: 1px;
        background-color: black;
    }

    .wrapper > div {
        background-color: white;
        padding: 1px;
        text-align: center;
    }
</style>
