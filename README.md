# Svelte (Visual) Logger

Renders a dendogram of logs from the function call stack. Clicking on any logs will scroll to it and clicking on any other node will expand/collapse it.
Logs within any particular file will be rendered from top to bottom.

https://github.com/ando818/Svelte-Logger/assets/67844237/e77e5756-1a98-400b-9e5f-c8d01a8f8e4e

<p align="center">
  <img src="https://i.imgur.com/YM5iCHc.png" alt="Logs from different components in different places">
</p>

## Install
npm i svelte-logger

## Usage

### Logging 
In any file you want to log
```
<script>
import { onMount } from 'svelte';
import { log } from 'svelte-logger';

onMount(() => {
   log("Hello");
   log({
   	message: "Hello",
	item: {
		name: "Potatoes"
            }
        )
    }
</script>
```
### Rendering 
In any component where you want the logs to render (preferably an empty page)
```
<script>
import LogView from 'svelte-logger/LogView.svelte';	
</script>

<LogView/>
```

### Disable console logs 
From any file
```
 import { logToConsole } from 'svelte-logger';
 logToConsole(false);
```

## Limitations
1. Logs on initial server start can't be rendered in the graph.
2. Logs on initial server load will be ignored.
3. Logs from different components will not necessarily show in top to bottom order.
4. Paths from imports aren't followed, and will show logs in the imported module at the root of the graph.
5. Some others I haven't discovered yet.
6. Have not tried server side logs yet, so not sure what will happen in those cases
