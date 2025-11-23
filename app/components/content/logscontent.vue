<template>
	<li>
		<hr />
		<div class="timeline-middle">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/>
			</svg>
		</div>
		<div class="timeline-start mb-10 md:text-end">
			<time class="text-base-content/75 font-mono italic"><slot name="time" /></time>
			<div class="text-base-content text-lg font-black"><slot name="title" /></div>
			<div class="text-base-content/75"><slot name="content" /></div>
		</div>
		<hr />
	</li>
</template>
