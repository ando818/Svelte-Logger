<script>
    import { onMount } from "svelte";
	import { log } from "$lib/index.js";

    log('koko')
    onMount(() => {
    
        log({
            message:"Hello from this page"
        })
    });

</script>
