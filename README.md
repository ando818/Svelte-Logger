# Svelte (Visual) Logger

Renders a dendogram of logs from the function call stack. Clicking on any logs will scroll to it and clicking on any other node will expand/collapse it.
Logs within any particular file will be rendered from top to bottom.

https://github.com/ando818/Svelte-Logger/assets/67844237/b59366cd-2b48-44f8-b9c6-be649a2cb74e

<p align="center">
  <img src="https://i.imgur.com/YM5iCHc.png" alt="Logs from different components in different places">
</p>

## Install
npm i svelte-logger

## Usage

In any file you want to log
```
<script>
    import { onMount } from 'svelte';

https://github.com/ando818/Svelte-Logger/assets/67844237/dc66182a-ad9f-439f-a2f3-c9ea9be8d3b5


  	import { log } from 'svelte-logger';

    onMount(() => {
      log("hello");
      log({
            message: "Hello",
            item: {
                  name: "Potatoes"
            }
        )
    }
</script>
```

To disable the logs going to console. From any file
```
 import { logToConsole } from 'svelte-logger';
 logToConsole(false);
```

Rendering the logs. In any component where you want the logs to render.
```
<script>
	import LogView from 'svelte-logger/LogView.svelte';	
</script>

<LogView/>
```

## Limitations
1. Logs on initial server start can't be rendered in the graph.
2. Logs on initial server load will be ignored.
3. Logs from different components will not necessarily show in top to bottom order.
4. Paths from imports aren't followed, and will show logs in the imported module at the root of the graph.
5. Some others I haven't discovered yet. 
