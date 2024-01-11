# Svelte (Visual) Logger

Renders a dendogram of logs from the function call stack.

<p align="center">
  <img src="https://i.imgur.com/jutkVST.jpg" alt="Merge sort">
</p>

## Install
npm i svelte-logger

## Usage

In any file you want to log
```
<script>
    import { onMount } from 'svelte';
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
Rendering the logs. In any component where you want the logs to render.
```
<script>
	import LogView from 'svelte-logger/LogView.svelte';	
</script>

<LogView/>
```


