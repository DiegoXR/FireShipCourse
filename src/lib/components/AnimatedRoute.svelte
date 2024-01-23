<script>
    import {fly} from "svelte/transition";
    import {page} from "$app/stores";
</script>

<!--when the url changes it will re render this div -->
{#key $page.url}

<!-- Apply this animation when this div first appears -->
<div in:fly = {{ x: '-100%', duration: 500 }}>

    <slot />
</div>
    
{/key}