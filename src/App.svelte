<script>
	import SpriteAtlas from "./SpriteAtlas.svelte";
	import Footer from "./Footer.svelte";
    import { fade } from "svelte/transition";

	import { width, height } from "./store.js";
	import { error } from "./store.js";
	import { sprites } from "./store.js";
	import { switchTheme } from "./theme.js";
import Align from "./Align.svelte";

	let atlas;
	let expandError = false;

	function blurOnEnter(e) {
		if (e.keyCode === 13) {
			e.target.blur();
		}
	}

	let scrollY = 0;
	function onScroll() {
		scrollY = window.pageYOffset || document.documentElement.scrollTop;
	}
	window.addEventListener("scroll", onScroll);

	let saving = false;
	sprites.onSave((start) => {
		saving = !start;
	});

	let align;
</script>

<main on:drop={(e) => e.preventDefault()}>
	<header style="--scroll: {scrollY};">
		<h1>Sprite Packer</h1>
		{#if $error}
			<div class="error" on:click={() => (expandError = !expandError)}>
				<span>{$error.message}</span>
				{#if expandError}
					<br />
					<span class="exception">{$error.error}</span>
				{/if}
			</div>
		{/if}
		<div class="options">
			{#if saving && sprites.loaded}
				<span transition:fade={{duration: 200}}>Saving</span>
			{/if}
			<button on:click={() => atlas.download()}>Download</button>
			<div class="splitter" />
			<Align setStore={true}/>
			<div class="splitter" />
			<button on:click={() => atlas.clear()}>Clear</button>
			<div class="size-selector">
				<input
					value={$width}
					on:blur={(e) => ($width = e.target.value)}
					on:keydown={blurOnEnter}
					type="number"
					id="width"
					name="width"
					min="1"
					max="32"
				/>
				<span>x</span>
				<input
					value={$height}
					on:blur={(e) => ($height = e.target.value)}
					on:keydown={blurOnEnter}
					type="number"
					id="height"
					name="height"
					min="1"
					max="32"
				/>
			</div>
		</div>
	</header>
	<SpriteAtlas bind:this={atlas} />
	<Footer />
</main>

<style>
	header {
		position: sticky;
		top: 0;
		display: grid;
		grid-template-columns: max-content 1fr max-content;

		background: var(--c100);
		padding: 0.5rem 0rem;
		margin: 1rem 0rem 2rem 0rem;

		z-index: 100;
	}

	.error {
		color: white;
		background-color: #ff200088;
		border: 1px solid #ff2000;
		border-radius: 4px;

		align-self: center;
		justify-self: center;

		padding: 0.25em 0.5em;
	}

	.error .exception {
		font-size: 0.75em;
	}

	.options {
		display: flex;
		grid-column: 3;
		gap: 8px;
		align-items: center;
	}

	h1 {
		height: 2rem;
		color: var(--theme);
		text-transform: uppercase;
		margin: 0em;
		--font-size: max(calc(max(calc(4 - var(--scroll) / 50), 2) * min(max(1.5vw, 0.5em), 1em)), 2em);
		margin-top: calc(var(--font-size) / -4);
		font-size: var(--font-size);
		font-weight: 100;
		align-self: center;
		text-align: center;
	}

	button {
		align-self: center;
		justify-self: right;
		margin: 0;
	}

	.size-selector {
		display: grid;
		grid-template-columns: max-content max-content max-content;
		gap: 8px;

		align-self: center;
		justify-self: right;
		align-items: center;
	}

	.size-selector input {
		width: 4em;
		margin: 0;
	}

	.splitter {
		width: 4px;
		height: 1.2em;
		padding: 0.4em 0em;
	}

	main {
		text-align: center;
		padding: 0rem 2rem;
		max-width: 240px;
		margin: 0 auto;
	}

	/* @media (min-width: 640px) { */
		main {
			max-width: none;
		}
	/* } */
</style>
